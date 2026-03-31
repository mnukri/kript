import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const charges = await prisma.programSalaryCharge.findMany({ orderBy: { charge_month: 'desc' } })
  return NextResponse.json(charges)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const charge = await prisma.programSalaryCharge.create({
    data: {
      program_id:         Number(body.program_id),
      staff_id:           Number(body.staff_id),
      charge_month:       new Date(body.charge_month),
      amount_charged:     body.amount_charged,
      applied_percentage: body.applied_percentage ?? null,
    },
  })
  return NextResponse.json(charge, { status: 201 })
}
