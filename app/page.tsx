import Link from 'next/link'
import StatCard from '@/components/stat-card'
import BudgetBar from '@/components/charts/budget-bar'
import DonutChart from '@/components/charts/donut-chart'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/mock-data'

export default async function HomePage() {
  const [programs, expenses, salaryCharges, staffCount] = await Promise.all([
    prisma.program.findMany({ orderBy: { program_name: 'asc' } }),
    prisma.programExpense.findMany(),
    prisma.programSalaryCharge.findMany(),
    prisma.staff.count(),
  ])

  const totalBudget   = programs.reduce((s, p) => s + Number(p.total_budget ?? 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalSalary   = salaryCharges.reduce((s, c) => s + Number(c.amount_charged), 0)
  const totalSpent    = totalExpenses + totalSalary

  const spendByProgram = programs.reduce<Record<number, number>>((acc, p) => {
    acc[p.program_id] = 0
    return acc
  }, {})
  expenses.forEach((e)    => { spendByProgram[e.program_id] = (spendByProgram[e.program_id] ?? 0) + Number(e.amount) })
  salaryCharges.forEach((c) => { spendByProgram[c.program_id] = (spendByProgram[c.program_id] ?? 0) + Number(c.amount_charged) })

  const budgetData = programs.map((p) => ({
    name:   p.program_name.length > 28 ? p.program_name.slice(0, 28) + '…' : p.program_name,
    budget: Number(p.total_budget ?? 0),
    spent:  spendByProgram[p.program_id] ?? 0,
  }))

  const statusCounts = programs.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  const recentExpenses = await prisma.programExpense.findMany({
    orderBy: { expense_date: 'desc' },
    take: 5,
    include: { program: true },
  })

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">Portfolio summary across all programs and staff</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Programs" value={programs.length} sub={`${statusCounts.active ?? 0} active`} />
        <StatCard label="Total Staff"    value={staffCount} />
        <StatCard label="Total Budget"   value={formatCurrency(totalBudget)} />
        <StatCard label="Total Spent"    value={formatCurrency(totalSpent)} sub={totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Budget vs Spent by Program</h2>
          <BudgetBar data={budgetData} />
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Programs by Status</h2>
          <DonutChart data={statusData} />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Recent Expenses</h2>
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
            {recentExpenses.map((e) => (
              <tr key={e.expense_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className="py-2 text-zinc-400 font-mono text-xs">{e.reference_number}</td>
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
      </div>
    </div>
  )
}
