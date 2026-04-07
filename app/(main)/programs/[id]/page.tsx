export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/stat-card'
import BurnChart from '@/components/charts/burn-chart'
import DonutChart from '@/components/charts/donut-chart'
import StackedBarChart from '@/components/charts/stacked-bar-chart'
import ForecastChart from '@/components/charts/forecast-chart'
import type { ForecastPoint } from '@/components/charts/forecast-chart'
import StaffChargesChart from '@/components/charts/staff-charges-chart'
import type { StaffChargePoint } from '@/components/charts/staff-charges-chart'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatMonth } from '@/lib/mock-data'

const statusColor: Record<string, string> = {
  active:  'bg-green-50 text-green-700',
  closed:  'bg-zinc-100 text-zinc-500',
  pending: 'bg-yellow-50 text-yellow-700',
}

const chargeStatusColor: Record<string, string> = {
  approved:  'bg-green-50 text-green-700',
  submitted: 'bg-blue-50 text-blue-700',
  rejected:  'bg-red-50 text-red-600',
  draft:     'bg-zinc-100 text-zinc-500',
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const program = await prisma.program.findUnique({
    where: { program_id: Number(id) },
    include: {
      effortEntries: {
        include:  { staff: true },
        orderBy:  { effort_date: 'desc' },
        distinct: ['staff_id'],
      },
      charges: {
        include: { staff: true },
        orderBy: { charge_date: 'asc' },
      },
      tpoc: true,
    },
  })

  if (!program) notFound()

  const today    = new Date()
  const budget   = Number(program.total_budget_burdened ?? 0)

  const effortCharges   = program.charges.filter((c) => c.charge_type === 'effort')
  const purchaseCharges = program.charges.filter((c) => c.charge_type === 'purchase')
  const travelCharges   = program.charges.filter((c) => c.charge_type === 'travel')
  const totalEffort     = effortCharges.reduce((s, c) => s + Number(c.amount ?? 0), 0)
  const totalPurchases  = purchaseCharges.reduce((s, c) => s + Number(c.amount ?? 0), 0)
  const totalTravel     = travelCharges.reduce((s, c) => s + Number(c.amount ?? 0), 0)
  const totalSpent      = totalEffort + totalPurchases + totalTravel
  const remaining       = budget - totalSpent

  // ── Period of Performance ────────────────────────────────────────────────
  const popStart = program.pop_start
  const popEnd   = program.pop_end
  let popProgress: number | null = null
  let daysRemaining: number | null = null
  let totalDays: number | null = null

  if (popStart && popEnd) {
    totalDays     = Math.ceil((popEnd.getTime() - popStart.getTime()) / 864e5)
    const elapsed = Math.max(0, today.getTime() - popStart.getTime()) / 864e5
    popProgress   = Math.min(100, (elapsed / totalDays) * 100)
    daysRemaining = Math.max(0, Math.ceil((popEnd.getTime() - today.getTime()) / 864e5))
  }

  // ── Burn rate & projection ───────────────────────────────────────────────
  const sortedCharges = [...program.charges].sort(
    (a, b) => a.charge_date.getTime() - b.charge_date.getTime()
  )
  const firstDate     = sortedCharges[0]?.charge_date
  const monthsTracked = firstDate
    ? Math.max(1, (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : 1
  const monthlyBurnRate       = totalSpent / monthsTracked
  const monthsRemainingToPop  = popEnd
    ? Math.max(0, (popEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : null
  const projectedEndSpend     = monthsRemainingToPop != null
    ? totalSpent + monthlyBurnRate * monthsRemainingToPop
    : null
  const projectedOverrun      = projectedEndSpend != null && budget > 0
    ? projectedEndSpend - budget
    : null

  // ── Monthly chart data ───────────────────────────────────────────────────
  const monthlyMap = new Map<string, { effort: number; expenses: number }>()
  program.charges.forEach((c) => {
    const m   = c.charge_date.toISOString().slice(0, 7)
    const cur = monthlyMap.get(m) ?? { effort: 0, expenses: 0 }
    if (c.charge_type === 'effort') {
      monthlyMap.set(m, { ...cur, effort: cur.effort + Number(c.amount ?? 0) })
    } else {
      monthlyMap.set(m, { ...cur, expenses: cur.expenses + Number(c.amount ?? 0) })
    }
  })
  const monthlyBase = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([m, v]) => ({ month: formatMonth(m + '-01'), ...v }))

  let running = 0
  const monthlyData = monthlyBase.map((d) => {
    running += d.effort + d.expenses
    return { ...d, cumulative: running }
  })

  // ── Charge status breakdown ──────────────────────────────────────────────
  const statusCounts = program.charges.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1
    return acc
  }, {})
  const statusDonutData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // ── Spend-by-type donut ──────────────────────────────────────────────────
  const typeData = [
    { name: 'Effort',    value: totalEffort    },
    { name: 'Purchases', value: totalPurchases },
    { name: 'Travel',    value: totalTravel    },
  ].filter((d) => d.value > 0)

  // ── Effort by staff per month ────────────────────────────────────────────
  const effortStaffKeys = [...new Set(effortCharges.map((c) => `${c.staff.first_name} ${c.staff.last_name}`))]
  const effortMonthMap  = new Map<string, Record<string, number>>()
  effortCharges.forEach((c) => {
    const m    = formatMonth(c.charge_date.toISOString().slice(0, 7) + '-01')
    const name = `${c.staff.first_name} ${c.staff.last_name}`
    const cur  = effortMonthMap.get(m) ?? {}
    effortMonthMap.set(m, { ...cur, [name]: (cur[name] ?? 0) + Number(c.amount ?? 0) })
  })
  const effortMonthData = Array.from(effortMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals }))

  // ── Per-staff charge totals ──────────────────────────────────────────────
  const staffTotals = new Map<number, { name: string; effort: number; expenses: number }>()
  program.charges.forEach((c) => {
    const key  = c.staff_id
    const name = `${c.staff.first_name} ${c.staff.last_name}`
    const cur  = staffTotals.get(key) ?? { name, effort: 0, expenses: 0 }
    if (c.charge_type === 'effort') {
      staffTotals.set(key, { ...cur, effort: cur.effort + Number(c.amount ?? 0) })
    } else {
      staffTotals.set(key, { ...cur, expenses: cur.expenses + Number(c.amount ?? 0) })
    }
  })
  const staffSummary = Array.from(staffTotals.entries())
    .map(([staff_id, v]) => ({ staff_id, ...v, total: v.effort + v.expenses }))
    .sort((a, b) => b.total - a.total)

  const staffChargePoints: StaffChargePoint[] = staffSummary.map((s) => ({
    name:     s.name,
    effort:   s.effort,
    expenses: s.expenses,
    total:    s.total,
  }))

  // ── Forecast data ────────────────────────────────────────────────────────
  let forecastData: ForecastPoint[] = monthlyData.map((d) => ({
    month:       d.month,
    effort:      d.effort,
    expenses:    d.expenses,
    projected:   0,
    cumulative:  d.cumulative,
    isProjected: false,
    willOverrun: d.cumulative > budget,
  }))

  let firstProjMonth: string | null = null

  if (popEnd && monthlyBurnRate > 0) {
    // Start projections from the month after the last actual charge month,
    // or from next calendar month if no charges yet
    const lastActualKey = monthlyMap.size > 0
      ? Array.from(monthlyMap.keys()).sort().at(-1)!
      : null

    const projStart = new Date(today)
    projStart.setDate(1)
    if (lastActualKey) {
      // start one month after last recorded charge month
      const [y, m] = lastActualKey.split('-').map(Number)
      projStart.setFullYear(y)
      projStart.setMonth(m) // month is 0-indexed; m from "YYYY-MM" is 1-indexed, so m = next month
    } else {
      projStart.setMonth(projStart.getMonth() + 1)
    }

    let cumRunning = running
    let isFirst    = true

    for (let d = new Date(projStart); d <= popEnd; ) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = formatMonth(key + '-01')
      cumRunning += monthlyBurnRate
      if (isFirst) { firstProjMonth = label; isFirst = false }
      forecastData.push({
        month:       label,
        effort:      0,
        expenses:    0,
        projected:   Math.round(monthlyBurnRate),
        cumulative:  Math.round(cumRunning),
        isProjected: true,
        willOverrun: cumRunning > budget,
      })
      d.setMonth(d.getMonth() + 1)
    }
  }

  return (
    <div className="max-w-6xl space-y-8">

      {/* ── Header ── */}
      <div>
        <Link href="/programs" className="text-sm text-zinc-400 hover:text-zinc-600">← Programs</Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{program.program_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span className="font-mono">{program.worktag}</span>
              {program.grant_number && <><span>·</span><span>{program.grant_number}</span></>}
              {program.sponsor      && <><span>·</span><span>{program.sponsor}</span></>}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[program.status] ?? ''}`}>
                {program.status}
              </span>
            </div>
            {program.tpoc && (
              <p className="mt-1 text-xs text-zinc-400">
                TPOC:{' '}
                <Link href={`/staff/${program.tpoc.staff_id}`} className="hover:underline text-zinc-600">
                  {program.tpoc.first_name} {program.tpoc.last_name}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Period of Performance timeline ── */}
      {popStart && popEnd && popProgress != null && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-700">Period of Performance</h2>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              {daysRemaining != null && daysRemaining > 0 && (
                <span className={daysRemaining < 60 ? 'text-yellow-600 font-medium' : ''}>
                  {daysRemaining} days remaining
                </span>
              )}
              {daysRemaining === 0 && <span className="text-red-600 font-medium">PoP ended</span>}
              <span>{totalDays} days total</span>
            </div>
          </div>
          <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                popProgress > 90 ? 'bg-red-500' : popProgress > 70 ? 'bg-yellow-400' : 'bg-zinc-700'
              }`}
              style={{ width: `${popProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-400 mt-1.5">
            <span>{popStart.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })}</span>
            <span className="font-medium text-zinc-600">{popProgress.toFixed(0)}% elapsed</span>
            <span>{popEnd.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      )}

      {/* ── Key metrics ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Budget"    value={formatCurrency(budget)} sub="burdened" />
        <StatCard
          label="Total Charged"
          value={formatCurrency(totalSpent)}
          sub={budget > 0 ? `${((totalSpent / budget) * 100).toFixed(1)}% of budget` : undefined}
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(Math.abs(remaining))}
          sub={remaining < 0 ? 'OVER BUDGET' : 'available'}
        />
        <StatCard
          label="Monthly Burn Rate"
          value={formatCurrency(monthlyBurnRate)}
          sub="avg per month"
        />
      </div>

      {/* ── Budget health row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Projection card */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-medium text-zinc-700">Projected Outcome</h2>
          {projectedEndSpend != null && popEnd != null ? (
            <>
              <div>
                <p className="text-xs text-zinc-500">Projected spend at PoP end</p>
                <p className={`text-xl font-bold mt-0.5 ${projectedOverrun! > 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {formatCurrency(projectedEndSpend)}
                </p>
              </div>
              <div className={`rounded-lg p-3 text-sm ${projectedOverrun! > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {projectedOverrun! > 0
                  ? `⚠ Projected overrun of ${formatCurrency(projectedOverrun!)}`
                  : `✓ On track — ${formatCurrency(-projectedOverrun!)} projected remaining`}
              </div>
              <p className="text-xs text-zinc-400">
                Based on {formatCurrency(monthlyBurnRate)}/mo average over {monthsTracked.toFixed(1)} months tracked.
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">Set PoP dates and record charges to see projection.</p>
          )}
        </div>

        {/* Spend by type donut */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-1">Spend by Type</h2>
          {typeData.length > 0 ? (
            <>
              <DonutChart data={typeData} />
              <div className="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                <div><p className="text-zinc-500">Effort</p><p className="font-medium text-zinc-900">{formatCurrency(totalEffort)}</p></div>
                <div><p className="text-zinc-500">Purchases</p><p className="font-medium text-zinc-900">{formatCurrency(totalPurchases)}</p></div>
                <div><p className="text-zinc-500">Travel</p><p className="font-medium text-zinc-900">{formatCurrency(totalTravel)}</p></div>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 py-10 text-center">No charges yet.</p>
          )}
        </div>

        {/* Charge status donut */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-1">Charge Status</h2>
          {statusDonutData.length > 0 ? (
            <>
              <DonutChart data={statusDonutData} />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
                {Object.entries(statusCounts).map(([s, n]) => (
                  <span key={s}>
                    <span className={`inline-block px-1.5 py-0.5 rounded font-medium ${chargeStatusColor[s]}`}>{s}</span>
                    <span className="ml-1 text-zinc-500">{n}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 py-10 text-center">No charges yet.</p>
          )}
        </div>
      </div>

      {/* ── Budget breakdown ── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Budget Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Total (Burdened)',          budget: program.total_budget_burdened,                     spent: totalSpent },
            { label: 'Salary (Burdened)',          budget: program.total_budget_salary_burdened,              spent: totalEffort },
            { label: 'Salary (Unburdened)',         budget: program.total_budget_salary_unburdened,            spent: null },
            { label: 'Purchases',                  budget: program.total_budget_purchases_unburdened,         spent: totalPurchases + totalTravel },
            { label: 'Capital Equipment',          budget: program.total_budget_capital_equipment_unburdened, spent: null },
          ].filter((r) => r.budget != null).map((row) => {
            const bud  = Number(row.budget)
            const sp   = row.spent ?? 0
            const pct  = bud > 0 ? Math.min(100, (sp / bud) * 100) : 0
            const rem  = bud - sp
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-600 font-medium">{row.label}</span>
                  <div className="flex items-center gap-4 text-zinc-500">
                    {row.spent != null && <span>{formatCurrency(sp)} charged</span>}
                    <span className="text-zinc-900 font-medium">{formatCurrency(bud)} budget</span>
                    {row.spent != null && (
                      <span className={rem < 0 ? 'text-red-600 font-semibold' : 'text-zinc-500'}>
                        {rem < 0 ? `−${formatCurrency(-rem)}` : `${formatCurrency(rem)} left`}
                      </span>
                    )}
                  </div>
                </div>
                {row.spent != null && (
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-400' : 'bg-zinc-700'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Burn chart ── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Monthly Charges + Cumulative Burn</h2>
        {monthlyData.length > 0
          ? <BurnChart data={monthlyData} budget={budget} />
          : <p className="text-sm text-zinc-400 py-10 text-center">No charge data yet.</p>}
      </div>

      {/* ── Forecast chart ── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-zinc-700">Spend Forecast</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Projected at {formatCurrency(monthlyBurnRate)}/mo average.
              {projectedOverrun != null && projectedOverrun > 0 && (
                <span className="ml-1 text-red-600 font-medium">
                  Projected overrun: {formatCurrency(projectedOverrun)}
                </span>
              )}
              {projectedOverrun != null && projectedOverrun <= 0 && (
                <span className="ml-1 text-green-700 font-medium">
                  On track — {formatCurrency(-projectedOverrun)} projected remaining
                </span>
              )}
            </p>
          </div>
        </div>
        {forecastData.length > 0
          ? <ForecastChart data={forecastData} budget={budget} firstProjMonth={firstProjMonth} />
          : <p className="text-sm text-zinc-400 py-10 text-center">No charge data to forecast from.</p>}
      </div>

      {/* ── Who charged this program ── */}
      {staffChargePoints.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Charges by Staff</h2>
          <StaffChargesChart data={staffChargePoints} />
        </div>
      )}

      {/* ── Effort by staff ── */}
      {effortMonthData.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Effort Charges by Staff (Monthly)</h2>
          <StackedBarChart data={effortMonthData} xKey="month" keys={effortStaffKeys} />
        </div>
      )}

      {/* ── Staff charge summary ── */}
      {staffSummary.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Staff Charge Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium text-right">Effort</th>
                <th className="pb-2 font-medium text-right">Expenses</th>
                <th className="pb-2 font-medium text-right">Total</th>
                <th className="pb-2 font-medium text-right">% of Spend</th>
              </tr>
            </thead>
            <tbody>
              {staffSummary.map((s) => {
                const person = program.charges.find((c) => c.staff_id === s.staff_id)?.staff
                return (
                  <tr key={s.staff_id} className="border-b border-zinc-50">
                    <td className="py-2">
                      <Link href={`/staff/${s.staff_id}`} className="font-medium text-zinc-900 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-2 text-zinc-500">{person?.job_title ?? '—'}</td>
                    <td className="py-2 text-right text-zinc-700">{formatCurrency(s.effort)}</td>
                    <td className="py-2 text-right text-zinc-700">{formatCurrency(s.expenses)}</td>
                    <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(s.total)}</td>
                    <td className="py-2 text-right text-zinc-500">
                      {totalSpent > 0 ? `${((s.total / totalSpent) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Staff with effort entries ── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Staff (Effort Logged)</h2>
        {program.effortEntries.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Most Recent Entry</th>
                <th className="pb-2 font-medium text-right">Latest %</th>
              </tr>
            </thead>
            <tbody>
              {program.effortEntries.map((e) => (
                <tr key={e.effort_id} className="border-b border-zinc-50">
                  <td className="py-2">
                    <Link href={`/staff/${e.staff_id}`} className="font-medium text-zinc-900 hover:underline">
                      {e.staff.first_name} {e.staff.last_name}
                    </Link>
                  </td>
                  <td className="py-2 text-zinc-500">{e.staff.job_title}</td>
                  <td className="py-2 text-zinc-500">{e.staff.labor_category}</td>
                  <td className="py-2 text-zinc-400 text-xs">
                    {e.effort_date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-2 text-right text-zinc-700">{Number(e.percentage)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No effort logged yet.</p>
        )}
      </div>

      {/* ── All charges ── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-700">All Charges</h2>
          <span className="text-sm font-medium text-zinc-900">{formatCurrency(totalSpent)} total</span>
        </div>
        {program.charges.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Ref</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Staff</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...program.charges].sort((a, b) => b.charge_date.getTime() - a.charge_date.getTime()).map((c) => (
                <tr key={c.charge_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">{c.charge_type}</span>
                  </td>
                  <td className="py-2 font-mono text-xs text-zinc-400">{c.reference_number}</td>
                  <td className="py-2 text-zinc-700">{c.description ?? '—'}</td>
                  <td className="py-2">
                    <Link href={`/staff/${c.staff_id}`} className="text-zinc-900 hover:underline">
                      {c.staff.first_name} {c.staff.last_name}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-medium text-zinc-900">{formatCurrency(Number(c.amount ?? 0))}</td>
                  <td className="py-2 text-zinc-400">{c.charge_date.toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${chargeStatusColor[c.status] ?? ''}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-zinc-400">No charges recorded.</p>
        )}
      </div>
    </div>
  )
}
