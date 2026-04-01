'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Field, inputCls, selectCls } from '@/components/manage/field'

interface StaffOption   { staff_id: number; first_name: string; last_name: string }
interface ProgramOption { program_id: number; program_name: string; worktag: string; status: string }

interface ChargeRow {
  program_id:     number
  charge_type:    'purchase' | 'travel'
  amount:         number
  description:    string
  reference_number: string
  vendor:         string
  category:       string
  destination:    string
  trip_purpose:   string
  departure_date: string
  return_date:    string
}

type Mode = 'day' | 'week'

const PURCHASE_CATEGORIES = ['Supplies', 'Equipment', 'Software', 'Contractor', 'Other']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getWeekStart(date: Date) {
  const d = new Date(date)
  // Monday-based week start
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function getWeekDates(weekStart: string): string[] {
  const base = new Date(weekStart + 'T00:00:00Z')
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function blankCharge(): ChargeRow {
  return {
    program_id: 0, charge_type: 'purchase', amount: 0,
    description: '', reference_number: '', vendor: '', category: '',
    destination: '', trip_purpose: '', departure_date: '', return_date: '',
  }
}

function HoursInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number" min={0} max={24} step={0.5}
      value={value || ''}
      placeholder="0"
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 text-right text-sm border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:border-zinc-400"
    />
  )
}

