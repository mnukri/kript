import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const expenses = await prisma.programExpense.findMany({ orderBy: { expense_date: 'desc' } })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const expense = await prisma.programExpense.create({
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
  return NextResponse.json(expense, { status: 201 })
}
