'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, BarChart, Bar, Cell, LabelList,
} from 'recharts'
import { formatCurrency } from '@/lib/mock-data'

export interface ProgramPlotData {
  program_id:     number
  program_name:   string
  worktag:        string
  status:         string
  budget:         number
  total_spent:    number
  effort_spent:   number
  purchase_spent: number
  travel_spent:   number
  pop_start:      string | null
  pop_end:        string | null
  monthly:        { month: string; effort: number; expenses: number }[]
}

const statusColor: Record<string, string> = {
  active:  'bg-green-100 text-green-800',
  closed:  'bg-zinc-100 text-zinc-500',
  pending: 'bg-yellow-100 text-yellow-700',
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function addMonths(d: Date, n: number) {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

function buildBurnData(p: ProgramPlotData) {
  const spendMap = new Map<string, number>()
  for (const m of p.monthly) spendMap.set(m.month, m.effort + m.expenses)

  if (!p.pop_start || !p.pop_end || p.budget === 0) {
    let cum = 0
    return p.monthly.map((m) => {
      cum += m.effort + m.expenses
      return { month: m.month, actual: cum, target: null as number | null }
    })
  }

  const start = new Date(p.pop_start)
  const end   = new Date(p.pop_end)
  const today = new Date()
  const total = monthsBetween(start, end)
  if (total <= 0) return []

  const rows: { month: string; actual: number; target: number }[] = []
  let cum = 0
  let i = 0
  const limit = addMonths(start, Math.min(monthsBetween(start, today), total))

  for (let d = new Date(start); d <= limit; d = addMonths(d, 1), i++) {
    const key = monthKey(d)
    cum += spendMap.get(key) ?? 0
    rows.push({ month: key, actual: cum, target: Math.round((p.budget / total) * (i + 1)) })
  }
  return rows
}

function buildRemainingData(p: ProgramPlotData) {
  const budgetPct = p.budget > 0 ? Math.max(0, ((p.budget - p.total_spent) / p.budget) * 100) : 0

  if (!p.pop_start || !p.pop_end) {
    return [
      { label: 'Budget left', value: Math.round(budgetPct), fill: budgetPct < 20 ? '#ef4444' : budgetPct < 40 ? '#eab308' : '#52525b' },
      { label: 'Time left',   value: null,                  fill: '#d4d4d8' },
    ]
  }

  const start    = new Date(p.pop_start)
  const end      = new Date(p.pop_end)
  const today    = new Date()
  const totalMs  = end.getTime() - start.getTime()
  const elapsed  = Math.min(Math.max(today.getTime() - start.getTime(), 0), totalMs)
  const timePct  = totalMs > 0 ? Math.max(0, ((totalMs - elapsed) / totalMs) * 100) : 0
  const burnColor = budgetPct < timePct - 5 ? '#ef4444' : budgetPct > timePct + 15 ? '#eab308' : '#52525b'

  return [
    { label: 'Budget left', value: Math.round(budgetPct), fill: burnColor },
    { label: 'Time left',   value: Math.round(timePct),   fill: '#a1a1aa' },
  ]
}

export default function ProgramPlots({ programs }: { programs: ProgramPlotData[] }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<number>(programs[0]?.program_id)

  if (programs.length === 0) return null

  const selected  = programs.find((p) => p.program_id === selectedId) ?? programs[0]
  const remaining = selected.budget - selected.total_spent
  const pct       = selected.budget > 0 ? Math.min(100, (selected.total_spent / selected.budget) * 100) : 0
  const isOver    = remaining < 0

  const burnData      = buildBurnData(selected)
  const remainingData = buildRemainingData(selected)

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-700 mb-3">Program Spotlight</h2>

      {/* Button-style tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        {programs.map((p) => (
          <button
            key={p.program_id}
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedId(p.program_id) }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              p.program_id === selectedId
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
            }`}
          >
            {p.worktag}
          </button>
        ))}
      </div>

      {/* Card — click anywhere to navigate to program detail */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/programs/${selected.program_id}`)}
        onKeyDown={(e) => e.key === 'Enter' && router.push(`/programs/${selected.program_id}`)}
        className="bg-white border border-zinc-200 rounded-lg p-5 space-y-5 cursor-pointer hover:border-zinc-400 hover:shadow-sm transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-zinc-900">{selected.program_name}</p>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{selected.worktag}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[selected.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
              {selected.status}
            </span>
            <span className="text-xs text-zinc-400">View detail →</span>
          </div>
        </div>

        {/* Budget bar */}
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>{formatCurrency(selected.total_spent)} charged</span>
            <span className="font-medium">{pct.toFixed(0)}% of {formatCurrency(selected.budget)}</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-yellow-400' : 'bg-zinc-800'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Breakdown + charts */}
        <div className="grid grid-cols-3 gap-6 pt-1">
          {/* Breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Breakdown</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Effort</span>
                <span className="font-medium text-zinc-800">{formatCurrency(selected.effort_spent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Purchases</span>
                <span className="font-medium text-zinc-800">{formatCurrency(selected.purchase_spent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Travel</span>
                <span className="font-medium text-zinc-800">{formatCurrency(selected.travel_spent)}</span>
              </div>
            </div>
            <div className={`rounded-md px-3 py-2 text-xs font-medium flex justify-between mt-1 ${isOver ? 'bg-red-50 text-red-700' : 'bg-zinc-50 text-zinc-600'}`}>
              <span>{isOver ? 'Over budget' : 'Remaining'}</span>
              <span>{isOver ? `−${formatCurrency(-remaining)}` : formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Cumulative burn vs target */}
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Cumulative Burn vs Target</p>
            {burnData.length === 0 ? (
              <p className="text-xs text-zinc-400">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={burnData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9 }} width={36} />
                  <Tooltip formatter={(v, name) => [formatCurrency(Number(v)), name]} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#18181b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#a1a1aa" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Budget vs time remaining */}
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Budget vs Time Remaining</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={remainingData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={68} />
                <Tooltip formatter={(v) => [`${v}%`]} />
                <ReferenceLine x={50} stroke="#e4e4e7" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={20}>
                  {remainingData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  <LabelList dataKey="value" position="right" formatter={(v: unknown) => `${v}%`} style={{ fontSize: 10, fill: '#71717a' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
