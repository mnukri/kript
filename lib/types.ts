export interface Staff {
  staff_id: number
  first_name: string
  last_name: string
  email: string
  job_title: string
  department: string
  hire_date: string
  is_active: boolean
}

export interface Program {
  program_id: number
  program_name: string
  worktag: string
  status: 'active' | 'closed' | 'pending'
  pop_start: string
  pop_end: string
  total_budget: number
  sponsor: string
  grant_number: string
}

export interface ProgramAssignment {
  assignment_id: number
  staff_id: number
  program_id: number
  role: string
  start_date: string
  end_date: string | null
  is_active: boolean
}

export interface AssignmentAllocation {
  id: number
  assignment_id: number
  month: string
  percentage: number
}

export interface ProgramExpense {
  expense_id: number
  program_id: number
  staff_id: number | null
  expense_date: string
  amount: number
  category: string
  vendor: string
  description: string
  reference_number: string
}

export interface StaffSalary {
  salary_id: number
  staff_id: number
  annual_salary: number
  effective_date: string
  end_date: string | null
}

export interface ProgramSalaryCharge {
  charge_id: number
  program_id: number
  staff_id: number
  charge_month: string
  amount_charged: number
  applied_percentage: number | null
}
