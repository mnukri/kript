import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.globalRole !== 'admin' && session.user.globalRole !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { user_id: 'asc' },
    include: { staff: { select: { first_name: true, last_name: true } } },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user.globalRole
  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, global_role } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Managers can only create staff-level users
  const assignedRole = role === 'manager' ? 'staff' : (global_role ?? 'staff')

  const staff = await prisma.staff.findUnique({ where: { email } })
  if (!staff) {
    return NextResponse.json({ error: 'No staff member found with that email' }, { status: 404 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { staff_id: staff.staff_id, email, global_role: assignedRole },
    include: { staff: { select: { first_name: true, last_name: true } } },
  })
  return NextResponse.json(user, { status: 201 })
}
