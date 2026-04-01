import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Entry {
  date:       string
  program_id: number
  hours:      number
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { staff_id, entries, charges } = body as {
    staff_id: number
    entries:  Entry[]
    charges:  {
      program_id: number; charge_type: string; amount: number; description: string
      reference_number: string; vendor?: string; category?: string
      destination?: string; trip_purpose?: string; departure_date?: string; return_date?: string
    }[]
  }

  // Lookup annual salary for effort charge amounts
  const salaryRecord = await prisma.staffSalary.findFirst({
    where: { staff_id: Number(staff_id), end_date: null },
  })
  const annualSalary  = salaryRecord ? Number(salaryRecord.annual_salary) : 0
  const dailySalary   = annualSalary / 260  // ~5 days × 52 weeks

  // Group entries by date to compute per-date percentages
  const byDate = new Map<string, Entry[]>()
  for (const e of entries) {
    if (e.hours <= 0) continue
    const list = byDate.get(e.date) ?? []
    list.push(e)
    byDate.set(e.date, list)
  }

  const results = await prisma.$transaction(async (tx) => {
    const effortEntries = []
    const effortCharges = []

    for (const [date, dayEntries] of byDate) {
      const totalHours = dayEntries.reduce((s, e) => s + e.hours, 0)
      const effortDate = new Date(date + 'T00:00:00Z')

      for (const e of dayEntries) {
        const pct = parseFloat(((e.hours / totalHours) * 100).toFixed(2))

        const entry = await tx.effortEntry.upsert({
          where: {
            staff_id_program_id_effort_date: {
              staff_id:    Number(staff_id),
              program_id:  Number(e.program_id),
              effort_date: effortDate,
            },
          },
          update: { percentage: pct, notes: `${e.hours}h of ${totalHours}h` },
          create: {
            staff_id:    Number(staff_id),
            program_id:  Number(e.program_id),
            effort_date: effortDate,
            percentage:  pct,
            notes:       `${e.hours}h of ${totalHours}h`,
          },
        })
        effortEntries.push(entry)

        if (annualSalary > 0) {
          const chargeAmount = parseFloat((dailySalary * (e.hours / totalHours)).toFixed(2))
          const charge = await tx.charge.create({
            data: {
              program_id:       Number(e.program_id),
              staff_id:         Number(staff_id),
              charge_type:      'effort',
              charge_date:      effortDate,
              amount:           chargeAmount,
              description:      `${e.hours}h effort — ${date}`,
              reference_number: 1,
              status:           'submitted',
            },
          })
          effortCharges.push(charge)
        }
      }
    }

    // Create purchase / travel charges
    const expenseCharges = await Promise.all(
      charges
        .filter((c) => c.amount > 0 && c.program_id)
        .map(async (c) => {
          // Use the first entry date, or today
          const chargeDate = entries[0]?.date
            ? new Date(entries[0].date + 'T00:00:00Z')
            : new Date()

          const charge = await tx.charge.create({
            data: {
              program_id:       Number(c.program_id),
              staff_id:         Number(staff_id),
              charge_type:      (c.charge_type as 'purchase' | 'travel') || 'purchase',
              charge_date:      chargeDate,
              amount:           c.amount,
              description:      c.description || null,
              reference_number: c.reference_number ? Number(c.reference_number) : 1,
              status:           'submitted',
            },
          })

          if (c.charge_type === 'purchase' && (c.vendor || c.category)) {
            await tx.chargePurchaseDetails.create({
              data: { charge_id: charge.charge_id, vendor: c.vendor || null, category: c.category || null },
            })
          }
          if (c.charge_type === 'travel' && c.departure_date && c.return_date) {
            await tx.chargeTravelDetails.create({
              data: {
                charge_id:      charge.charge_id,
                destination:    c.destination    || null,
                trip_purpose:   c.trip_purpose   || null,
                departure_date: new Date(c.departure_date + 'T00:00:00Z'),
                return_date:    new Date(c.return_date    + 'T00:00:00Z'),
              },
            })
          }
          return charge
        })
    )

    return { effortEntries, effortCharges, expenseCharges }
  })

  return NextResponse.json(results, { status: 201 })
}
