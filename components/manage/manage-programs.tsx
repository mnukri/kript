'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Program } from '@/lib/types'
import Modal from './modal'
import { Field, inputCls, selectCls } from './field'
import { formatCurrency } from '@/lib/mock-data'

const blank = (): Omit<Program, 'program_id'> => ({
  program_name:                              '',
  worktag:                                   '',
  status:                                    'active',
  pop_start:                                 null,
  pop_end:                                   null,
  total_budget_burdened:                     null,
  total_budget_salary_burdened:              null,
  total_budget_salary_unburdened:            null,
  total_budget_purchases_unburdened:         null,
  total_budget_capital_equipment_unburdened: null,
  sponsor:                                   null,
  grant_number:                              null,
  tpoc_staff_id:                             null,
})

const statusColor: Record<string, string> = {
  active:  'bg-green-50 text-green-700',
  closed:  'bg-zinc-100 text-zinc-500',
  pending: 'bg-yellow-50 text-yellow-700',
}

export default function ManagePrograms() {
  const { programs, staff, addProgram, updateProgram, deleteProgram } = useStore()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm]       = useState(blank())

  function openAdd() {
    setEditing(null)
    setForm(blank())
    setOpen(true)
  }

  function openEdit(p: Program) {
    setEditing(p)
    setForm({
      program_name:                              p.program_name,
      worktag:                                   p.worktag,
      status:                                    p.status,
      pop_start:                                 p.pop_start,
      pop_end:                                   p.pop_end,
      total_budget_burdened:                     p.total_budget_burdened,
      total_budget_salary_burdened:              p.total_budget_salary_burdened,
      total_budget_salary_unburdened:            p.total_budget_salary_unburdened,
      total_budget_purchases_unburdened:         p.total_budget_purchases_unburdened,
      total_budget_capital_equipment_unburdened: p.total_budget_capital_equipment_unburdened,
      sponsor:                                   p.sponsor,
      grant_number:                              p.grant_number,
      tpoc_staff_id:                             p.tpoc_staff_id,
    })
    setOpen(true)
  }

  function save() {
    if (!form.program_name || !form.worktag) return
    if (editing) updateProgram(editing.program_id, form)
    else addProgram(form)
    setOpen(false)
  }

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const numField = (v: string) => v === '' ? null : Number(v)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{programs.length} programs</p>
        <button onClick={openAdd} className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
          + Add Program
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Program</th>
              <th className="px-4 py-3 text-left font-medium">Worktag</th>
              <th className="px-4 py-3 text-left font-medium">Sponsor</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Budget (Burdened)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.program_id} className="border-b border-zinc-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{p.program_name}</p>
                  <p className="text-xs text-zinc-400">{p.grant_number}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-600">{p.worktag}</td>
                <td className="px-4 py-3 text-zinc-500">{p.sponsor}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {p.total_budget_burdened != null ? formatCurrency(Number(p.total_budget_burdened)) : '—'}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-zinc-500 hover:text-zinc-900">Edit</button>
                  <button onClick={() => deleteProgram(p.program_id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Edit Program' : 'Add Program'} onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <Field label="Program Name" required>
              <input className={inputCls} value={form.program_name} onChange={(e) => set('program_name', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Worktag" required>
                <input className={inputCls} value={form.worktag} onChange={(e) => set('worktag', e.target.value)} />
              </Field>
              <Field label="Grant Number">
                <input className={inputCls} value={form.grant_number ?? ''} onChange={(e) => set('grant_number', e.target.value || null)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sponsor">
                <input className={inputCls} value={form.sponsor ?? ''} onChange={(e) => set('sponsor', e.target.value || null)} />
              </Field>
              <Field label="Status">
                <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value as Program['status'])}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Period Start">
                <input className={inputCls} type="date" value={form.pop_start ?? ''} onChange={(e) => set('pop_start', e.target.value || null)} />
              </Field>
              <Field label="Period End">
                <input className={inputCls} type="date" value={form.pop_end ?? ''} onChange={(e) => set('pop_end', e.target.value || null)} />
              </Field>
            </div>
            <Field label="TPOC (Technical Point of Contact)">
              <select className={selectCls} value={form.tpoc_staff_id ?? ''} onChange={(e) => set('tpoc_staff_id', e.target.value === '' ? null : Number(e.target.value))}>
                <option value="">— None —</option>
                {staff.map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </Field>
            <p className="text-xs font-medium text-zinc-500 pt-1">Budget Breakdown ($)</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Budget (Burdened)">
                <input className={inputCls} type="number" value={form.total_budget_burdened ?? ''} onChange={(e) => set('total_budget_burdened', numField(e.target.value))} />
              </Field>
              <Field label="Salary Budget (Burdened)">
                <input className={inputCls} type="number" value={form.total_budget_salary_burdened ?? ''} onChange={(e) => set('total_budget_salary_burdened', numField(e.target.value))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Salary Budget (Unburdened)">
                <input className={inputCls} type="number" value={form.total_budget_salary_unburdened ?? ''} onChange={(e) => set('total_budget_salary_unburdened', numField(e.target.value))} />
              </Field>
              <Field label="Purchases Budget">
                <input className={inputCls} type="number" value={form.total_budget_purchases_unburdened ?? ''} onChange={(e) => set('total_budget_purchases_unburdened', numField(e.target.value))} />
              </Field>
            </div>
            <Field label="Capital Equipment Budget">
              <input className={inputCls} type="number" value={form.total_budget_capital_equipment_unburdened ?? ''} onChange={(e) => set('total_budget_capital_equipment_unburdened', numField(e.target.value))} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
                {editing ? 'Save Changes' : 'Add Program'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
