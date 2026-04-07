'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import ManagePurchases from '@/components/manage/manage-purchases'

export default function PurchasesPage() {
  const fetchAll = useStore((s) => s.fetchAll)
  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Purchases</h1>
        <p className="mt-1 text-sm text-zinc-500">Log and manage purchase charges</p>
      </div>
      <ManagePurchases />
    </div>
  )
}
