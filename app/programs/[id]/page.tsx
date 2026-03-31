import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/stat-card'
import MonthlySpendChart from '@/components/charts/monthly-spend-chart'
import DonutChart from '@/components/charts/donut-chart'
import StackedBarChart from '@/components/charts/stacked-bar-chart'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatMonth } from '@/lib/mock-data'

const statusColor: Record<string, string> = {
  active:  'bg-green-50 text-green-700',
  closed:  'bg-zinc-100 text-zinc-500',
  pending: 'bg-yellow-50 text-yellow-700',
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const program = await prisma.program.findUnique({
    where: { program_id: Number(id) },
    include: {
      assignments: {
        include: {
          staff:       true,
          allocations: { orderBy: { month: 'desc' } },
        },
        orderBy: { is_active: 'desc' },
      },
      expenses:      { orderBy: { expense_date: 'desc' }, include: { staff: true } },
      salaryCharges: { orderBy: { charge_month: 'asc'  }, include: { staff: true } },
    },
  })

  if (!program) notFound()

  const totalExpenses = program.expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalSalary   = program.salaryCharges.reduce((s, c) => s + Number(c.amount_charged), 0)
  const totalSpent    = totalExpenses + totalSalary
  const budget        = Number(program.total_budget ?? 0)
  const remaining     = budget - totalSpent

  // Monthly spend chart
  const monthlyMap = new Map<string, { expenses: number; salary: number }>()
  program.expenses.forEach((e) => {
    const m = e.expense_date.toISOString().slice(0, 7)
    const cur = monthlyMap.get(m) ?? { expenses: 0, salary: 0 }
    monthlyMap.set(m, { ...cur, expenses: cur.expenses + Number(e.amount) })
  })
  program.salaryCharges.forEach((c) => {
    const m = c.charge_month.toISOString().slice(0, 7)
    const cur = monthlyMap.get(m) ?? { expenses: 0, salary: 0 }
    monthlyMap.set(m, { ...cur, salary: cur.salary + Number(c.amount_charged) })
  })
  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([m, v]) => ({ month: formatMonth(m + '-01'), ...v }))

  // Expense breakdown by category
  const categoryMap = new Map<string, number>()
  program.expenses.forEach((e) => {
    if (e.category) categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + Number(e.amount))
  })
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

  // Salary charges by staff per month
  const salaryStaffKeys = [...new Set(program.salaryCharges.map((c) => `${c.staff.first_name} ${c.staff.last_name}`))]
  const salaryMonthMap = new Map<string, Record<string, number>>()
  program.salaryCharges.forEach((c) => {
    const m    = formatMonth(c.charge_month.toISOString().slice(0, 7) + '-01')
    const name = `${c.staff.first_name} ${c.staff.last_name}`
    const cur  = salaryMonthMap.get(m) ?? {}
    salaryMonthMap.set(m, { ...cur, [name]: (cur[name] ?? 0) + Number(c.amount_charged) })
  })
  const salaryMonthData = Array.from(salaryMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals }))

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/programs" className="text-sm text-zinc-400 hover:text-zinc-600">← Programs</Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{program.program_name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
            <span className="font-mono">{program.worktag}</span>
            <span>·</span>
            <span>{program.grant_number}</span>
            <span>·</span>
            <span>{program.sponsor}</span>
            <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${statusColor[program.status] ?? ''}`}>
              {program.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {program.pop_start?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }) ?? '—'}
            {' – '}
            {program.pop_end?.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }) ?? '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Budget"   value={formatCurrency(budget)} />
        <StatCard label="Total Spent"    value={formatCurrency(totalSpent)} sub={budget > 0 ? `${((totalSpent / budget) * 100).toFixed(1)}% of budget` : undefined} />
        <StatCard label="Remaining"      value={formatCurrency(remaining)} sub={remaining < 0 ? 'Over budget' : 'Available'} />
        <StatCard label="Assigned Staff" value={program.assignments.filter((a) => a.is_active).length} sub="active assignments" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Monthly Spend (Expenses + Salary)</h2>
          {monthlyData.length > 0
            ? <MonthlySpendChart data={monthlyData} />
            : <p className="text-sm text-zinc-400 py-10 text-center">No spend data</p>}
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Expense Breakdown by Category</h2>
          {categoryData.length > 0
            ? <DonutChart data={categoryData} />
            : <p className="text-sm text-zinc-400 py-10 text-center">No expenses</p>}
        </div>
      </div>

      {salaryMonthData.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Salary Charges by Staff</h2>
          <StackedBarChart data={salaryMonthData} xKey="month" keys={salaryStaffKeys} />
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Staff Assignments</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Role on Program</th>
              <th className="pb-2 font-medium">Start</th>
              <th className="pb-2 font-medium">Latest %</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {program.assignments.map((a) => (
              <tr key={a.assignment_id} className="border-b border-zinc-50">
                <td className="py-2">
                  <Link href={`/staff/${a.staff_id}`} className="font-medium text-zinc-900 hover:underline">
                    {a.staff.first_name} {a.staff.last_name}
                  </Link>
                </td>
                <td className="py-2 text-zinc-500">{a.staff.job_title}</td>
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
          <h2 className="text-sm font-medium text-zinc-700">Expenses</h2>
          <span className="text-sm font-medium text-zinc-900">{formatCurrency(totalExpenses)} total</span>
        </div>
        {program.expenses.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Ref</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Vendor</th>
                <th className="pb-2 font-medium">Purchased By</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {program.expenses.map((e) => (
                <tr key={e.expense_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="py-2 font-mono text-xs text-zinc-400">{e.reference_number}</td>
                  <td className="py-2 text-zinc-700">{e.description}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">{e.category}</span>
                  </td>
                  <td className="py-2 text-zinc-500">{e.vendor}</td>
                  <td className="py-2">
                    {e.staff
                      ? <Link href={`/staff/${e.staff_id}`} className="text-zinc-900 hover:underline">{e.staff.first_name} {e.staff.last_name}</Link>
                      : '—'}
                  </td>
                  <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(Number(e.amount))}</td>
                  <td className="py-2 text-zinc-400">{e.expense_date.toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No expenses recorded.</p>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-700">Salary Charges</h2>
          <span className="text-sm font-medium text-zinc-900">{formatCurrency(totalSalary)} total</span>
        </div>
        {program.salaryCharges.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Staff</th>
                <th className="pb-2 font-medium">Month</th>
                <th className="pb-2 font-medium">Applied %</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {program.salaryCharges.map((c) => (
                <tr key={c.charge_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="py-2">
                    <Link href={`/staff/${c.staff_id}`} className="text-zinc-900 hover:underline">
                      {c.staff.first_name} {c.staff.last_name}
                    </Link>
                  </td>
                  <td className="py-2 text-zinc-500">{formatMonth(c.charge_month.toISOString().slice(0, 7) + '-01')}</td>
                  <td className="py-2 text-zinc-500">{c.applied_percentage != null ? `${Number(c.applied_percentage)}%` : '—'}</td>
                  <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(Number(c.amount_charged))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No salary charges recorded.</p>
        )}
      </div>
    </div>
  )
}
