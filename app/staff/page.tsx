import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/mock-data'

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({
    orderBy: { last_name: 'asc' },
    include: {
      assignments:  { where: { is_active: true } },
      salaries:     { where: { end_date: null } },
      salaryCharges: true,
      expenses:      true,
    },
  })

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Staff</h1>
        <p className="mt-1 text-sm text-zinc-500">{staff.length} staff members</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr className="text-left text-xs text-zinc-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium text-right">Annual Salary</th>
              <th className="px-5 py-3 font-medium">Programs</th>
              <th className="px-5 py-3 font-medium text-right">Total Charged</th>
              <th className="px-5 py-3 font-medium text-right">Expenses</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => {
              const salary        = s.salaries[0]
              const totalCharged  = s.salaryCharges.reduce((sum, c) => sum + Number(c.amount_charged), 0)
              const totalExpenses = s.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
              return (
                <tr key={s.staff_id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-5 py-3">
                    <Link href={`/staff/${s.staff_id}`} className="font-medium text-zinc-900 hover:underline">
                      {s.first_name} {s.last_name}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.email}</p>
                  </td>
                  <td className="px-5 py-3 text-zinc-600">{s.job_title}</td>
                  <td className="px-5 py-3 text-zinc-500">{s.department}</td>
                  <td className="px-5 py-3 text-right text-zinc-700">
                    {salary ? formatCurrency(Number(salary.annual_salary)) : '—'}
                  </td>
                  <td className="px-5 py-3 text-zinc-600">{s.assignments.length} active</td>
                  <td className="px-5 py-3 text-right text-zinc-700">{formatCurrency(totalCharged)}</td>
                  <td className="px-5 py-3 text-right text-zinc-700">{formatCurrency(totalExpenses)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
