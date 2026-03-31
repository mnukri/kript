'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/mock-data'

interface StackedBarChartProps {
  data: Record<string, string | number>[]
  xKey: string
  keys: string[]
  colors?: string[]
}

const DEFAULT_COLORS = ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8', '#f4f4f5']

export default function StackedBarChart({ data, xKey, keys, colors = DEFAULT_COLORS }: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={40} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} name={k} stackId="a" fill={colors[i % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
