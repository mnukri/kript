import Link from 'next/link'
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
}

const statusColor: Record<string, string> = {
  active:  'bg-green-100 text-green-800',
  closed:  'bg-zinc-100 text-zinc-500',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function ProgramPlots({ programs }: { programs: ProgramPlotData[] }) {
  if (programs.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-700">Program Spotlight</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => {
          const remaining = p.budget - p.total_spent
          const pct       = p.budget > 0 ? Math.min(100, (p.total_spent / p.budget) * 100) : 0
          const isOver    = remaining < 0

          return (
            <Link
              key={p.program_id}
              href={`/programs/${p.program_id}`}
              className="block bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-400 hover:shadow-sm transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{p.program_name}</p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{p.worktag}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${statusColor[p.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                  {p.status}
                </span>
              </div>

              {/* Budget bar */}
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{formatCurrency(p.total_spent)} charged</span>
                  <span className="font-medium">{pct.toFixed(0)}% of {formatCurrency(p.budget)}</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-yellow-400' : 'bg-zinc-800'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Charge breakdown */}
              <div className="border-t border-zinc-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Effort</span>
                  <span className="font-medium text-zinc-800">{formatCurrency(p.effort_spent)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Purchases</span>
                  <span className="font-medium text-zinc-800">{formatCurrency(p.purchase_spent)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Travel</span>
                  <span className="font-medium text-zinc-800">{formatCurrency(p.travel_spent)}</span>
                </div>
              </div>

              {/* Remaining */}
              <div className={`rounded-md px-3 py-2 text-xs font-medium flex justify-between ${isOver ? 'bg-red-50 text-red-700' : 'bg-zinc-50 text-zinc-600'}`}>
                <span>{isOver ? 'Over budget' : 'Remaining'}</span>
                <span>{isOver ? `−${formatCurrency(-remaining)}` : formatCurrency(remaining)}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
