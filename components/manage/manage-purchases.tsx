'use client'

  import { useState } from 'react'
  import { useStore } from '@/lib/store'
  import type { Charge, ChargeStatus } from '@/lib/types'
  import Modal from './modal'
  import { Field, inputCls, selectCls } from './field'
  import { formatCurrency } from '@/lib/mock-data'

  const blank = (): Omit<Charge, 'charge_id'> => ({
    program_id:       0,
    staff_id:         0,
    charge_type:      'purchase',
    charge_date:      '',
    amount:           null,
    description:      null,
    reference_number: 1,
    status:           'draft',
    approved_by:      null,
    notes:            null,
  })

  const statusColor: Record<string, string> = {
    approved:  'bg-green-50 text-green-700',
    submitted: 'bg-blue-50 text-blue-700',
    rejected:  'bg-red-50 text-red-600',
    draft:     'bg-zinc-100 text-zinc-500',
  }

  export default function ManagePurchases() {
    const { charges, programs, staff, addCharge, updateCharge, deleteCharge } = useStore()
    const [open, setOpen]       = useState(false)
    const [editing, setEditing] = useState<Charge | null>(null)
    const [form, setForm]       = useState(blank())

    const purchases = charges.filter((c) => c.charge_type === 'purchase')
      .sort((a, b) => b.charge_date.localeCompare(a.charge_date))

    function openAdd() {
      setEditing(null)
      setForm(blank())
      setOpen(true)
    }

    function openEdit(c: Charge) {
      setEditing(c)
      setForm({
        program_id:       c.program_id,
        staff_id:         c.staff_id,
        charge_type:      'purchase',
        charge_date:      c.charge_date,
        amount:           c.amount,
        description:      c.description,
        reference_number: c.reference_number,
        status:           c.status,
        approved_by:      c.approved_by,
        notes:            c.notes,
      })
      setOpen(true)
    }

    function save() {
      if (!form.program_id || !form.staff_id || !form.charge_date) return
      if (editing) updateCharge(editing.charge_id, form)
      else addCharge(form)
      setOpen(false)
    }

    const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

    const getStaffName  = (id: number) => { const s = staff.find((x) => x.staff_id === id); return s ? `${s.first_name} ${s.last_name}` : '—' }
    const getProgramTag = (id: number) => programs.find((p) => p.program_id === id)?.worktag ?? '—'

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{purchases.length} purchase records</p>
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
                <th className="px-4 py-3 text-left font-medium">Staff</th>
                <th className="px-4 py-3 text-left font-medium">Program</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {purchases.map((c) => (
                <tr key={c.charge_id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{c.reference_number}</td>
                  <td className="px-4 py-3 text-zinc-700">{c.description ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{getStaffName(c.staff_id)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{getProgramTag(c.program_id)}</td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">{c.amount != null ? formatCurrency(Number(c.amount)) : '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{c.charge_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(c)} className="text-xs text-zinc-500 hover:text-zinc-900">Edit</button>
                    <button onClick={() => deleteCharge(c.charge_id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {open && (
          <Modal title={editing ? 'Edit Purchase' : 'Add Purchase'} onClose={() => setOpen(false)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" required>
                  <input className={inputCls} type="date" value={form.charge_date ?? ''} onChange={(e) => set('charge_date', e.target.value)} />
                </Field>
                <Field label="Amount ($)">
                  <input className={inputCls} type="number" step="0.01" value={form.amount ?? ''} onChange={(e) => set('amount', e.target.value === '' ? null :
  Number(e.target.value))} />
                </Field>
              </div>
              <Field label="Description">
                <input className={inputCls} value={form.description ?? ''} onChange={(e) => set('description', e.target.value || null)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Reference Number">
                  <input className={inputCls} type="number" value={form.reference_number} onChange={(e) => set('reference_number', Number(e.target.value))} />
                </Field>
                <Field label="Status">
                  <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value as ChargeStatus)}>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </Field>
              </div>
              <Field label="Notes">
                <input className={inputCls} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || null)} />
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