import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns the distinct active programs this staff member has effort entries for
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entries = await prisma.effortEntry.findMany({
    where:   { staff_id: Number(id) },
    include: { program: true },
    orderBy: { effort_date: 'desc' },
    distinct: ['program_id'],
  })
  return NextResponse.json(entries.map((e) => ({ program_id: e.program_id, program: e.program })))
}
