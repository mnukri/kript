'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',         label: 'Overview' },
  { href: '/programs', label: 'Programs' },
  { href: '/staff',      label: 'Staff'      },
  { href: '/timesheet',  label: 'Timesheet'  },
  { href: '/purchases',  label: 'Purchases'  },
  { href: '/manage',     label: 'Manage'     },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-zinc-200">
        <span className="text-lg font-semibold tracking-tight text-zinc-900">kri<span style={{ color: '#C8102E' }}>pt</span></span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {links.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
