import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const charge = await prisma.charge.update({
    where: { charge_id: Number(id) },
    data: {
      program_id:       body.program_id       != null ? Number(body.program_id) : undefined,
      staff_id:         body.staff_id         != null ? Number(body.staff_id) : undefined,
      charge_type:      body.charge_type      || undefined,
      charge_date:      body.charge_date      ? new Date(body.charge_date) : undefined,
      amount:           body.amount           != null ? body.amount : null,
      description:      body.description      != null ? (body.description || null) : undefined,
      reference_number: body.reference_number != null ? Number(body.reference_number) : undefined,
      status:           body.status           || undefined,
      approved_by:      body.approved_by      != null ? (body.approved_by ? Number(body.approved_by) : null) : undefined,
      notes:            body.notes            != null ? (body.notes || null) : undefined,
    },
  })
  return NextResponse.json(charge)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.charge.delete({ where: { charge_id: Number(id) } })
  return new NextResponse(null, { status: 204 })
}
