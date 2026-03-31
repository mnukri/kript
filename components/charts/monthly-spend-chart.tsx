'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/mock-data'

interface MonthlySpendChartProps {
  data: { month: string; expenses: number; salary: number }[]
}

export default function MonthlySpendChart({ data }: MonthlySpendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={40} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Area type="monotone" dataKey="salary"   name="Salary"   stackId="1" stroke="#52525b" fill="#d4d4d8" />
        <Area type="monotone" dataKey="expenses" name="Expenses" stackId="1" stroke="#18181b" fill="#71717a" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
