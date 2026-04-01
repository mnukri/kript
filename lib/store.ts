'use client'

import { create } from 'zustand'
import type { Staff, Program, Charge } from './types'

interface AppState {
  staff:    Staff[]
  programs: Program[]
  charges:  Charge[]

  fetchAll: () => Promise<void>

  addStaff:    (s: Omit<Staff, 'staff_id'>) => Promise<void>
  updateStaff: (id: number, s: Partial<Staff>) => Promise<void>
  deleteStaff: (id: number) => Promise<void>

  addProgram:    (p: Omit<Program, 'program_id'>) => Promise<void>
  updateProgram: (id: number, p: Partial<Program>) => Promise<void>
  deleteProgram: (id: number) => Promise<void>

  addCharge:    (c: Omit<Charge, 'charge_id'>) => Promise<void>
  updateCharge: (id: number, c: Partial<Charge>) => Promise<void>
  deleteCharge: (id: number) => Promise<void>
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const useStore = create<AppState>((set) => ({
  staff:    [],
  programs: [],
  charges:  [],

  fetchAll: async () => {
    const [staff, programs, charges] = await Promise.all([
      api<Staff[]>('/api/staff'),
      api<Program[]>('/api/programs'),
      api<Charge[]>('/api/charges'),
    ])
    set({ staff, programs, charges })
  },

  addStaff: async (s) => {
    const created = await api<Staff>('/api/staff', { method: 'POST', body: JSON.stringify(s) })
    set((state) => ({ staff: [...state.staff, created] }))
  },
  updateStaff: async (id, s) => {
    const updated = await api<Staff>(`/api/staff/${id}`, { method: 'PATCH', body: JSON.stringify(s) })
    set((state) => ({ staff: state.staff.map((x) => x.staff_id === id ? updated : x) }))
  },
  deleteStaff: async (id) => {
    await api(`/api/staff/${id}`, { method: 'DELETE' })
    set((state) => ({ staff: state.staff.filter((x) => x.staff_id !== id) }))
  },

  addProgram: async (p) => {
    const created = await api<Program>('/api/programs', { method: 'POST', body: JSON.stringify(p) })
    set((state) => ({ programs: [...state.programs, created] }))
  },
  updateProgram: async (id, p) => {
    const updated = await api<Program>(`/api/programs/${id}`, { method: 'PATCH', body: JSON.stringify(p) })
    set((state) => ({ programs: state.programs.map((x) => x.program_id === id ? updated : x) }))
  },
  deleteProgram: async (id) => {
    await api(`/api/programs/${id}`, { method: 'DELETE' })
    set((state) => ({ programs: state.programs.filter((x) => x.program_id !== id) }))
  },

  addCharge: async (c) => {
    const created = await api<Charge>('/api/charges', { method: 'POST', body: JSON.stringify(c) })
    set((state) => ({ charges: [...state.charges, created] }))
  },
  updateCharge: async (id, c) => {
    const updated = await api<Charge>(`/api/charges/${id}`, { method: 'PATCH', body: JSON.stringify(c) })
    set((state) => ({ charges: state.charges.map((x) => x.charge_id === id ? updated : x) }))
  },
  deleteCharge: async (id) => {
    await api(`/api/charges/${id}`, { method: 'DELETE' })
    set((state) => ({ charges: state.charges.filter((x) => x.charge_id !== id) }))
  },
}))
