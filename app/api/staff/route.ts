import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { last_name: 'asc' } })
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const staff = await prisma.staff.create({
    data: {
      first_name: body.first_name,
      last_name:  body.last_name,
      email:      body.email      || null,
      job_title:  body.job_title  || null,
      department: body.department || null,
      hire_date:  body.hire_date  ? new Date(body.hire_date) : null,
      is_active:  body.is_active  ?? true,
    },
  })
  return NextResponse.json(staff, { status: 201 })
}
