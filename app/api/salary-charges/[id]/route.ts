import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const charge = await prisma.programSalaryCharge.update({
    where: { charge_id: Number(id) },
    data: {
      program_id:         Number(body.program_id),
      staff_id:           Number(body.staff_id),
      charge_month:       new Date(body.charge_month),
      amount_charged:     body.amount_charged,
      applied_percentage: body.applied_percentage ?? null,
    },
  })
  return NextResponse.json(charge)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.programSalaryCharge.delete({ where: { charge_id: Number(id) } })
  return new NextResponse(null, { status: 204 })
}
