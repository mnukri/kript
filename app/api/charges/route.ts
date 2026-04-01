import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const charges = await prisma.charge.findMany({ orderBy: { charge_date: 'desc' } })
  return NextResponse.json(charges)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const charge = await prisma.charge.create({
    data: {
      program_id:       Number(body.program_id),
      staff_id:         Number(body.staff_id),
      charge_type:      body.charge_type,
      charge_date:      new Date(body.charge_date),
      amount:           body.amount           != null ? body.amount : null,
      description:      body.description      || null,
      reference_number: body.reference_number ? Number(body.reference_number) : 1,
      status:           body.status           || 'draft',
      approved_by:      body.approved_by      ? Number(body.approved_by) : null,
      notes:            body.notes            || null,
    },
  })
  return NextResponse.json(charge, { status: 201 })
}
