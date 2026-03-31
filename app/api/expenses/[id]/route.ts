import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const expense = await prisma.programExpense.update({
    where: { expense_id: Number(id) },
    data: {
      program_id:       Number(body.program_id),
      staff_id:         body.staff_id ? Number(body.staff_id) : null,
      expense_date:     new Date(body.expense_date),
      amount:           body.amount,
      category:         body.category         || null,
      vendor:           body.vendor           || null,
      description:      body.description      || null,
      reference_number: body.reference_number || null,
    },
  })
  return NextResponse.json(expense)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.programExpense.delete({ where: { expense_id: Number(id) } })
  return new NextResponse(null, { status: 204 })
}
