import type {
  Staff,
  Program,
  ProgramAssignment,
  AssignmentAllocation,
  ProgramExpense,
  StaffSalary,
  ProgramSalaryCharge,
} from './types'

export const staff: Staff[] = [
  { staff_id: 1, first_name: 'Alice',  last_name: 'Johnson',  email: 'alice.johnson@example.com',  job_title: 'Principal Investigator', department: 'Research',       hire_date: '2018-03-15', is_active: true },
  { staff_id: 2, first_name: 'Bob',    last_name: 'Smith',    email: 'bob.smith@example.com',      job_title: 'Research Coordinator',   department: 'Research',       hire_date: '2020-06-01', is_active: true },
  { staff_id: 3, first_name: 'Carol',  last_name: 'Williams', email: 'carol.williams@example.com', job_title: 'Budget Analyst',         department: 'Finance',        hire_date: '2019-11-20', is_active: true },
  { staff_id: 4, first_name: 'David',  last_name: 'Brown',    email: 'david.brown@example.com',    job_title: 'Lab Technician',         department: 'Research',       hire_date: '2021-02-10', is_active: true },
  { staff_id: 5, first_name: 'Eva',    last_name: 'Martinez', email: 'eva.martinez@example.com',   job_title: 'Program Manager',        department: 'Administration', hire_date: '2017-08-05', is_active: true },
]

export const programs: Program[] = [
  { program_id: 1, program_name: 'Climate Resilience Initiative', worktag: 'PG-1001', status: 'active',  pop_start: '2023-01-01', pop_end: '2025-12-31', total_budget: 500000, sponsor: 'NSF', grant_number: 'NSF-2023-CR-001' },
  { program_id: 2, program_name: 'Urban Health Study',            worktag: 'PG-1002', status: 'active',  pop_start: '2022-07-01', pop_end: '2025-06-30', total_budget: 350000, sponsor: 'NIH', grant_number: 'NIH-2022-UH-042' },
  { program_id: 3, program_name: 'Data Infrastructure Grant',     worktag: 'PG-1003', status: 'active',  pop_start: '2024-01-01', pop_end: '2026-12-31', total_budget: 275000, sponsor: 'DOE', grant_number: 'DOE-2024-DI-007' },
  { program_id: 4, program_name: 'Community Outreach Program',    worktag: 'PG-1004', status: 'closed',  pop_start: '2021-01-01', pop_end: '2023-12-31', total_budget: 120000, sponsor: 'HHS', grant_number: 'HHS-2021-CO-015' },
  { program_id: 5, program_name: 'Renewable Energy Research',     worktag: 'PG-1005', status: 'pending', pop_start: '2025-06-01', pop_end: '2028-05-31', total_budget: 800000, sponsor: 'DOE', grant_number: 'DOE-2025-RE-003' },
]

export const assignments: ProgramAssignment[] = [
  { assignment_id: 1,  staff_id: 1, program_id: 1, role: 'Principal Investigator', start_date: '2023-01-01', end_date: null,         is_active: true  },
  { assignment_id: 2,  staff_id: 1, program_id: 2, role: 'Co-Investigator',        start_date: '2022-07-01', end_date: null,         is_active: true  },
  { assignment_id: 3,  staff_id: 2, program_id: 1, role: 'Research Coordinator',   start_date: '2023-01-01', end_date: null,         is_active: true  },
  { assignment_id: 4,  staff_id: 2, program_id: 3, role: 'Research Coordinator',   start_date: '2024-01-01', end_date: null,         is_active: true  },
  { assignment_id: 5,  staff_id: 3, program_id: 1, role: 'Budget Analyst',         start_date: '2023-01-01', end_date: null,         is_active: true  },
  { assignment_id: 6,  staff_id: 3, program_id: 2, role: 'Budget Analyst',         start_date: '2022-07-01', end_date: null,         is_active: true  },
  { assignment_id: 7,  staff_id: 4, program_id: 2, role: 'Lab Technician',         start_date: '2022-07-01', end_date: null,         is_active: true  },
  { assignment_id: 8,  staff_id: 4, program_id: 4, role: 'Lab Technician',         start_date: '2021-01-01', end_date: '2023-12-31', is_active: false },
  { assignment_id: 9,  staff_id: 5, program_id: 3, role: 'Program Manager',        start_date: '2024-01-01', end_date: null,         is_active: true  },
  { assignment_id: 10, staff_id: 5, program_id: 5, role: 'Program Manager',        start_date: '2025-06-01', end_date: null,         is_active: true  },
]

export const allocations: AssignmentAllocation[] = [
  { id: 1,  assignment_id: 1, month: '2024-01-01', percentage: 50 },
  { id: 2,  assignment_id: 1, month: '2024-02-01', percentage: 50 },
  { id: 3,  assignment_id: 1, month: '2024-03-01', percentage: 60 },
  { id: 4,  assignment_id: 2, month: '2024-01-01', percentage: 50 },
  { id: 5,  assignment_id: 2, month: '2024-02-01', percentage: 50 },
  { id: 6,  assignment_id: 2, month: '2024-03-01', percentage: 40 },
  { id: 7,  assignment_id: 3, month: '2024-01-01', percentage: 75 },
  { id: 8,  assignment_id: 3, month: '2024-02-01', percentage: 75 },
  { id: 9,  assignment_id: 3, month: '2024-03-01', percentage: 75 },
  { id: 10, assignment_id: 4, month: '2024-01-01', percentage: 25 },
  { id: 11, assignment_id: 4, month: '2024-02-01', percentage: 25 },
  { id: 12, assignment_id: 4, month: '2024-03-01', percentage: 25 },
  { id: 13, assignment_id: 5, month: '2024-01-01', percentage: 30 },
  { id: 14, assignment_id: 5, month: '2024-02-01', percentage: 30 },
  { id: 15, assignment_id: 6, month: '2024-01-01', percentage: 30 },
  { id: 16, assignment_id: 6, month: '2024-02-01', percentage: 30 },
]

