-- ============================================================
-- SEED DATA v2 — Kript (ML/CV Startup, Boston MA)
-- ============================================================


-- ---------------------------------------------------------------------------
-- Staff inserted in two passes: first without manager_id to get serial IDs,
-- then manager_id updated after all rows exist (self-referencing FK).
-- ---------------------------------------------------------------------------

INSERT INTO staff (first_name, last_name, email, job_title, department, labor_category, hire_date, is_active) VALUES
    ('Priya',   'Nair',      'priya.nair@kript.ai',      'Chief Executive Officer',         'Leadership',  'FTE',  '2019-03-01', TRUE),  -- 1
    ('Marcus',  'Chen',      'marcus.chen@kript.ai',     'Chief Technology Officer',        'Leadership',  'FTE',  '2019-03-01', TRUE),  -- 2
    ('Sofia',   'Andrade',   'sofia.andrade@kript.ai',   'VP of Research',                  'Research',    'FTE',  '2019-08-15', TRUE),  -- 3
    ('James',   'Okafor',    'james.okafor@kript.ai',    'VP of Engineering',               'Engineering', 'FTE',  '2020-01-10', TRUE),  -- 4
    ('Lena',    'Hoffmann',  'lena.hoffmann@kript.ai',   'Principal Research Scientist',    'Research',    'FTE',  '2020-03-22', TRUE),  -- 5
    ('Derek',   'Walsh',     'derek.walsh@kript.ai',     'Senior ML Engineer',              'Engineering', 'FTE',  '2020-06-01', TRUE),  -- 6
    ('Aiko',    'Tanaka',    'aiko.tanaka@kript.ai',     'Senior CV Engineer',              'Engineering', 'FTE',  '2020-09-14', TRUE),  -- 7
    ('Ravi',    'Patel',     'ravi.patel@kript.ai',      'MLOps Engineer',                  'Engineering', 'FTE',  '2021-02-08', TRUE),  -- 8
    ('Claire',  'Fontaine',  'claire.fontaine@kript.ai', 'Research Scientist',              'Research',    'FTE',  '2021-04-19', TRUE),  -- 9
    ('Tyler',   'Brooks',    'tyler.brooks@kript.ai',    'CV Engineer',                     'Engineering', 'FTE',  '2021-07-06', TRUE),  -- 10
    ('Nadia',   'Kowalski',  'nadia.kowalski@kript.ai',  'ML Engineer',                     'Engineering', 'COOP', '2021-10-25', TRUE),  -- 11
    ('Samuel',  'Grant',     'samuel.grant@kript.ai',    'Software Engineer',               'Engineering', 'FTE',  '2022-01-18', TRUE),  -- 12
    ('Yuna',    'Park',      'yuna.park@kript.ai',       'Product Manager',                 'Product',     'FTE',  '2022-03-07', TRUE),  -- 13
    ('Omar',    'Khalil',    'omar.khalil@kript.ai',     'Research Scientist',              'Research',    'FTE',  '2022-06-13', TRUE),  -- 14
    ('Brianna', 'Torres',    'brianna.torres@kript.ai',  'Finance & Operations Manager',    'Operations',  'FTE',  '2022-09-01', TRUE);  -- 15

UPDATE staff SET manager_id = 1 WHERE staff_id IN (2, 3, 4, 15);
UPDATE staff SET manager_id = 3 WHERE staff_id IN (5, 9, 14);
UPDATE staff SET manager_id = 4 WHERE staff_id IN (6, 7, 8, 10, 11, 12, 13);


-- ---------------------------------------------------------------------------
-- Fringe rates
-- ---------------------------------------------------------------------------

INSERT INTO fringe_rates (labor_category, rate, effective_date, end_date, notes) VALUES
    ('FTE',  0.2580, '2024-01-01', NULL, 'FTE fringe rate — includes health, retirement, payroll tax'),
    ('COOP', 0.2580, '2024-01-01', NULL, 'COOP fringe rate — same as FTE'),
    ('TEMP', 0.0765, '2024-01-01', NULL, 'TEMP fringe rate — payroll tax only');


-- ---------------------------------------------------------------------------
-- Indirect rates
-- ---------------------------------------------------------------------------

INSERT INTO indirect_rates (rate_type, rate, effective_date, end_date, notes) VALUES
    ('overhead', 0.6000, '2024-01-01', NULL, 'Negotiated overhead rate — see OQ-2 for stacking convention');


