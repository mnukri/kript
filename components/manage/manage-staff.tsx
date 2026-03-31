'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Staff } from '@/lib/types'
import Modal from './modal'
import { Field, inputCls, selectCls } from './field'

const blank = (): Omit<Staff, 'staff_id'> => ({
  first_name: '', last_name: '', email: '', job_title: '',
  department: '', hire_date: '', is_active: true,
})

export default function ManageStaff() {
  const { staff, addStaff, updateStaff, deleteStaff } = useStore()
  const [open, setOpen]     = useState(false)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [form, setForm]     = useState(blank())

  function openAdd() {
    setEditing(null)
    setForm(blank())
    setOpen(true)
  }

  function openEdit(s: Staff) {
    setEditing(s)
    setForm({ first_name: s.first_name, last_name: s.last_name, email: s.email, job_title: s.job_title, department: s.department, hire_date: s.hire_date, is_active: s.is_active })
    setOpen(true)
  }

  function save() {
    if (!form.first_name || !form.last_name) return
    if (editing) updateStaff(editing.staff_id, form)
    else addStaff(form)
    setOpen(false)
  }

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{staff.length} staff members</p>
        <button onClick={openAdd} className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
          + Add Staff
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Department</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Hired</th>
              <th className="px-4 py-3 text-left font-medium">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.staff_id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">{s.first_name} {s.last_name}</td>
                <td className="px-4 py-3 text-zinc-600">{s.job_title}</td>
                <td className="px-4 py-3 text-zinc-500">{s.department}</td>
                <td className="px-4 py-3 text-zinc-500">{s.email}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{s.hire_date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
                    {s.is_active ? 'yes' : 'no'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(s)} className="text-xs text-zinc-500 hover:text-zinc-900">Edit</button>
                  <button onClick={() => deleteStaff(s.staff_id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Edit Staff' : 'Add Staff'} onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input className={inputCls} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
              </Field>
              <Field label="Last Name" required>
                <input className={inputCls} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
              </Field>
            </div>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Job Title">
              <input className={inputCls} value={form.job_title} onChange={(e) => set('job_title', e.target.value)} />
            </Field>
            <Field label="Department">
              <input className={inputCls} value={form.department} onChange={(e) => set('department', e.target.value)} />
            </Field>
            <Field label="Hire Date">
              <input className={inputCls} type="date" value={form.hire_date} onChange={(e) => set('hire_date', e.target.value)} />
            </Field>
            <Field label="Active">
              <select className={selectCls} value={form.is_active ? 'true' : 'false'} onChange={(e) => set('is_active', e.target.value === 'true')}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
                {editing ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
