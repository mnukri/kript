import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const staff = await prisma.staff.update({
    where: { staff_id: Number(id) },
    data: {
      first_name: body.first_name,
      last_name:  body.last_name,
      email:      body.email      || null,
      job_title:  body.job_title  || null,
      department: body.department || null,
      hire_date:  body.hire_date  ? new Date(body.hire_date) : null,
      is_active:  body.is_active,
    },
  })
  return NextResponse.json(staff)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.staff.delete({ where: { staff_id: Number(id) } })
  return new NextResponse(null, { status: 204 })
}
