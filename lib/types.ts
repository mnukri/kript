export type LaborCategory = 'FTE' | 'COOP' | 'TEMP'
export type ProgramStatus = 'active' | 'closed' | 'pending'
export type ChargeType    = 'effort' | 'purchase' | 'travel'
export type ChargeStatus  = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Staff {
  staff_id:       number
  first_name:     string
  last_name:      string
  email:          string | null
  job_title:      string | null
  department:     string | null
  labor_category: LaborCategory
  hire_date:      string | null
  is_active:      boolean
}

export interface Program {
  program_id:                                number
  program_name:                              string
  worktag:                                   string
  status:                                    ProgramStatus
  pop_start:                                 string | null
  pop_end:                                   string | null
  total_budget_burdened:                     number | null
  total_budget_salary_burdened:              number | null
  total_budget_salary_unburdened:            number | null
  total_budget_purchases_unburdened:         number | null
  total_budget_capital_equipment_unburdened: number | null
  sponsor:                                   string | null
  grant_number:                              string | null
  tpoc_staff_id:                             number | null
}

export interface StaffSalary {
  salary_id:      number
  staff_id:       number
  annual_salary:  number
  effective_date: string
  end_date:       string | null
}

export interface EffortEntry {
  effort_id:   number
  staff_id:    number
  program_id:  number
  effort_date: string
  percentage:  number
  notes:       string | null
}

export interface Charge {
  charge_id:        number
  program_id:       number
  staff_id:         number
  charge_type:      ChargeType
  charge_date:      string
  amount:           number | null
  description:      string | null
  reference_number: number
  status:           ChargeStatus
  approved_by:      number | null
  notes:            string | null
}

export interface ChargePurchaseDetails {
  charge_id: number
  vendor:    string | null
  category:  string | null
}

export interface ChargeTravelDetails {
  charge_id:      number
  destination:    string | null
  trip_purpose:   string | null
  departure_date: string
  return_date:    string
}
