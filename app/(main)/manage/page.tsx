'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import ManageStaff from '@/components/manage/manage-staff'
import ManagePrograms from '@/components/manage/manage-programs'
import ManageCharges from '@/components/manage/manage-charges'
import ManagePurchases from '@/components/manage/manage-purchases'
import ManageUsers from '@/components/manage/manage-users'

export default function ManagePage() {
  const { data: session } = useSession()
  const role = session?.user.globalRole
  const canManageUsers = role === 'admin' || role === 'manager'

  const TABS = [
    { id: 'staff',     label: 'Staff'     },
    { id: 'programs',  label: 'Programs'  },
    { id: 'charges',   label: 'Charges'   },
    { id: 'purchases', label: 'Purchases' },
    ...(canManageUsers ? [{ id: 'users', label: 'Users' }] : []),
  ]

  const [tab, setTab] = useState('staff')
  const fetchAll = useStore((s) => s.fetchAll)
  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Manage</h1>
        <p className="mt-1 text-sm text-zinc-500">Add and edit staff, programs, and charges</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'staff'     && <ManageStaff />}
      {tab === 'programs'  && <ManagePrograms />}
      {tab === 'charges'   && <ManageCharges />}
      {tab === 'purchases' && <ManagePurchases />}
      {tab === 'users'     && canManageUsers && <ManageUsers />}
    </div>
  )
}
