import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const programs = await prisma.program.findMany({ orderBy: { program_name: 'asc' } })
  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const program = await prisma.program.create({
    data: {
      program_name: body.program_name,
      worktag:      body.worktag,
      status:       body.status       || 'active',
      pop_start:    body.pop_start    ? new Date(body.pop_start) : null,
      pop_end:      body.pop_end      ? new Date(body.pop_end)   : null,
      total_budget: body.total_budget || null,
      sponsor:      body.sponsor      || null,
      grant_number: body.grant_number || null,
    },
  })
  return NextResponse.json(program, { status: 201 })
}
