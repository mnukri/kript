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

CREATE TYPE labor_category       AS ENUM ('FTE', 'COOP', 'TEMP');
CREATE TYPE program_status       AS ENUM ('active', 'closed', 'pending');
CREATE TYPE global_role          AS ENUM ('admin', 'manager', 'viewer', 'staff');
CREATE TYPE program_access_level AS ENUM ('read', 'write', 'approve');
CREATE TYPE charge_type          AS ENUM ('effort', 'purchase', 'travel');
CREATE TYPE charge_status        AS ENUM ('draft', 'submitted', 'approved', 'rejected');


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
    manager_id          INT REFERENCES staff(staff_id), -- direct reporting manager (org chart)
    hire_date           DATE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- Users: login credentials, 1-to-1 with staff (Microsoft SSO)
--   global_role controls system-wide access:
--     admin   — full access to everything
--     manager — can approve charges, edit programs they're assigned to
--     viewer  — read-only across all programs
--     staff   — read/write their own charges and effort entries only
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    user_id             SERIAL PRIMARY KEY,
    staff_id            INT NOT NULL UNIQUE REFERENCES staff(staff_id),
    email               VARCHAR(255) NOT NULL UNIQUE,           -- mirrors staff.email, used for display
    microsoft_oid       VARCHAR(255) NOT NULL UNIQUE,           -- Azure AD Object ID — stable MS identifier
    global_role         global_role NOT NULL DEFAULT 'staff',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at       TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- User sessions: server-side session store for Microsoft auth tokens
--   On login: Microsoft returns access + refresh tokens, stored here.
--   On request: session_token (cookie) looked up to retrieve MS tokens.
--   On logout or expiry: row is deleted or marked expired.
-- ---------------------------------------------------------------------------

CREATE TABLE user_sessions (
    session_id               SERIAL PRIMARY KEY,
    user_id                  INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token            VARCHAR(512) NOT NULL UNIQUE,
    access_token             TEXT NOT NULL,
    refresh_token            TEXT,
    access_token_expires_at  TIMESTAMP NOT NULL,
    refresh_token_expires_at TIMESTAMP,
    ip_address               VARCHAR(64),
    user_agent               TEXT,
    created_at               TIMESTAMP DEFAULT NOW(),
    last_used_at             TIMESTAMP DEFAULT NOW()
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
    program_id                                SERIAL PRIMARY KEY,
    program_name                              VARCHAR(255) NOT NULL,
    worktag                                   VARCHAR(100) NOT NULL,
    status                                    program_status NOT NULL DEFAULT 'active',
    pop_start                                 DATE,
    pop_end                                   DATE,
    total_budget_burdened                     NUMERIC(15, 2),
    total_budget_salary_burdened              NUMERIC(15, 2),
    total_budget_salary_unburdened            NUMERIC(15, 2),
    total_budget_purchases_unburdened         NUMERIC(15, 2),
    total_budget_capital_equipment_unburdened NUMERIC(15, 2),
    sponsor                                   VARCHAR(255),
    grant_number                              VARCHAR(100),
    tpoc_staff_id                             INT REFERENCES staff(staff_id),
    created_at                                TIMESTAMP DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- Program permissions: per-user per-program access overrides
--   Grants a specific access level on a program regardless of global_role.
--   Access levels:
--     read    — view program, charges, effort entries
--     write   — submit and edit charges and effort entries
--     approve — write + can approve/reject charges
--
--   Permission granting rules (enforced at application layer):
--
--     admin   — can grant any access level on any program
--
--     manager — can grant 'read' or 'write' (NOT 'approve') on programs
--               where they themselves hold 'approve' access
--
--     tpoc    — the staff member referenced in programs.tpoc_staff_id can
--               grant 'read' or 'write' (NOT 'approve') on their own program
--
--     Only admins can grant 'approve' level access to anyone.
--     granted_by records which user performed the grant for audit purposes.
-- ---------------------------------------------------------------------------

CREATE TABLE program_permissions (
    permission_id       SERIAL PRIMARY KEY,
    user_id             INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    program_id          INT NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
    access_level        program_access_level NOT NULL,
    granted_by          INT REFERENCES users(user_id),
    granted_at          TIMESTAMP DEFAULT NOW(),
    notes               TEXT,
    UNIQUE (user_id, program_id)
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
    end_date            DATE,
    notes               TEXT,
    UNIQUE (staff_id, effective_date)
);


-- ---------------------------------------------------------------------------
-- Effort entries: daily effort allocations per staff per program
-- ---------------------------------------------------------------------------

CREATE TABLE effort_entries (
    effort_id           SERIAL PRIMARY KEY,
    staff_id            INT NOT NULL REFERENCES staff(staff_id),
    program_id          INT NOT NULL REFERENCES programs(program_id),
    effort_date         DATE NOT NULL,
    percentage          NUMERIC(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (staff_id, program_id, effort_date)
);


-- ---------------------------------------------------------------------------
-- Charges: core table — common fields across all charge types
--   effort   -> amount NULL, derived from effort_entries + salaries + fringe
--   purchase -> amount required, detail in charge_purchase_details
--   travel   -> amount required, detail in charge_travel_details
-- ---------------------------------------------------------------------------

CREATE TABLE charges (
    charge_id           SERIAL PRIMARY KEY,
    program_id          INT NOT NULL REFERENCES programs(program_id),
    staff_id            INT NOT NULL REFERENCES staff(staff_id),
    charge_type         charge_type NOT NULL,
    charge_date         DATE NOT NULL,
    amount              NUMERIC(15, 2) CHECK (amount > 0),
    description         TEXT,
    reference_number    INT NOT NULL DEFAULT 1,
    status              charge_status NOT NULL DEFAULT 'draft',
    approved_by         INT REFERENCES staff(staff_id),
    approved_at         TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),

    UNIQUE (program_id, staff_id, charge_date, charge_type, reference_number),

    CONSTRAINT effort_amount_must_be_null CHECK (
        charge_type != 'effort' OR amount IS NULL
    ),
    CONSTRAINT non_effort_amount_required CHECK (
        charge_type = 'effort' OR amount IS NOT NULL
    ),
    CONSTRAINT approval_fields_consistent CHECK (
        (approved_by IS NULL) = (approved_at IS NULL)
    )
);


-- ---------------------------------------------------------------------------
-- Charge travel details: 1-to-1 with charges where charge_type = 'travel'
-- ---------------------------------------------------------------------------

CREATE TABLE charge_travel_details (
    charge_id           INT PRIMARY KEY REFERENCES charges(charge_id) ON DELETE CASCADE,
    destination         VARCHAR(255),
    trip_purpose        TEXT,
    departure_date      DATE NOT NULL,
    return_date         DATE NOT NULL,
    CONSTRAINT travel_dates_valid CHECK (return_date >= departure_date)
);


-- ---------------------------------------------------------------------------
-- Charge purchase details: 1-to-1 with charges where charge_type = 'purchase'
-- ---------------------------------------------------------------------------

CREATE TABLE charge_purchase_details (
    charge_id           INT PRIMARY KEY REFERENCES charges(charge_id) ON DELETE CASCADE,
    vendor              VARCHAR(255),
    category            VARCHAR(100)
);