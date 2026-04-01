export const dynamic = 'force-dynamic'

import Link from 'next/link'
import StatCard from '@/components/stat-card'
import ProgramPlots from '@/components/program-plots'
import type { ProgramPlotData } from '@/components/program-plots'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatMonth } from '@/lib/mock-data'

export default async function HomePage() {
  const [programs, allCharges, staffCount] = await Promise.all([
    prisma.program.findMany({ orderBy: { program_name: 'asc' } }),
    prisma.charge.findMany({
      select: { program_id: true, amount: true, charge_type: true, charge_date: true },
    }),
    prisma.staff.count(),
  ])

  const totalBudget = programs.reduce((s, p) => s + Number(p.total_budget_burdened ?? 0), 0)
  const totalSpent  = allCharges.reduce((s, c) => s + Number(c.amount ?? 0), 0)

  const activeCount = programs.filter((p) => p.status === 'active').length

  // Build per-program plot data
  const programPlotData: ProgramPlotData[] = programs.map((p) => {
    const pCharges       = allCharges.filter((c) => c.program_id === p.program_id)
    const effort_spent   = pCharges.filter((c) => c.charge_type === 'effort')  .reduce((s, c) => s + Number(c.amount ?? 0), 0)
    const purchase_spent = pCharges.filter((c) => c.charge_type === 'purchase').reduce((s, c) => s + Number(c.amount ?? 0), 0)
    const travel_spent   = pCharges.filter((c) => c.charge_type === 'travel')  .reduce((s, c) => s + Number(c.amount ?? 0), 0)
    return {
      program_id:     p.program_id,
      program_name:   p.program_name,
      worktag:        p.worktag,
      status:         p.status,
      budget:         Number(p.total_budget_burdened ?? 0),
      total_spent:    effort_spent + purchase_spent + travel_spent,
      effort_spent,
      purchase_spent,
      travel_spent,
    }
  })

  const recentCharges = await prisma.charge.findMany({
    where:   { charge_type: { in: ['purchase', 'travel'] } },
    orderBy: { charge_date: 'desc' },
    take:    5,
    include: { program: true, staff: true },
  })

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">Portfolio summary across all programs and staff</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Programs" value={programs.length} sub={`${activeCount} active`} href="/programs" />
        <StatCard label="Total Staff"    value={staffCount} href="/staff" />
        <StatCard label="Total Budget"   value={formatCurrency(totalBudget)} />
        <StatCard label="Total Charged"  value={formatCurrency(totalSpent)} sub={totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : undefined} />
      </div>

      {/* Per-program spotlight with toggle */}
      {programPlotData.length > 0 && <ProgramPlots programs={programPlotData} />}

      {/* Recent purchase/travel charges */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Recent Charges</h2>
        {recentCharges.length === 0 ? (
          <p className="text-sm text-zinc-400">No charges recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Staff</th>
                <th className="pb-2 font-medium">Program</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCharges.map((c) => (
                <tr key={c.charge_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">{c.charge_type}</span>
                  </td>
                  <td className="py-2 text-zinc-700">{c.description ?? '—'}</td>
                  <td className="py-2 text-zinc-500">
                    <Link href={`/staff/${c.staff_id}`} className="hover:underline">
                      {c.staff.first_name} {c.staff.last_name}
                    </Link>
                  </td>
                  <td className="py-2">
                    <Link href={`/programs/${c.program_id}`} className="text-zinc-900 hover:underline">
                      {c.program.worktag}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(Number(c.amount ?? 0))}</td>
                  <td className="py-2 text-zinc-400">{c.charge_date.toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === 'approved'  ? 'bg-green-50 text-green-700'  :
                      c.status === 'submitted' ? 'bg-blue-50 text-blue-700'   :
                      c.status === 'rejected'  ? 'bg-red-50 text-red-600'     :
                                                 'bg-zinc-100 text-zinc-500'
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
