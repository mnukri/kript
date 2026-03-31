'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { ProgramSalaryCharge } from '@/lib/types'
import Modal from './modal'
import { Field, inputCls, selectCls } from './field'
import { formatCurrency, formatMonth } from '@/lib/mock-data'

const blank = (): Omit<ProgramSalaryCharge, 'charge_id'> => ({
  program_id: 0, staff_id: 0, charge_month: '', amount_charged: 0, applied_percentage: null,
})

export default function ManageSalaryCharges() {
  const { salaryCharges, programs, staff, addSalaryCharge, updateSalaryCharge, deleteSalaryCharge } = useStore()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<ProgramSalaryCharge | null>(null)
  const [form, setForm]       = useState(blank())

  function openAdd() {
    setEditing(null)
    setForm(blank())
    setOpen(true)
  }

  function openEdit(c: ProgramSalaryCharge) {
    setEditing(c)
    setForm({ program_id: c.program_id, staff_id: c.staff_id, charge_month: c.charge_month, amount_charged: c.amount_charged, applied_percentage: c.applied_percentage })
    setOpen(true)
  }

  function save() {
    if (!form.program_id || !form.staff_id || !form.charge_month || !form.amount_charged) return
    if (editing) updateSalaryCharge(editing.charge_id, form)
    else addSalaryCharge(form)
    setOpen(false)
  }

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const getStaffName = (id: number) => { const s = staff.find((x) => x.staff_id === id); return s ? `${s.first_name} ${s.last_name}` : '—' }
  const getProgramName = (id: number) => programs.find((p) => p.program_id === id)?.program_name ?? '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{salaryCharges.length} salary charge records</p>
        <button onClick={openAdd} className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
          + Add Charge
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Staff</th>
              <th className="px-4 py-3 text-left font-medium">Program</th>
              <th className="px-4 py-3 text-left font-medium">Month</th>
              <th className="px-4 py-3 text-left font-medium">Applied %</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {salaryCharges.map((c) => (
              <tr key={c.charge_id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">{getStaffName(c.staff_id)}</td>
                <td className="px-4 py-3 text-zinc-600">{getProgramName(c.program_id)}</td>
                <td className="px-4 py-3 text-zinc-500">{formatMonth(c.charge_month)}</td>
                <td className="px-4 py-3 text-zinc-500">{c.applied_percentage != null ? `${c.applied_percentage}%` : '—'}</td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900">{formatCurrency(c.amount_charged)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(c)} className="text-xs text-zinc-500 hover:text-zinc-900">Edit</button>
                  <button onClick={() => deleteSalaryCharge(c.charge_id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Edit Salary Charge' : 'Add Salary Charge'} onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <Field label="Staff" required>
              <select className={selectCls} value={form.staff_id} onChange={(e) => set('staff_id', Number(e.target.value))}>
                <option value={0}>Select staff…</option>
                {staff.map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Program" required>
              <select className={selectCls} value={form.program_id} onChange={(e) => set('program_id', Number(e.target.value))}>
                <option value={0}>Select program…</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={p.program_id}>{p.program_name} ({p.worktag})</option>
                ))}
              </select>
            </Field>
            <Field label="Charge Week / Month" required>
              <input
                className={inputCls}
                type="date"
                value={form.charge_month}
                onChange={(e) => set('charge_month', e.target.value)}
              />
              <p className="text-xs text-zinc-400 mt-1">Enter the start of the week or any date in the month</p>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount ($)" required>
                <input className={inputCls} type="number" step="0.01" value={form.amount_charged || ''} onChange={(e) => set('amount_charged', Number(e.target.value))} />
              </Field>
              <Field label="Applied % (optional)">
                <input className={inputCls} type="number" step="0.01" min="0" max="100" value={form.applied_percentage ?? ''} onChange={(e) => set('applied_percentage', e.target.value === '' ? null : Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
                {editing ? 'Save Changes' : 'Add Charge'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