-- ---------------------------------------------------------------------------
-- Programs
-- ---------------------------------------------------------------------------

INSERT INTO programs (
    program_name, worktag, status, pop_start, pop_end,
    total_budget_burdened,
    total_budget_salary_burdened, total_budget_salary_unburdened,
    total_budget_purchases_unburdened, total_budget_capital_equipment_unburdened,
    sponsor, grant_number, tpoc_staff_id
) VALUES
    ('DoD SBIR: Autonomous Perception for Unmanned Systems', 'PG-2201', 'active',  '2022-09-01', '2025-08-31',
     1750000.00, 950000.00, 754629.00, 145371.00, 100000.00, 'DoD / DARPA',  'DARPA-SBIR-22-09-APS', 2),  -- 1

    ('NIH STTR: AI-Assisted Pathology Image Analysis',       'PG-2301', 'active',  '2023-04-01', '2026-03-31',
     1250000.00, 700000.00, 555556.00, 100000.00,  50000.00, 'NIH / NCI',    'NCI-STTR-23-04-APA',   3),  -- 2

    ('NSF CAREER: Robust Vision Under Distribution Shift',   'PG-2302', 'active',  '2023-07-01', '2028-06-30',
      625000.00, 375000.00, 297619.00,  75000.00,  50000.00, 'NSF',          'NSF-CAREER-23-07-RV',  3),  -- 3

    ('Commercial: Real-Time CV Platform — MedDevice Co.',    'PG-2401', 'active',  '2024-01-01', '2025-12-31',
      480000.00, 280000.00, 222222.00, 150000.00,  30000.00, 'MedDevice Co.','CONTRACT-2401-MDC',    4),  -- 4

    ('Internal R&D: Foundation Model for Biomedical Imaging','PG-2402', 'active',  '2024-06-01', '2026-05-31',
      300000.00, 175000.00, 138889.00,  75000.00,  50000.00, 'Internal',     'INTERNAL-2402-FMB',    2),  -- 5

    ('DoD SBIR Phase I: Edge Inference for ISR Platforms',   'PG-2403', 'closed',  '2023-01-01', '2023-12-31',
      275000.00, 175000.00, 138889.00,  75000.00,  25000.00, 'DoD / AFRL',   'AFRL-SBIR-23-01-EII',  2),  -- 6

    ('MassAI Innovation Grant: CV for Urban Mobility',       'PG-2404', 'pending', '2025-09-01', '2027-08-31',
      400000.00, 250000.00, 198413.00, 100000.00,  50000.00, 'MassTech',     'MASSAI-2025-UMC',      4);  -- 7


-- ---------------------------------------------------------------------------
-- Users (depends on staff)
-- ---------------------------------------------------------------------------

INSERT INTO users (staff_id, email, microsoft_oid, global_role) VALUES
    (1,  'priya.nair@kript.ai',      'ms-oid-0001', 'admin'),
    (2,  'marcus.chen@kript.ai',     'ms-oid-0002', 'manager'),
    (3,  'sofia.andrade@kript.ai',   'ms-oid-0003', 'manager'),
    (4,  'james.okafor@kript.ai',    'ms-oid-0004', 'manager'),
    (5,  'lena.hoffmann@kript.ai',   'ms-oid-0005', 'staff'),
    (6,  'derek.walsh@kript.ai',     'ms-oid-0006', 'staff'),
    (7,  'aiko.tanaka@kript.ai',     'ms-oid-0007', 'staff'),
    (8,  'ravi.patel@kript.ai',      'ms-oid-0008', 'staff'),
    (9,  'claire.fontaine@kript.ai', 'ms-oid-0009', 'staff'),
    (10, 'tyler.brooks@kript.ai',    'ms-oid-0010', 'staff'),
    (11, 'nadia.kowalski@kript.ai',  'ms-oid-0011', 'staff'),
    (12, 'samuel.grant@kript.ai',    'ms-oid-0012', 'staff'),
    (13, 'yuna.park@kript.ai',       'ms-oid-0013', 'staff'),
    (14, 'omar.khalil@kript.ai',     'ms-oid-0014', 'staff'),
    (15, 'brianna.torres@kript.ai',  'ms-oid-0015', 'admin');


-- ---------------------------------------------------------------------------
-- Program permissions (depends on users + programs)
-- ---------------------------------------------------------------------------

