-- Staff: person-level attributes
CREATE TABLE staff (
    staff_id        SERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    job_title       VARCHAR(150),
    department      VARCHAR(150),
    hire_date       DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Programs: program-level attributes
CREATE TABLE programs (
    program_id      SERIAL PRIMARY KEY,
    program_name    VARCHAR(255) NOT NULL,
    worktag         VARCHAR(100) NOT NULL,
    status          VARCHAR(50) DEFAULT 'active',   -- active, closed, pending
    pop_start       DATE,                            -- period of performance start
    pop_end         DATE,                            -- period of performance end
    total_budget    NUMERIC(15, 2),
    sponsor         VARCHAR(255),
    grant_number    VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Staff <-> Programs junction (many-to-many)
CREATE TABLE program_assignments (
    assignment_id   SERIAL PRIMARY KEY,
    staff_id        INT NOT NULL REFERENCES staff(staff_id),
    program_id      INT NOT NULL REFERENCES programs(program_id),
    role            VARCHAR(150),
    start_date      DATE,
    end_date        DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (staff_id, program_id)
);

-- Monthly allocation percentages per assignment (one-to-many from assignments)
CREATE TABLE program_assignment_allocations (
    id              SERIAL PRIMARY KEY,
    assignment_id   INT NOT NULL REFERENCES program_assignments(assignment_id),
    month           DATE NOT NULL,                   -- store as first day of month (e.g. 2025-01-01)
    percentage      NUMERIC(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    notes           TEXT,
    UNIQUE (assignment_id, month)
);

-- Program expenses: purchases/charges against a program
CREATE TABLE program_expenses (
    expense_id      SERIAL PRIMARY KEY,
    program_id      INT NOT NULL REFERENCES programs(program_id),
    staff_id        INT REFERENCES staff(staff_id),  -- who made the purchase (optional)
    expense_date    DATE NOT NULL,
    amount          NUMERIC(15, 2) NOT NULL,
    category        VARCHAR(100),
    vendor          VARCHAR(255),
    description     TEXT,
    reference_number VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Staff salaries: current snapshot or history
CREATE TABLE staff_salaries (
    salary_id       SERIAL PRIMARY KEY,
    staff_id        INT NOT NULL REFERENCES staff(staff_id),
    annual_salary   NUMERIC(15, 2) NOT NULL,
    effective_date  DATE NOT NULL,
    end_date        DATE,                            -- NULL = current record
    notes           TEXT,
    UNIQUE (staff_id, effective_date)
);

-- Actual salary charges billed to programs (separate from planned allocation)
CREATE TABLE program_salary_charges (
    charge_id       SERIAL PRIMARY KEY,
    program_id      INT NOT NULL REFERENCES programs(program_id),
    staff_id        INT NOT NULL REFERENCES staff(staff_id),
    charge_month    DATE NOT NULL,                   -- first day of month
    amount_charged  NUMERIC(15, 2) NOT NULL,
    applied_percentage NUMERIC(5, 2),               -- optional: % used to derive charge
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
