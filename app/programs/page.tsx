export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/mock-data'

const statusColor: Record<string, string> = {
  active:  'bg-green-50 text-green-700',
  closed:  'bg-zinc-100 text-zinc-500',
  pending: 'bg-yellow-50 text-yellow-700',
}

export default async function ProgramsPage() {
  const [programs, charges] = await Promise.all([
    prisma.program.findMany({ orderBy: { program_name: 'asc' } }),
    prisma.charge.findMany({ select: { program_id: true, amount: true } }),
  ])

  const spendByProgram: Record<number, number> = {}
  charges.forEach((c) => {
    spendByProgram[c.program_id] = (spendByProgram[c.program_id] ?? 0) + Number(c.amount ?? 0)
  })

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Programs</h1>
        <p className="mt-1 text-sm text-zinc-500">{programs.length} programs total</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr className="text-left text-xs text-zinc-500">
              <th className="px-5 py-3 font-medium">Program</th>
              <th className="px-5 py-3 font-medium">Worktag</th>
              <th className="px-5 py-3 font-medium">Sponsor</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium text-right">Budget (Burdened)</th>
              <th className="px-5 py-3 font-medium text-right">Charged</th>
              <th className="px-5 py-3 font-medium text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => {
              const budget    = Number(p.total_budget_burdened ?? 0)
              const spent     = spendByProgram[p.program_id] ?? 0
              const remaining = budget - spent
              const pct       = budget > 0 ? ((spent / budget) * 100).toFixed(0) : '0'
              return (
                <tr key={p.program_id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-5 py-3">
                    <Link href={`/programs/${p.program_id}`} className="font-medium text-zinc-900 hover:underline">
                      {p.program_name}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">{p.grant_number}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-zinc-600">{p.worktag}</td>
                  <td className="px-5 py-3 text-zinc-600">{p.sponsor}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {p.pop_start?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }) ?? '—'}
                    {' – '}
                    {p.pop_end?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }) ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-700">{formatCurrency(budget)}</td>
                  <td className="px-5 py-3 text-right text-zinc-700">
                    {formatCurrency(spent)}
                    <span className="ml-1 text-xs text-zinc-400">({pct}%)</span>
                  </td>
                  <td className={`px-5 py-3 text-right font-medium ${remaining < 0 ? 'text-red-600' : 'text-zinc-900'}`}>
                    {formatCurrency(remaining)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