INSERT INTO program_permissions (user_id, program_id, access_level, granted_by) VALUES
    -- Marcus: approve on DoD SBIR (1) and Internal R&D (5)
    (2, 1, 'approve', 1),
    (2, 5, 'approve', 1),
    -- Sofia: approve on NIH (2) and NSF (3), read on Internal R&D (5)
    (3, 2, 'approve', 1),
    (3, 3, 'approve', 1),
    (3, 5, 'read',    1),
    -- James: approve on Commercial (4)
    (4, 4, 'approve', 1),
    -- Lena: write on DoD SBIR (1) and NSF (3)
    (5, 1, 'write', 2),
    (5, 3, 'write', 3),
    -- Derek: write on DoD SBIR (1) and Internal R&D (5)
    (6, 1, 'write', 2),
    (6, 5, 'write', 2),
    -- Aiko: write on DoD SBIR (1) and Commercial (4)
    (7, 1, 'write', 2),
    (7, 4, 'write', 4),
    -- Ravi: write on DoD SBIR (1)
    (8, 1, 'write', 2),
    -- Claire: write on NIH (2), NSF (3), Internal R&D (5)
    (9, 2, 'write', 3),
    (9, 3, 'write', 3),
    (9, 5, 'write', 2),
    -- Tyler: write on NIH (2)
    (10, 2, 'write', 3),
    -- Nadia: write on Commercial (4)
    (11, 4, 'write', 4),
    -- Samuel: write on Commercial (4)
    (12, 4, 'write', 4),
    -- Yuna: write on Commercial (4)
    (13, 4, 'write', 4),
    -- Omar: write on NIH (2) and NSF (3)
    (14, 2, 'write', 3),
    (14, 3, 'write', 3);


-- ---------------------------------------------------------------------------
-- Staff salaries
-- ---------------------------------------------------------------------------

INSERT INTO staff_salaries (staff_id, annual_salary, effective_date, end_date) VALUES
    (1,  195000.00, '2024-01-01', NULL),
    (2,  210000.00, '2024-01-01', NULL),
    (3,  195000.00, '2024-01-01', NULL),
    (4,  195000.00, '2024-01-01', NULL),
    (5,  185000.00, '2024-01-01', NULL),
    (6,  175000.00, '2024-01-01', NULL),
    (7,  178000.00, '2024-01-01', NULL),
    (8,  155000.00, '2024-01-01', NULL),
    (9,  165000.00, '2024-01-01', NULL),
    (10, 162000.00, '2024-01-01', NULL),
    (11, 158000.00, '2024-01-01', NULL),
    (12, 148000.00, '2024-01-01', NULL),
    (13, 155000.00, '2024-01-01', NULL),
    (14, 165000.00, '2024-01-01', NULL),
    (15, 120000.00, '2024-01-01', NULL);


-- ---------------------------------------------------------------------------
-- Effort entries (sample workdays Jan–Mar 2025)
-- ---------------------------------------------------------------------------

