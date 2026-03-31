import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const program = await prisma.program.update({
    where: { program_id: Number(id) },
    data: {
      program_name: body.program_name,
      worktag:      body.worktag,
      status:       body.status,
      pop_start:    body.pop_start    ? new Date(body.pop_start) : null,
      pop_end:      body.pop_end      ? new Date(body.pop_end)   : null,
      total_budget: body.total_budget || null,
      sponsor:      body.sponsor      || null,
      grant_number: body.grant_number || null,
    },
  })
  return NextResponse.json(program)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.program.delete({ where: { program_id: Number(id) } })
  return new NextResponse(null, { status: 204 })
}
