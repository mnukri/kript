'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Field, inputCls, selectCls } from './field'

type GlobalRole = 'admin' | 'manager' | 'staff'

interface ManagedUser {
  user_id:       number
  email:         string
  global_role:   GlobalRole
  microsoft_oid: string | null
  staff: { first_name: string; last_name: string }
}

const roleColor: Record<GlobalRole, string> = {
  admin:   'bg-red-50 text-red-700',
  manager: 'bg-blue-50 text-blue-700',
  staff:   'bg-zinc-100 text-zinc-600',
}

export default function ManageUsers() {
  const { data: session } = useSession()
  const isAdmin = session?.user.globalRole === 'admin'

  const [users, setUsers]   = useState<ManagedUser[]>([])
  const [open, setOpen]     = useState(false)
  const [email, setEmail]   = useState('')
  const [role, setRole]     = useState<GlobalRole>('staff')
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchUsers() {
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json())
  }

  useEffect(() => { fetchUsers() }, [])

  async function save() {
    if (!email) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, global_role: role }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      return
    }
    await fetchUsers()
    setOpen(false)
    setEmail('')
    setRole('staff')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{users.length} users</p>
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700">
          + Add User
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {u.staff.first_name} {u.staff.last_name}
                </td>
                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColor[u.global_role]}`}>
                    {u.global_role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.microsoft_oid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {u.microsoft_oid ? 'Active' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h2 className="text-base font-semibold text-zinc-900">Add User</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field label="Email" required>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="name@kript.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              {isAdmin && (
                <Field label="Role">
                  <select className={selectCls} value={role} onChange={(e) => setRole(e.target.value as GlobalRole)}>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-zinc-400">
                The email must match an existing staff member. They will be prompted to sign in with Microsoft on their first visit.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</button>
                <button onClick={save} disabled={loading} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700 disabled:opacity-50">
                  {loading ? 'Adding…' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
