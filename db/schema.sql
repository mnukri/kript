-- =============================================================================
-- SCHEMA v2
-- =============================================================================
--
-- OPEN QUESTIONS (resolve with finance/contracts team):
--
--   OQ-1: Daily salary basis
--         Should annual salary be divided by 260 (working days) or 365
--         (calendar days) when computing a daily effort charge?
--         Impacts: program_salary_charges charge calculations.
--
--   OQ-2: Indirect rate stacking
--         Should burdened cost = salary * (1 + fringe) * (1 + indirect),
--         or does indirect apply differently (e.g. on top of total cost,
--         or not stacked at all for now)?
--         Impacts: indirect_rates table usage, total_budget_burdened definition.
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE labor_category AS ENUM ('FTE', 'COOP', 'TEMP');
CREATE TYPE program_status AS ENUM ('active', 'closed', 'pending');


-- ---------------------------------------------------------------------------
-- Staff: person-level attributes
-- ---------------------------------------------------------------------------

CREATE TABLE staff (
    staff_id            SERIAL PRIMARY KEY,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) UNIQUE,
    job_title           VARCHAR(150),
    department          VARCHAR(150),
    labor_category      labor_category NOT NULL,        -- drives fringe & indirect rates
    hire_date           DATE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- Fringe rates: by labor category with effective date history
--   FTE  -> 25.8%  (current)
--   COOP -> 25.8%  (current)
--   TEMP ->  7.65% (current)
-- ---------------------------------------------------------------------------

CREATE TABLE fringe_rates (
    fringe_rate_id      SERIAL PRIMARY KEY,
    labor_category      labor_category NOT NULL,
    rate                NUMERIC(6, 4) NOT NULL,         -- e.g. 0.258 = 25.8%
    effective_date      DATE NOT NULL,
    end_date            DATE,                           -- NULL = currently in effect
    notes               TEXT,
    UNIQUE (labor_category, effective_date)
);


-- ---------------------------------------------------------------------------
-- Indirect rates: overhead rate with effective date history
--   Current: 60%
--   See OQ-2 for stacking convention.
-- ---------------------------------------------------------------------------

CREATE TABLE indirect_rates (
    indirect_rate_id    SERIAL PRIMARY KEY,
    rate_type           VARCHAR(100) NOT NULL,          -- e.g. 'overhead', 'G&A'
    rate                NUMERIC(6, 4) NOT NULL,         -- e.g. 0.60 = 60%
    effective_date      DATE NOT NULL,
    end_date            DATE,                           -- NULL = currently in effect
    notes               TEXT,
    UNIQUE (rate_type, effective_date)
);


-- ---------------------------------------------------------------------------
-- Programs: program-level attributes
-- ---------------------------------------------------------------------------

