import type { NextAuthConfig } from 'next-auth'
import MicrosoftEntraId from 'next-auth/providers/microsoft-entra-id'

export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraId({
      clientId:     process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:     process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
}
