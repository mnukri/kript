import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Nav from '@/components/nav'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'kript',
  description: 'Program and staff management dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="flex h-full bg-zinc-50 font-sans antialiased">
        <Nav />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </body>
    </html>
  )
}
