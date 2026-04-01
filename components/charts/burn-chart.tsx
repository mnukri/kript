'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/mock-data'

interface BurnChartProps {
  data:   { month: string; effort: number; expenses: number; cumulative: number }[]
  budget: number
}

export default function BurnChart({ data, budget }: BurnChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis
          yAxisId="monthly"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          width={44}
        />
        <YAxis
          yAxisId="cumul"
          orientation="right"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          width={44}
          domain={[0, budget > 0 ? budget * 1.1 : 'auto']}
        />
        <Tooltip formatter={(v, name) => [formatCurrency(Number(v)), name]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="monthly" dataKey="effort"   name="Effort"    stackId="a" fill="#d4d4d8" />
        <Bar yAxisId="monthly" dataKey="expenses" name="Expenses"  stackId="a" fill="#71717a" />
        <Line
          yAxisId="cumul"
          type="monotone"
          dataKey="cumulative"
          name="Cumulative spend"
          stroke="#18181b"
          strokeWidth={2}
          dot={{ r: 3, fill: '#18181b' }}
        />
        {budget > 0 && (
          <Line
            yAxisId="cumul"
            type="monotone"
            dataKey={() => budget}
            name="Budget ceiling"
            stroke="#C8102E"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