INSERT INTO effort_entries (staff_id, program_id, effort_date, percentage) VALUES
    (2, 1, '2025-01-06', 60.00), (2, 5, '2025-01-06', 20.00),
    (2, 1, '2025-01-07', 60.00), (2, 5, '2025-01-07', 20.00),
    (2, 1, '2025-02-03', 60.00), (2, 5, '2025-02-03', 20.00),
    (2, 1, '2025-02-04', 60.00), (2, 5, '2025-02-04', 20.00),
    (2, 1, '2025-03-03', 60.00), (2, 5, '2025-03-03', 20.00),
    (2, 1, '2025-03-04', 60.00), (2, 5, '2025-03-04', 20.00),

    (3, 2, '2025-01-06', 40.00), (3, 3, '2025-01-06', 30.00), (3, 5, '2025-01-06', 30.00),
    (3, 2, '2025-02-03', 40.00), (3, 3, '2025-02-03', 30.00), (3, 5, '2025-02-03', 30.00),
    (3, 2, '2025-03-03', 40.00), (3, 3, '2025-03-03', 30.00), (3, 5, '2025-03-03', 30.00),

    (5, 1, '2025-01-06', 50.00), (5, 3, '2025-01-06', 50.00),
    (5, 1, '2025-02-03', 50.00), (5, 3, '2025-02-03', 50.00),
    (5, 1, '2025-03-03', 50.00), (5, 3, '2025-03-03', 50.00),

    (6, 1, '2025-01-06', 70.00), (6, 5, '2025-01-06', 30.00),
    (6, 1, '2025-02-03', 70.00), (6, 5, '2025-02-03', 30.00),
    (6, 1, '2025-03-03', 70.00), (6, 5, '2025-03-03', 30.00),

    (7, 1, '2025-01-06', 60.00), (7, 4, '2025-01-06', 40.00),
    (7, 1, '2025-02-03', 60.00), (7, 4, '2025-02-03', 40.00),
    (7, 1, '2025-03-03', 60.00), (7, 4, '2025-03-03', 40.00),

    (9, 2, '2025-01-06', 50.00), (9, 3, '2025-01-06', 25.00), (9, 5, '2025-01-06', 25.00),
    (9, 2, '2025-02-03', 50.00), (9, 3, '2025-02-03', 25.00), (9, 5, '2025-02-03', 25.00),
    (9, 2, '2025-03-03', 50.00), (9, 3, '2025-03-03', 25.00), (9, 5, '2025-03-03', 25.00),

    (10, 2, '2025-01-06', 100.00),
    (10, 2, '2025-02-03', 100.00),
    (10, 2, '2025-03-03', 100.00),

    (11, 4, '2025-01-06', 100.00),
    (11, 4, '2025-02-03', 100.00),
    (11, 4, '2025-03-03', 100.00),

    (14, 2, '2025-01-06', 50.00), (14, 3, '2025-01-06', 50.00),
    (14, 2, '2025-02-03', 50.00), (14, 3, '2025-02-03', 50.00),
    (14, 2, '2025-03-03', 50.00), (14, 3, '2025-03-03', 50.00),

    (15, 1, '2025-01-06', 40.00), (15, 2, '2025-01-06', 30.00), (15, 4, '2025-01-06', 30.00),
    (15, 1, '2025-02-03', 40.00), (15, 2, '2025-02-03', 30.00), (15, 4, '2025-02-03', 30.00),
    (15, 1, '2025-03-03', 40.00), (15, 2, '2025-03-03', 30.00), (15, 4, '2025-03-03', 30.00);


-- ---------------------------------------------------------------------------
-- Charges: core rows (purchase + travel; effort rows have amount=NULL)
-- ---------------------------------------------------------------------------

INSERT INTO charges (program_id, staff_id, charge_type, charge_date, amount, description, reference_number, status) VALUES
    (1, 6,  'purchase', '2025-01-08', 12400.00, 'RTX 6000 Ada GPU (x2) for edge inference testing',  1, 'approved'),
    (1, 7,  'purchase', '2025-01-15',  3800.00, 'W&B Teams annual license',                          1, 'approved'),
    (1, 8,  'purchase', '2025-02-04',  6200.00, 'Sensor integration consulting (40 hrs)',             1, 'approved'),
    (1, 6,  'travel',   '2025-02-20',  1950.00, 'DARPA quarterly review — Arlington VA',             1, 'approved'),
    (1, 2,  'travel',   '2025-03-11',  2400.00, 'DoD program review — Pentagon',                     1, 'approved'),
    (2, 10, 'purchase', '2025-01-10',  8900.00, 'Digital pathology slide scanner (partial pmt)',     1, 'approved'),
    (2, 9,  'purchase', '2025-01-22',  4200.00, 'Dataset annotation — 5,000 WSI labels',             1, 'approved'),
    (2, 3,  'purchase', '2025-02-18',  2750.00, 'S3 + EC2 cloud compute — Jan/Feb batch jobs',       1, 'approved'),
    (2, 9,  'purchase', '2025-03-03',  5100.00, 'Dataset annotation — 6,000 additional WSI labels',  2, 'approved'),
    (2, 14, 'travel',   '2025-02-05',  1600.00, 'NIH study section presentation — Bethesda MD',      1, 'approved'),
    (3, 14, 'purchase', '2025-01-14',  3200.00, 'GPU compute — distribution shift experiments',      1, 'approved'),
    (3, 9,  'purchase', '2025-03-06',  1100.00, 'API credits for benchmark comparison study',        1, 'approved'),
    (3, 9,  'travel',   '2025-02-12',  1850.00, 'ICLR 2025 — Singapore (registration + travel)',     1, 'approved'),
    (4, 11, 'purchase', '2025-01-06',  4500.00, 'UI/UX research sprint — clinical workflow',         1, 'approved'),
    (4, 12, 'purchase', '2025-01-28',  2200.00, 'Infrastructure — prod deployment Jan',              1, 'approved'),
    (4, 12, 'purchase', '2025-03-01',  2200.00, 'Infrastructure — prod deployment Feb',              2, 'approved'),
    (4, 7,  'travel',   '2025-02-10',  3600.00, 'On-site integration at MedDevice Co. — Chicago',    1, 'approved'),
    (5, 6,  'purchase', '2025-01-20',  9800.00, 'H100 PCIe GPU for foundation model pretraining',    1, 'approved'),
    (5, 5,  'purchase', '2025-02-14',  5600.00, 'SageMaker + S3 — pretraining data pipeline',        1, 'approved'),
    (5, 6,  'purchase', '2025-03-05',  3100.00, 'Dataset Hub enterprise subscription + storage',     2, 'approved');


