'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/mock-data'

export interface StaffChargePoint {
  name:     string
  effort:   number
  expenses: number
  total:    number
}

export default function StaffChargesChart({ data }: { data: StaffChargePoint[] }) {
  // Show top 10 by total, sorted ascending so largest is at top in horizontal bar
  const sorted = [...data].sort((a, b) => a.total - b.total).slice(-10)

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 44)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ left: 0, right: 64, top: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          width={120}
        />
        <Tooltip
          formatter={(v, name) => [formatCurrency(Number(v)), name]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="effort"   name="Effort"   stackId="a" fill="#d4d4d8" radius={[0, 0, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" stackId="a" fill="#71717a" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