export const expenses: ProgramExpense[] = [
  { expense_id: 1, program_id: 1, staff_id: 2, expense_date: '2024-01-15', amount: 1200,  category: 'Supplies',    vendor: 'Lab Supply Co',      description: 'Lab consumables Q1',         reference_number: 'EXP-001' },
  { expense_id: 2, program_id: 1, staff_id: 3, expense_date: '2024-02-03', amount: 4500,  category: 'Equipment',   vendor: 'Tech Instruments',   description: 'Data logger device',         reference_number: 'EXP-002' },
  { expense_id: 3, program_id: 1, staff_id: 2, expense_date: '2024-03-10', amount: 850,   category: 'Travel',      vendor: 'United Airlines',    description: 'Conference travel',          reference_number: 'EXP-003' },
  { expense_id: 4, program_id: 2, staff_id: 4, expense_date: '2024-01-22', amount: 3200,  category: 'Supplies',    vendor: 'Medical Supply Inc', description: 'Survey materials',           reference_number: 'EXP-004' },
  { expense_id: 5, program_id: 2, staff_id: 1, expense_date: '2024-02-14', amount: 1800,  category: 'Travel',      vendor: 'Hilton Hotels',      description: 'Field visit lodging',        reference_number: 'EXP-005' },
  { expense_id: 6, program_id: 3, staff_id: 5, expense_date: '2024-02-28', amount: 9500,  category: 'Contractor',  vendor: 'DevCorp LLC',        description: 'Software development',       reference_number: 'EXP-006' },
  { expense_id: 7, program_id: 3, staff_id: 5, expense_date: '2024-03-15', amount: 2200,  category: 'Software',    vendor: 'Cloud Services Inc', description: 'Annual license renewal',     reference_number: 'EXP-007' },
  { expense_id: 8, program_id: 4, staff_id: 4, expense_date: '2023-06-10', amount: 600,   category: 'Supplies',    vendor: 'Office Depot',       description: 'Outreach printed materials', reference_number: 'EXP-008' },
]

export const salaries: StaffSalary[] = [
  { salary_id: 1, staff_id: 1, annual_salary: 120000, effective_date: '2023-01-01', end_date: null },
  { salary_id: 2, staff_id: 2, annual_salary: 72000,  effective_date: '2023-01-01', end_date: null },
  { salary_id: 3, staff_id: 3, annual_salary: 68000,  effective_date: '2023-01-01', end_date: null },
  { salary_id: 4, staff_id: 4, annual_salary: 55000,  effective_date: '2023-01-01', end_date: null },
  { salary_id: 5, staff_id: 5, annual_salary: 95000,  effective_date: '2023-01-01', end_date: null },
]

export const salaryCharges: ProgramSalaryCharge[] = [
  { charge_id: 1,  program_id: 1, staff_id: 1, charge_month: '2024-01-01', amount_charged: 5000, applied_percentage: 50 },
  { charge_id: 2,  program_id: 2, staff_id: 1, charge_month: '2024-01-01', amount_charged: 5000, applied_percentage: 50 },
  { charge_id: 3,  program_id: 1, staff_id: 1, charge_month: '2024-02-01', amount_charged: 5000, applied_percentage: 50 },
  { charge_id: 4,  program_id: 2, staff_id: 1, charge_month: '2024-02-01', amount_charged: 5000, applied_percentage: 50 },
  { charge_id: 5,  program_id: 1, staff_id: 2, charge_month: '2024-01-01', amount_charged: 4500, applied_percentage: 75 },
  { charge_id: 6,  program_id: 3, staff_id: 2, charge_month: '2024-01-01', amount_charged: 1500, applied_percentage: 25 },
  { charge_id: 7,  program_id: 1, staff_id: 2, charge_month: '2024-02-01', amount_charged: 4500, applied_percentage: 75 },
  { charge_id: 8,  program_id: 3, staff_id: 2, charge_month: '2024-02-01', amount_charged: 1500, applied_percentage: 25 },
  { charge_id: 9,  program_id: 1, staff_id: 3, charge_month: '2024-01-01', amount_charged: 1700, applied_percentage: 30 },
  { charge_id: 10, program_id: 2, staff_id: 3, charge_month: '2024-01-01', amount_charged: 1700, applied_percentage: 30 },
  { charge_id: 11, program_id: 1, staff_id: 3, charge_month: '2024-02-01', amount_charged: 1700, applied_percentage: 30 },
  { charge_id: 12, program_id: 2, staff_id: 3, charge_month: '2024-02-01', amount_charged: 1700, applied_percentage: 30 },
]

// ── Helpers ────────────────────────────────────────────────────────────────

export function getStaffById(id: number) {
  return staff.find((s) => s.staff_id === id)
}

export function getProgramById(id: number) {
  return programs.find((p) => p.program_id === id)
}

export function getProgramTotalSpend(programId: number) {
  const expenseTotal = expenses
    .filter((e) => e.program_id === programId)
    .reduce((sum, e) => sum + e.amount, 0)
  const salaryTotal = salaryCharges
    .filter((c) => c.program_id === programId)
    .reduce((sum, c) => sum + c.amount_charged, 0)
  return expenseTotal + salaryTotal
}

export function getStaffFullName(staffId: number) {
  const s = getStaffById(staffId)
  return s ? `${s.first_name} ${s.last_name}` : 'Unknown'
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