-- ---------------------------------------------------------------------------
-- Purchase details
-- ---------------------------------------------------------------------------

INSERT INTO charge_purchase_details (charge_id, vendor, category)
SELECT c.charge_id, v.vendor, v.category
FROM charges c
JOIN (VALUES
    (1,  6,  'purchase', '2025-01-08'::date, 'NVIDIA',               'Equipment'),
    (1,  7,  'purchase', '2025-01-15'::date, 'Weights & Biases',     'Software'),
    (1,  8,  'purchase', '2025-02-04'::date, 'BostonRobotics LLC',   'Contractor'),
    (2,  10, 'purchase', '2025-01-10'::date, 'Leica Biosystems',     'Equipment'),
    (2,  9,  'purchase', '2025-01-22'::date, 'PathologyAI Inc.',     'Contractor'),
    (2,  3,  'purchase', '2025-02-18'::date, 'AWS',                  'Supplies'),
    (2,  9,  'purchase', '2025-03-03'::date, 'PathologyAI Inc.',     'Contractor'),
    (3,  14, 'purchase', '2025-01-14'::date, 'AWS',                  'Supplies'),
    (3,  9,  'purchase', '2025-03-06'::date, 'OpenAI',               'Supplies'),
    (4,  11, 'purchase', '2025-01-06'::date, 'UX Boston',            'Contractor'),
    (4,  12, 'purchase', '2025-01-28'::date, 'Vercel / PlanetScale', 'Software'),
    (4,  12, 'purchase', '2025-03-01'::date, 'Vercel / PlanetScale', 'Software'),
    (5,  6,  'purchase', '2025-01-20'::date, 'NVIDIA',               'Equipment'),
    (5,  5,  'purchase', '2025-02-14'::date, 'AWS',                  'Supplies'),
    (5,  6,  'purchase', '2025-03-05'::date, 'Hugging Face',         'Supplies')
) AS v(program_id, staff_id, charge_type, charge_date, vendor, category)
ON  c.program_id  = v.program_id
AND c.staff_id    = v.staff_id
AND c.charge_type = v.charge_type::charge_type
AND c.charge_date = v.charge_date::date;


-- ---------------------------------------------------------------------------
-- Travel details
-- ---------------------------------------------------------------------------

INSERT INTO charge_travel_details (charge_id, destination, trip_purpose, departure_date, return_date)
SELECT c.charge_id, v.destination, v.trip_purpose, v.departure_date, v.return_date
FROM charges c
JOIN (VALUES
    (1,  6,  'travel', '2025-02-20'::date, 'Arlington, VA',  'DARPA quarterly review',             '2025-02-19'::date, '2025-02-21'::date),
    (1,  2,  'travel', '2025-03-11'::date, 'Washington, DC', 'DoD program review — Pentagon',       '2025-03-10'::date, '2025-03-12'::date),
    (2,  14, 'travel', '2025-02-05'::date, 'Bethesda, MD',   'NIH study section presentation',     '2025-02-04'::date, '2025-02-06'::date),
    (3,  9,  'travel', '2025-02-12'::date, 'Singapore',      'ICLR 2025 — registration + travel',  '2025-02-10'::date, '2025-02-15'::date),
    (4,  7,  'travel', '2025-02-10'::date, 'Chicago, IL',    'On-site integration at MedDevice Co.','2025-02-09'::date, '2025-02-11'::date)
) AS v(program_id, staff_id, charge_type, charge_date, destination, trip_purpose, departure_date, return_date)
ON  c.program_id  = v.program_id
AND c.staff_id    = v.staff_id
AND c.charge_type = v.charge_type::charge_type
AND c.charge_date = v.charge_date::date;