'use client'

import { create } from 'zustand'
import type { Staff, Program, ProgramExpense, ProgramSalaryCharge } from './types'

interface AppState {
  staff:         Staff[]
  programs:      Program[]
  expenses:      ProgramExpense[]
  salaryCharges: ProgramSalaryCharge[]

  fetchAll: () => Promise<void>

  addStaff:    (s: Omit<Staff, 'staff_id'>) => Promise<void>
  updateStaff: (id: number, s: Partial<Staff>) => Promise<void>
  deleteStaff: (id: number) => Promise<void>

  addProgram:    (p: Omit<Program, 'program_id'>) => Promise<void>
  updateProgram: (id: number, p: Partial<Program>) => Promise<void>
  deleteProgram: (id: number) => Promise<void>

  addExpense:    (e: Omit<ProgramExpense, 'expense_id'>) => Promise<void>
  updateExpense: (id: number, e: Partial<ProgramExpense>) => Promise<void>
  deleteExpense: (id: number) => Promise<void>

  addSalaryCharge:    (c: Omit<ProgramSalaryCharge, 'charge_id'>) => Promise<void>
  updateSalaryCharge: (id: number, c: Partial<ProgramSalaryCharge>) => Promise<void>
  deleteSalaryCharge: (id: number) => Promise<void>
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const useStore = create<AppState>((set) => ({
  staff:         [],
  programs:      [],
  expenses:      [],
  salaryCharges: [],

  fetchAll: async () => {
    const [staff, programs, expenses, salaryCharges] = await Promise.all([
      api<Staff[]>('/api/staff'),
      api<Program[]>('/api/programs'),
      api<ProgramExpense[]>('/api/expenses'),
      api<ProgramSalaryCharge[]>('/api/salary-charges'),
    ])
    set({ staff, programs, expenses, salaryCharges })
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

  addExpense: async (e) => {
    const created = await api<ProgramExpense>('/api/expenses', { method: 'POST', body: JSON.stringify(e) })
    set((state) => ({ expenses: [...state.expenses, created] }))
  },
  updateExpense: async (id, e) => {
    const updated = await api<ProgramExpense>(`/api/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(e) })
    set((state) => ({ expenses: state.expenses.map((x) => x.expense_id === id ? updated : x) }))
  },
  deleteExpense: async (id) => {
    await api(`/api/expenses/${id}`, { method: 'DELETE' })
    set((state) => ({ expenses: state.expenses.filter((x) => x.expense_id !== id) }))
  },

  addSalaryCharge: async (c) => {
    const created = await api<ProgramSalaryCharge>('/api/salary-charges', { method: 'POST', body: JSON.stringify(c) })
    set((state) => ({ salaryCharges: [...state.salaryCharges, created] }))
  },
  updateSalaryCharge: async (id, c) => {
    const updated = await api<ProgramSalaryCharge>(`/api/salary-charges/${id}`, { method: 'PATCH', body: JSON.stringify(c) })
    set((state) => ({ salaryCharges: state.salaryCharges.map((x) => x.charge_id === id ? updated : x) }))
  },
  deleteSalaryCharge: async (id) => {
    await api(`/api/salary-charges/${id}`, { method: 'DELETE' })
    set((state) => ({ salaryCharges: state.salaryCharges.filter((x) => x.charge_id !== id) }))
  },
}))
