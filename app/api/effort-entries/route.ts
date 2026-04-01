import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const staff_id   = searchParams.get('staff_id')
  const program_id = searchParams.get('program_id')

  const entries = await prisma.effortEntry.findMany({
    where: {
      ...(staff_id   ? { staff_id:   Number(staff_id)   } : {}),
      ...(program_id ? { program_id: Number(program_id) } : {}),
    },
    orderBy: { effort_date: 'desc' },
    include: { program: true, staff: true },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.effortEntry.create({
    data: {
      staff_id:    Number(body.staff_id),
      program_id:  Number(body.program_id),
      effort_date: new Date(body.effort_date),
      percentage:  body.percentage,
      notes:       body.notes || null,
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
