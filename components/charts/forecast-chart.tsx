'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell, ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/lib/mock-data'

export interface ForecastPoint {
  month:          string
  effort:         number   // actual effort (0 for projected months)
  expenses:       number   // actual expenses (0 for projected months)
  projected:      number   // projected spend (0 for actual months)
  cumulative:     number   // running cumulative across all months
  isProjected:    boolean
  willOverrun:    boolean  // cumulative exceeds budget at this point
}

interface ForecastChartProps {
  data:            ForecastPoint[]
  budget:          number
  firstProjMonth:  string | null  // month key where projections begin
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as ForecastPoint
  return (
    <div className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs shadow-sm space-y-1">
      <p className="font-medium text-zinc-700">{label}{d.isProjected ? ' (projected)' : ''}</p>
      {!d.isProjected && (
        <>
          <p className="text-zinc-500">Effort: <span className="font-medium text-zinc-800">{formatCurrency(d.effort)}</span></p>
          <p className="text-zinc-500">Expenses: <span className="font-medium text-zinc-800">{formatCurrency(d.expenses)}</span></p>
        </>
      )}
      {d.isProjected && (
        <p className="text-zinc-500">Projected: <span className="font-medium text-zinc-800">{formatCurrency(d.projected)}</span></p>
      )}
      <p className="text-zinc-500 border-t border-zinc-100 pt-1">
        Cumulative: <span className={`font-medium ${d.willOverrun ? 'text-red-600' : 'text-zinc-800'}`}>{formatCurrency(d.cumulative)}</span>
      </p>
      {d.willOverrun && <p className="text-red-600 font-medium">⚠ Exceeds budget</p>}
    </div>
  )
}

export default function ForecastChart({ data, budget, firstProjMonth }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis
          yAxisId="monthly"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10 }}
          width={44}
        />
        <YAxis
          yAxisId="cumul"
          orientation="right"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10 }}
          width={44}
          domain={[0, budget > 0 ? budget * 1.05 : 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />

        {/* Vertical line marking where projections begin */}
        {firstProjMonth && (
          <ReferenceLine
            yAxisId="monthly"
            x={firstProjMonth}
            stroke="#a1a1aa"
            strokeDasharray="4 3"
            label={{ value: 'Forecast ▶', position: 'insideTopRight', fontSize: 10, fill: '#a1a1aa' }}
          />
        )}

        {/* Budget ceiling */}
        {budget > 0 && (
          <ReferenceLine
            yAxisId="cumul"
            y={budget}
            stroke="#ef4444"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: 'Budget', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
          />
        )}

        {/* Actual monthly bars */}
        <Bar yAxisId="monthly" dataKey="effort"   name="Effort"   stackId="a" fill="#d4d4d8" legendType="square" />
        <Bar yAxisId="monthly" dataKey="expenses" name="Expenses" stackId="a" fill="#71717a" legendType="square" />

        {/* Projected monthly bars — colored red if overrun */}
        <Bar yAxisId="monthly" dataKey="projected" name="Projected" stackId="a" legendType="square">
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.willOverrun ? '#fca5a5' : '#e4e4e7'}
              stroke={d.willOverrun ? '#ef4444' : '#d4d4d8'}
              strokeWidth={1}
            />
          ))}
        </Bar>

        {/* Cumulative line */}
        <Line
          yAxisId="cumul"
          type="monotone"
          dataKey="cumulative"
          name="Cumulative"
          stroke="#18181b"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 3"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