CREATE TABLE programs (
    program_id                              SERIAL PRIMARY KEY,
    program_name                            VARCHAR(255) NOT NULL,
    worktag                                 VARCHAR(100) NOT NULL,
    status                                  program_status NOT NULL DEFAULT 'active',
    pop_start                               DATE,                            -- period of performance start
    pop_end                                 DATE,                            -- period of performance end

    -- Budget columns
    total_budget_burdened                   NUMERIC(15, 2),
    total_budget_salary_burdened            NUMERIC(15, 2),
    total_budget_salary_unburdened          NUMERIC(15, 2),
    total_budget_purchases_unburdened       NUMERIC(15, 2),
    total_budget_capital_equipment_unburdened NUMERIC(15, 2),

    sponsor                                 VARCHAR(255),
    grant_number                            VARCHAR(100),
    tpoc_staff_id                           INT REFERENCES staff(staff_id), -- Technical Point of Contact
    created_at                              TIMESTAMP DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- Staff salaries: effective date history
--   Always resolve to the record where effective_date <= charge_date
--   and (end_date IS NULL OR end_date >= charge_date).
-- ---------------------------------------------------------------------------

CREATE TABLE staff_salaries (
    salary_id           SERIAL PRIMARY KEY,
    staff_id            INT NOT NULL REFERENCES staff(staff_id),
    annual_salary       NUMERIC(15, 2) NOT NULL,
    effective_date      DATE NOT NULL,
    end_date            DATE,                           -- NULL = currently in effect
    notes               TEXT,
    UNIQUE (staff_id, effective_date)
);


-- ---------------------------------------------------------------------------
-- Effort entries: daily effort allocations per staff per program
--   Replaces: program_assignments + program_assignment_allocations
--   Derived view of "who works on what program" comes from this table.
-- ---------------------------------------------------------------------------

CREATE TABLE effort_entries (
    effort_id           SERIAL PRIMARY KEY,
    staff_id            INT NOT NULL REFERENCES staff(staff_id),
    program_id          INT NOT NULL REFERENCES programs(program_id),
    effort_date         DATE NOT NULL,
    percentage          NUMERIC(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (staff_id, program_id, effort_date)          -- one entry per person per program per day
);


-- ---------------------------------------------------------------------------
-- Charges: unified log of effort, purchase, and travel charges against a program
--
--   charge_type = 'effort'   -> staff charges salary time to a program
--                               links to effort_entries via (staff_id, program_id, charge_date)
--   charge_type = 'purchase' -> staff charges a purchase to a program
--                               vendor, amount, reference_number relevant
--   charge_type = 'travel'   -> staff charges travel to a program
--                               travel-specific fields populated (nullable for other types)
-- ---------------------------------------------------------------------------

CREATE TYPE charge_type AS ENUM ('effort', 'purchase', 'travel');
CREATE TYPE charge_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- Charges: core table — common fields across all charge types
-- ---------------------------------------------------------------------------

CREATE TABLE charges (
    charge_id           SERIAL PRIMARY KEY,
    program_id          INT NOT NULL REFERENCES programs(program_id),
    staff_id            INT NOT NULL REFERENCES staff(staff_id),
    charge_type         charge_type NOT NULL,
    charge_date         DATE NOT NULL,
    amount              NUMERIC(15, 2) CHECK (amount > 0),  -- NULL for effort (derived)
    description         TEXT,
    reference_number    INT NOT NULL DEFAULT 1,             -- sequential per (program, staff, charge_date, charge_type)
    status              charge_status NOT NULL DEFAULT 'draft',
    approved_by         INT REFERENCES staff(staff_id),
    approved_at         TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),

    UNIQUE (program_id, staff_id, charge_date, charge_type, reference_number),

    -- Effort amount is always derived, never manually entered
    CONSTRAINT effort_amount_must_be_null CHECK (
        charge_type != 'effort' OR amount IS NULL
    ),

    -- Purchase and travel charges must have an amount
    CONSTRAINT non_effort_amount_required CHECK (
        charge_type = 'effort' OR amount IS NOT NULL
    ),

    -- approved_by and approved_at must be set together or not at all
    CONSTRAINT approval_fields_consistent CHECK (
        (approved_by IS NULL) = (approved_at IS NULL)
    )
);


-- ---------------------------------------------------------------------------
-- Charge travel details: travel-specific fields (1-to-1 with charges)
--   Only exists for rows where charges.charge_type = 'travel'
-- ---------------------------------------------------------------------------

CREATE TABLE charge_travel_details (
    charge_id           INT PRIMARY KEY REFERENCES charges(charge_id) ON DELETE CASCADE,
    destination         VARCHAR(255),
    trip_purpose        TEXT,
    departure_date      DATE NOT NULL,
    return_date         DATE NOT NULL,

    -- Travel date range must be valid
    CONSTRAINT travel_dates_valid CHECK (return_date >= departure_date)
);


-- ---------------------------------------------------------------------------
-- Charge purchase details: purchase-specific fields (1-to-1 with charges)
--   Only exists for rows where charges.charge_type = 'purchase'
-- ---------------------------------------------------------------------------

CREATE TABLE charge_purchase_details (
    charge_id           INT PRIMARY KEY REFERENCES charges(charge_id) ON DELETE CASCADE,
    vendor              VARCHAR(255),
    category            VARCHAR(100)
);