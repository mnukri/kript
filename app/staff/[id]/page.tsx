import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/stat-card'
import DonutChart from '@/components/charts/donut-chart'
import StackedBarChart from '@/components/charts/stacked-bar-chart'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatMonth } from '@/lib/mock-data'

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const person = await prisma.staff.findUnique({
    where: { staff_id: Number(id) },
    include: {
      assignments: {
        include: {
          program:     true,
          allocations: { orderBy: { month: 'desc' } },
        },
        orderBy: { is_active: 'desc' },
      },
      expenses:      { include: { program: true }, orderBy: { expense_date: 'desc' } },
      salaries:      { where: { end_date: null } },
      salaryCharges: { include: { program: true }, orderBy: { charge_month: 'asc' } },
    },
  })

  if (!person) notFound()

  const salary        = person.salaries[0]
  const totalCharged  = person.salaryCharges.reduce((s, c) => s + Number(c.amount_charged), 0)
  const totalExpenses = person.expenses.reduce((s, e) => s + Number(e.amount), 0)

  // Current allocation donut
  const allocationData = person.assignments
    .filter((a) => a.is_active && a.allocations[0])
    .map((a) => ({ name: a.program.worktag, value: Number(a.allocations[0].percentage) }))

  // Salary charges by program per month
  const programKeys = [...new Set(person.salaryCharges.map((c) => c.program.worktag))]
  const salaryMonthMap = new Map<string, Record<string, number>>()
  person.salaryCharges.forEach((c) => {
    const m   = formatMonth(c.charge_month.toISOString().slice(0, 7) + '-01')
    const key = c.program.worktag
    const cur = salaryMonthMap.get(m) ?? {}
    salaryMonthMap.set(m, { ...cur, [key]: (cur[key] ?? 0) + Number(c.amount_charged) })
  })
  const salaryMonthData = Array.from(salaryMonthMap.entries())
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
          <span>{person.email}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Hired {person.hire_date?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }) ?? '—'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Annual Salary"   value={salary ? formatCurrency(Number(salary.annual_salary)) : '—'} />
        <StatCard label="Active Programs" value={person.assignments.filter((a) => a.is_active).length} />
        <StatCard label="Salary Charged"  value={formatCurrency(totalCharged)} sub="across all programs" />
        <StatCard label="Expenses Filed"  value={formatCurrency(totalExpenses)} sub={`${person.expenses.length} transactions`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Current Allocation by Program</h2>
          {allocationData.length > 0
            ? <DonutChart data={allocationData} />
            : <p className="text-sm text-zinc-400 py-10 text-center">No allocation data</p>}
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Salary Charges by Program</h2>
          {salaryMonthData.length > 0
            ? <StackedBarChart data={salaryMonthData} xKey="month" keys={programKeys} />
            : <p className="text-sm text-zinc-400 py-10 text-center">No salary charges</p>}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Program Assignments</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
              <th className="pb-2 font-medium">Program</th>
              <th className="pb-2 font-medium">Worktag</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Start</th>
              <th className="pb-2 font-medium">Latest %</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {person.assignments.map((a) => (
              <tr key={a.assignment_id} className="border-b border-zinc-50">
                <td className="py-2">
                  <Link href={`/programs/${a.program_id}`} className="font-medium text-zinc-900 hover:underline">
                    {a.program.program_name}
                  </Link>
                </td>
                <td className="py-2 font-mono text-xs text-zinc-500">{a.program.worktag}</td>
                <td className="py-2 text-zinc-600">{a.role}</td>
                <td className="py-2 text-zinc-400 text-xs">
                  {a.start_date?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' }) ?? '—'}
                </td>
                <td className="py-2 text-zinc-700">
                  {a.allocations[0] ? `${Number(a.allocations[0].percentage)}%` : '—'}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.is_active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
                    {a.is_active ? 'active' : 'ended'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-700">Expenses Filed</h2>
          <span className="text-sm font-medium text-zinc-900">{formatCurrency(totalExpenses)} total</span>
        </div>
        {person.expenses.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Ref</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Program</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {person.expenses.map((e) => (
                <tr key={e.expense_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="py-2 font-mono text-xs text-zinc-400">{e.reference_number}</td>
                  <td className="py-2 text-zinc-700">{e.description}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">{e.category}</span>
                  </td>
                  <td className="py-2">
                    <Link href={`/programs/${e.program_id}`} className="text-zinc-900 hover:underline">
                      {e.program.worktag}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(Number(e.amount))}</td>
                  <td className="py-2 text-zinc-400">{e.expense_date.toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No expenses filed.</p>
        )}
      </div>
    </div>
  )
}
