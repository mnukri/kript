export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/stat-card'
import DonutChart from '@/components/charts/donut-chart'
import StackedBarChart from '@/components/charts/stacked-bar-chart'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatMonth } from '@/lib/mock-data'

const chargeStatusColor: Record<string, string> = {
  approved:  'bg-green-50 text-green-700',
  submitted: 'bg-blue-50 text-blue-700',
  rejected:  'bg-red-50 text-red-600',
  draft:     'bg-zinc-100 text-zinc-500',
}

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const person = await prisma.staff.findUnique({
    where: { staff_id: Number(id) },
    include: {
      salaries:      { where: { end_date: null } },
      charges:       { include: { program: true }, orderBy: { charge_date: 'desc' } },
      effortEntries: {
        include:  { program: true },
        orderBy:  { effort_date: 'desc' },
        distinct: ['program_id'],
      },
    },
  })

  if (!person) notFound()

  const salary       = person.salaries[0]
  const totalCharged = person.charges.reduce((s, c) => s + Number(c.amount ?? 0), 0)
  const effortOnly   = person.charges.filter((c) => c.charge_type === 'effort')
  const expensesOnly = person.charges.filter((c) => c.charge_type !== 'effort')
  const totalEffort  = effortOnly.reduce((s, c) => s + Number(c.amount ?? 0), 0)
  const totalExpenses = expensesOnly.reduce((s, c) => s + Number(c.amount ?? 0), 0)

  // Current effort by program (donut)
  const effortData = person.effortEntries
    .map((e) => ({ name: e.program.worktag, value: Number(e.percentage) }))

  // Effort charges by program per month (stacked bar)
  const programKeys   = [...new Set(effortOnly.map((c) => c.program.worktag))]
  const effortMonthMap = new Map<string, Record<string, number>>()
  effortOnly.forEach((c) => {
    const m   = formatMonth(c.charge_date.toISOString().slice(0, 7) + '-01')
    const key = c.program.worktag
    const cur = effortMonthMap.get(m) ?? {}
    effortMonthMap.set(m, { ...cur, [key]: (cur[key] ?? 0) + Number(c.amount ?? 0) })
  })
  const effortMonthData = Array.from(effortMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals }))

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <Link href="/staff" className="text-sm text-zinc-400 hover:text-zinc-600">← Staff</Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{person.first_name} {person.last_name}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
          <span>{person.job_title}</span>
          <span>·</span>
          <span>{person.department}</span>
          <span>·</span>
          <span className="font-mono text-xs">{person.labor_category}</span>
          <span>·</span>
          <span>{person.email}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Hired {person.hire_date?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }) ?? '—'}
          {' · '}
          <span className={person.is_active ? 'text-green-600' : 'text-zinc-400'}>
            {person.is_active ? 'Active' : 'Inactive'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Annual Salary"   value={salary ? formatCurrency(Number(salary.annual_salary)) : '—'} />
        <StatCard label="Programs"        value={person.effortEntries.length} sub="with effort logged" />
        <StatCard label="Effort Charged"  value={formatCurrency(totalEffort)} sub="salary allocation" />
        <StatCard label="Expenses Filed"  value={formatCurrency(totalExpenses)} sub={`${expensesOnly.length} transactions`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Effort by Program (Most Recent)</h2>
          {effortData.length > 0
            ? <DonutChart data={effortData} />
            : <p className="text-sm text-zinc-400 py-10 text-center">No effort logged</p>}
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Effort Charges by Program</h2>
          {effortMonthData.length > 0
            ? <StackedBarChart data={effortMonthData} xKey="month" keys={programKeys} />
            : <p className="text-sm text-zinc-400 py-10 text-center">No effort charges</p>}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Programs</h2>
        {person.effortEntries.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Program</th>
                <th className="pb-2 font-medium">Worktag</th>
                <th className="pb-2 font-medium">Sponsor</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Latest %</th>
                <th className="pb-2 font-medium">Last Entry</th>
              </tr>
            </thead>
            <tbody>
              {person.effortEntries.map((e) => (
                <tr key={e.effort_id} className="border-b border-zinc-50">
                  <td className="py-2">
                    <Link href={`/programs/${e.program_id}`} className="font-medium text-zinc-900 hover:underline">
                      {e.program.program_name}
                    </Link>
                  </td>
                  <td className="py-2 font-mono text-xs text-zinc-500">{e.program.worktag}</td>
                  <td className="py-2 text-zinc-500">{e.program.sponsor ?? '—'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      e.program.status === 'active' ? 'bg-green-50 text-green-700' :
                      e.program.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>{e.program.status}</span>
                  </td>
                  <td className="py-2 text-zinc-700">{Number(e.percentage)}%</td>
                  <td className="py-2 text-zinc-400 text-xs">
                    {e.effort_date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No effort entries.</p>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-700">Charges</h2>
          <span className="text-sm font-medium text-zinc-900">{formatCurrency(totalCharged)} total</span>
        </div>
        {person.charges.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Ref</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Program</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {person.charges.map((c) => (
                <tr key={c.charge_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">{c.charge_type}</span>
                  </td>
                  <td className="py-2 font-mono text-xs text-zinc-400">{c.reference_number}</td>
                  <td className="py-2 text-zinc-700">{c.description ?? '—'}</td>
                  <td className="py-2">
                    <Link href={`/programs/${c.program_id}`} className="text-zinc-900 hover:underline">
                      {c.program.worktag}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(Number(c.amount ?? 0))}</td>
                  <td className="py-2 text-zinc-400">{c.charge_date.toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${chargeStatusColor[c.status] ?? ''}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No charges filed.</p>
        )}
      </div>
    </div>
  )
}
