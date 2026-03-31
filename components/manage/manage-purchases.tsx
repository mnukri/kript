'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { ProgramExpense } from '@/lib/types'
import Modal from './modal'
import { Field, inputCls, selectCls } from './field'
import { formatCurrency } from '@/lib/mock-data'

const blank = (): Omit<ProgramExpense, 'expense_id'> => ({
  program_id: 0, staff_id: null, expense_date: '', amount: 0,
  category: '', vendor: '', description: '', reference_number: '',
})

const CATEGORIES = ['Supplies', 'Equipment', 'Travel', 'Contractor', 'Software', 'Other']

export default function ManagePurchases() {
  const { expenses, programs, staff, addExpense, updateExpense, deleteExpense } = useStore()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<ProgramExpense | null>(null)
  const [form, setForm]       = useState(blank())

  function openAdd() {
    setEditing(null)
    setForm(blank())
    setOpen(true)
  }

  function openEdit(e: ProgramExpense) {
    setEditing(e)
    setForm({ program_id: e.program_id, staff_id: e.staff_id, expense_date: e.expense_date, amount: e.amount, category: e.category, vendor: e.vendor, description: e.description, reference_number: e.reference_number })
    setOpen(true)
  }

  function save() {
    if (!form.program_id || !form.expense_date || !form.amount) return
    if (editing) updateExpense(editing.expense_id, form)
    else addExpense(form)
    setOpen(false)
  }

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const getStaffName = (id: number | null) => { if (!id) return '—'; const s = staff.find((x) => x.staff_id === id); return s ? `${s.first_name} ${s.last_name}` : '—' }
  const getProgramWorktag = (id: number) => programs.find((p) => p.program_id === id)?.worktag ?? '—'

  const sorted = [...expenses].sort((a, b) => b.expense_date.localeCompare(a.expense_date))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{expenses.length} purchase records</p>
        <button onClick={openAdd} className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
          + Add Purchase
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Ref</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Program</th>
              <th className="px-4 py-3 text-left font-medium">Purchased By</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.expense_id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{e.reference_number}</td>
                <td className="px-4 py-3 text-zinc-700">{e.description}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">{e.category}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-600">{getProgramWorktag(e.program_id)}</td>
                <td className="px-4 py-3 text-zinc-500">{getStaffName(e.staff_id)}</td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{e.expense_date}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(e)} className="text-xs text-zinc-500 hover:text-zinc-900">Edit</button>
                  <button onClick={() => deleteExpense(e.expense_id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Edit Purchase' : 'Add Purchase'} onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <Field label="Description">
              <input className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Program" required>
                <select className={selectCls} value={form.program_id} onChange={(e) => set('program_id', Number(e.target.value))}>
                  <option value={0}>Select program…</option>
                  {programs.map((p) => (
                    <option key={p.program_id} value={p.program_id}>{p.program_name} ({p.worktag})</option>
                  ))}
                </select>
              </Field>
              <Field label="Purchased By">
                <select className={selectCls} value={form.staff_id ?? ''} onChange={(e) => set('staff_id', e.target.value === '' ? null : Number(e.target.value))}>
                  <option value="">— None —</option>
                  {staff.map((s) => (
                    <option key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select className={selectCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Date" required>
                <input className={inputCls} type="date" value={form.expense_date} onChange={(e) => set('expense_date', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount ($)" required>
                <input className={inputCls} type="number" step="0.01" value={form.amount || ''} onChange={(e) => set('amount', Number(e.target.value))} />
              </Field>
              <Field label="Reference Number">
                <input className={inputCls} value={form.reference_number} onChange={(e) => set('reference_number', e.target.value)} />
              </Field>
            </div>
            <Field label="Vendor">
              <input className={inputCls} value={form.vendor} onChange={(e) => set('vendor', e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
                {editing ? 'Save Changes' : 'Add Purchase'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
