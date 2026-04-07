import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { prisma } from '@/lib/prisma'

async function loadUser(oid: string, email: string) {
  // 1. Match by OID — returning user
  let user = await prisma.user.findUnique({
    where: { microsoft_oid: oid },
    include: { permissions: { select: { program_id: true, access_level: true } } },
  })
  if (user) return user

  // 2. Match by email — pre-created by a manager, link OID now
  const byEmail = await prisma.user.findUnique({
    where: { email },
    include: { permissions: { select: { program_id: true, access_level: true } } },
  })
  if (byEmail) {
    return prisma.user.update({
      where: { user_id: byEmail.user_id },
      data:  { microsoft_oid: oid },
      include: { permissions: { select: { program_id: true, access_level: true } } },
    })
  }

  // 3. Email matches a staff record — self sign-up, auto-create as staff role
  const staff = await prisma.staff.findUnique({ where: { email } })
  if (staff) {
    return prisma.user.create({
      data: { staff_id: staff.staff_id, email, microsoft_oid: oid, global_role: 'staff' },
      include: { permissions: { select: { program_id: true, access_level: true } } },
    })
  }

  return null
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const oid   = (profile as { oid?: string }).oid ?? profile.sub!
        const email = profile.email ?? ''
        const user  = await loadUser(oid, email)
        if (user) {
          token.userId      = user.user_id
          token.staffId     = user.staff_id
          token.globalRole  = user.global_role
          token.permissions = user.permissions
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.userId      = token.userId      as number
      session.user.staffId     = token.staffId     as number
      session.user.globalRole  = token.globalRole  as string
      session.user.permissions = token.permissions as { program_id: number; access_level: string }[]
      return session
    },
  },
})