export default function TimesheetPage() {
  const router = useRouter()
  const [mode, setMode]         = useState<Mode>('day')
  const [staffList, setStaffList] = useState<StaffOption[]>([])
  const [programs, setPrograms]   = useState<ProgramOption[]>([])

  const [staffId,    setStaffId]    = useState<number>(0)
  // Day mode
  const [dayDate,    setDayDate]    = useState<string>(todayISO())
  // Day hours: { [program_id]: hours }
  const [dayHours,   setDayHours]   = useState<Record<number, number>>({})
  // Week mode
  const [weekStart,  setWeekStart]  = useState<string>(getWeekStart(new Date()))
  // Week hours: { [program_id]: { [date]: hours } }
  const [weekHours,  setWeekHours]  = useState<Record<number, Record<string, number>>>({})

  const [charges,    setCharges]    = useState<ChargeRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const weekDates = getWeekDates(weekStart)

  const dayTotal  = Object.values(dayHours).reduce((s, h) => s + h, 0)
  const weekColTotals = weekDates.map((d) =>
    programs.reduce((s, p) => s + (weekHours[p.program_id]?.[d] ?? 0), 0)
  )
  const weekRowTotals = programs.map((p) =>
    weekDates.reduce((s, d) => s + (weekHours[p.program_id]?.[d] ?? 0), 0)
  )

  useEffect(() => {
    Promise.all([
      fetch('/api/staff').then((r) => r.json()),
      fetch('/api/programs').then((r) => r.json()),
    ]).then(([s, p]) => {
      setStaffList(s)
      setPrograms(p.filter((prog: ProgramOption) => prog.status === 'active'))
    })
  }, [])

  // Reset hours when programs load
  useEffect(() => {
    setDayHours(Object.fromEntries(programs.map((p) => [p.program_id, 0])))
    setWeekHours(Object.fromEntries(programs.map((p) => [p.program_id, {}])))
  }, [programs.length])

  const setDayHour = useCallback((program_id: number, hours: number) => {
    setDayHours((prev) => ({ ...prev, [program_id]: hours }))
  }, [])

  const setWeekHour = useCallback((program_id: number, date: string, hours: number) => {
    setWeekHours((prev) => ({
      ...prev,
      [program_id]: { ...(prev[program_id] ?? {}), [date]: hours },
    }))
  }, [])

  function buildEntries() {
    if (mode === 'day') {
      const activePrograms = programs.filter((p) => (dayHours[p.program_id] ?? 0) > 0)
      if (dayTotal === 0) return []
      return activePrograms.map((p) => ({
        date:       dayDate,
        program_id: p.program_id,
        hours:      dayHours[p.program_id] ?? 0,
      }))
    } else {
      const entries: { date: string; program_id: number; hours: number }[] = []
      programs.forEach((p) => {
        weekDates.forEach((d) => {
          const h = weekHours[p.program_id]?.[d] ?? 0
          if (h > 0) entries.push({ date: d, program_id: p.program_id, hours: h })
        })
      })
      return entries
    }
  }

  async function handleSubmit() {
    if (!staffId) { setError('Select a staff member.'); return }
    const entries = buildEntries()
    if (entries.length === 0) { setError('Enter at least some hours.'); return }

    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/timesheet', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ staff_id: staffId, entries, charges }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSubmitted(false)
    setDayHours(Object.fromEntries(programs.map((p) => [p.program_id, 0])))
    setWeekHours(Object.fromEntries(programs.map((p) => [p.program_id, {}])))
    setCharges([])
  }

  if (submitted) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-lg font-medium text-green-800">Timesheet submitted</p>
          <p className="mt-1 text-sm text-green-600">
            {mode === 'day'
              ? `${dayTotal.toFixed(1)}h logged for ${dayDate}`
              : `Week of ${weekStart} logged`}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={resetForm} className="px-4 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50">
              Submit another
            </button>
            <button onClick={() => router.push('/')} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-md hover:bg-zinc-700">
              Go to Overview
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Timesheet</h1>
        <p className="mt-1 text-sm text-zinc-500">Log hours by day or across an entire week</p>
      </div>

      {/* Mode + Who */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
          {(['day', 'week'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === m ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {m === 'day' ? 'Single Day' : 'Full Week'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Staff Member" required>
            <select className={selectCls} value={staffId} onChange={(e) => setStaffId(Number(e.target.value))}>
              <option value={0}>Select…</option>
              {staffList.map((s) => (
                <option key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </Field>
          {mode === 'day' ? (
            <Field label="Date" required>
              <input className={inputCls} type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} />
            </Field>
          ) : (
            <Field label="Week Starting (Monday)" required>
              <input className={inputCls} type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            </Field>
          )}
        </div>
      </div>

      {/* Hour entry */}
      {mode === 'day' ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-700">Hours by Program</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Enter hours worked on each program for {dayDate}</p>
            </div>
            {dayTotal > 0 && (
              <span className={`text-sm font-medium ${dayTotal > 8 ? 'text-yellow-600' : 'text-zinc-700'}`}>
                {dayTotal.toFixed(1)}h total{dayTotal > 8 ? ' (over 8h)' : ''}
              </span>
            )}
          </div>

          {!staffId ? (
            <p className="text-sm text-zinc-400">Select a staff member first.</p>
          ) : programs.length === 0 ? (
            <p className="text-sm text-zinc-400">No active programs found.</p>
          ) : (
            <div className="space-y-2">
              {programs.map((p) => (
                <div key={p.program_id} className="flex items-center gap-4 py-2 border-b border-zinc-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{p.program_name}</p>
                    <p className="text-xs text-zinc-400 font-mono">{p.worktag}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <HoursInput
                      value={dayHours[p.program_id] ?? 0}
                      onChange={(v) => setDayHour(p.program_id, v)}
                    />
                    <span className="text-xs text-zinc-400 w-4">h</span>
                  </div>
                </div>
              ))}
              {dayTotal > 0 && (
                <div className="pt-2 flex justify-end">
                  <div className="text-sm text-zinc-500">
                    Effort split:{' '}
                    {programs
                      .filter((p) => (dayHours[p.program_id] ?? 0) > 0)
                      .map((p) => `${p.worktag} ${((dayHours[p.program_id] / dayTotal) * 100).toFixed(0)}%`)
                      .join(' · ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Week grid */
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-700">Weekly Hours Grid</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Enter hours per program per day</p>
          </div>

          {!staffId ? (
            <p className="text-sm text-zinc-400">Select a staff member first.</p>
          ) : programs.length === 0 ? (
            <p className="text-sm text-zinc-400">No active programs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="pb-2 text-left text-xs text-zinc-500 font-medium pr-4 min-w-[180px]">Program</th>
                    {weekDates.map((d, i) => (
                      <th key={d} className="pb-2 text-center text-xs text-zinc-500 font-medium px-2 w-20">
                        <div>{DAY_LABELS[i]}</div>
                        <div className="text-zinc-400 font-normal">{d.slice(5)}</div>
                      </th>
                    ))}
                    <th className="pb-2 text-right text-xs text-zinc-500 font-medium pl-3 w-16">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p, pi) => (
                    <tr key={p.program_id} className="border-b border-zinc-50">
                      <td className="py-2 pr-4">
                        <p className="text-sm font-medium text-zinc-900 truncate max-w-[160px]">{p.program_name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{p.worktag}</p>
                      </td>
                      {weekDates.map((d) => (
                        <td key={d} className="py-2 px-2 text-center">
                          <HoursInput
                            value={weekHours[p.program_id]?.[d] ?? 0}
                            onChange={(v) => setWeekHour(p.program_id, d, v)}
                          />
                        </td>
                      ))}
                      <td className="py-2 pl-3 text-right">
                        <span className={`text-sm font-medium ${weekRowTotals[pi] > 0 ? 'text-zinc-900' : 'text-zinc-300'}`}>
                          {weekRowTotals[pi].toFixed(1)}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-200">
                    <td className="pt-2 text-xs text-zinc-500 font-medium pr-4">Day total</td>
                    {weekColTotals.map((t, i) => (
                      <td key={i} className="pt-2 px-2 text-center">
                        <span className={`text-xs font-medium ${t > 8 ? 'text-yellow-600' : t > 0 ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          {t > 0 ? `${t.toFixed(1)}h` : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="pt-2 pl-3 text-right text-xs font-semibold text-zinc-900">
                      {weekColTotals.reduce((s, t) => s + t, 0).toFixed(1)}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Purchases & Travel */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-700">Purchases &amp; Travel</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Leave empty if none this period</p>
          </div>
          <button
            onClick={() => setCharges((p) => [...p, blankCharge()])}
            className="text-xs px-3 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-700"
          >
            + Add
          </button>
        </div>

        {charges.length === 0 ? (
          <p className="text-sm text-zinc-400">No purchases or travel.</p>
        ) : (
          <div className="space-y-4">
            {charges.map((c, i) => (
              <div key={i} className="border border-zinc-100 rounded-lg p-4 space-y-3 relative">
                <button
                  onClick={() => setCharges((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-zinc-300 hover:text-red-500 text-lg leading-none"
                >
                  &times;
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type" required>
                    <select
                      className={selectCls} value={c.charge_type}
                      onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, charge_type: ev.target.value as 'purchase' | 'travel' } : x))}
                    >
                      <option value="purchase">Purchase</option>
                      <option value="travel">Travel</option>
                    </select>
                  </Field>
                  <Field label="Program" required>
                    <select
                      className={selectCls} value={c.program_id}
                      onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, program_id: Number(ev.target.value) } : x))}
                    >
                      <option value={0}>Select program…</option>
                      {programs.map((p) => (
                        <option key={p.program_id} value={p.program_id}>{p.program_name} ({p.worktag})</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount ($)" required>
                    <input
                      className={inputCls} type="number" step="0.01" value={c.amount || ''}
                      onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, amount: Number(ev.target.value) } : x))}
                    />
                  </Field>
                  <Field label="Reference #">
                    <input
                      className={inputCls} value={c.reference_number}
                      onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, reference_number: ev.target.value } : x))}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <input
                    className={inputCls} value={c.description}
                    onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))}
                  />
                </Field>
                {c.charge_type === 'purchase' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Vendor">
                      <input
                        className={inputCls} value={c.vendor}
                        onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, vendor: ev.target.value } : x))}
                      />
                    </Field>
                    <Field label="Category">
                      <select
                        className={selectCls} value={c.category}
                        onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, category: ev.target.value } : x))}
                      >
                        <option value="">Select…</option>
                        {PURCHASE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </Field>
                  </div>
                )}
                {c.charge_type === 'travel' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Destination">
                        <input
                          className={inputCls} value={c.destination}
                          onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, destination: ev.target.value } : x))}
                        />
                      </Field>
                      <Field label="Trip Purpose">
                        <input
                          className={inputCls} value={c.trip_purpose}
                          onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, trip_purpose: ev.target.value } : x))}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Departure">
                        <input
                          className={inputCls} type="date" value={c.departure_date}
                          onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, departure_date: ev.target.value } : x))}
                        />
                      </Field>
                      <Field label="Return">
                        <input
                          className={inputCls} type="date" value={c.return_date}
                          onChange={(ev) => setCharges((p) => p.map((x, j) => j === i ? { ...x, return_date: ev.target.value } : x))}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Timesheet'}
        </button>
      </div>
    </div>
  )
}
