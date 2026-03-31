-- ============================================================
-- SEED DATA — Kript (ML/CV Startup, Boston MA)
-- ============================================================

-- Staff
INSERT INTO staff (first_name, last_name, email, job_title, department, hire_date, is_active) VALUES
    ('Priya',     'Nair',        'priya.nair@kript.ai',        'Chief Executive Officer',          'Leadership',    '2019-03-01', TRUE),
    ('Marcus',    'Chen',        'marcus.chen@kript.ai',       'Chief Technology Officer',         'Leadership',    '2019-03-01', TRUE),
    ('Sofia',     'Andrade',     'sofia.andrade@kript.ai',     'VP of Research',                   'Research',      '2019-08-15', TRUE),
    ('James',     'Okafor',      'james.okafor@kript.ai',      'VP of Engineering',                'Engineering',   '2020-01-10', TRUE),
    ('Lena',      'Hoffmann',    'lena.hoffmann@kript.ai',     'Principal Research Scientist',     'Research',      '2020-03-22', TRUE),
    ('Derek',     'Walsh',       'derek.walsh@kript.ai',       'Senior ML Engineer',               'Engineering',   '2020-06-01', TRUE),
    ('Aiko',      'Tanaka',      'aiko.tanaka@kript.ai',       'Senior Computer Vision Engineer',  'Engineering',   '2020-09-14', TRUE),
    ('Ravi',      'Patel',       'ravi.patel@kript.ai',        'MLOps Engineer',                   'Engineering',   '2021-02-08', TRUE),
    ('Claire',    'Fontaine',    'claire.fontaine@kript.ai',   'Research Scientist',               'Research',      '2021-04-19', TRUE),
    ('Tyler',     'Brooks',      'tyler.brooks@kript.ai',      'Computer Vision Engineer',         'Engineering',   '2021-07-06', TRUE),
    ('Nadia',     'Kowalski',    'nadia.kowalski@kript.ai',    'ML Engineer',                      'Engineering',   '2021-10-25', TRUE),
    ('Samuel',    'Grant',       'samuel.grant@kript.ai',      'Software Engineer',                'Engineering',   '2022-01-18', TRUE),
    ('Yuna',      'Park',        'yuna.park@kript.ai',         'Product Manager',                  'Product',       '2022-03-07', TRUE),
    ('Omar',      'Khalil',      'omar.khalil@kript.ai',       'Research Scientist',               'Research',      '2022-06-13', TRUE),
    ('Brianna',   'Torres',      'brianna.torres@kript.ai',    'Finance & Operations Manager',     'Operations',    '2022-09-01', TRUE);

-- Programs
INSERT INTO programs (program_name, worktag, status, pop_start, pop_end, total_budget, sponsor, grant_number) VALUES
    ('DoD SBIR: Autonomous Perception for Unmanned Systems',  'PG-2201', 'active',  '2022-09-01', '2025-08-31', 1750000.00, 'DoD / DARPA',  'DARPA-SBIR-22-09-APS'),
    ('NIH STTR: AI-Assisted Pathology Image Analysis',        'PG-2301', 'active',  '2023-04-01', '2026-03-31', 1250000.00, 'NIH / NCI',    'NCI-STTR-23-04-APA'),
    ('NSF CAREER: Robust Vision Under Distribution Shift',   'PG-2302', 'active',  '2023-07-01', '2028-06-30', 625000.00,  'NSF',          'NSF-CAREER-23-07-RV'),
    ('Commercial: Real-Time CV Platform — MedDevice Co.',    'PG-2401', 'active',  '2024-01-01', '2025-12-31', 480000.00,  'MedDevice Co.','CONTRACT-2401-MDC'),
    ('Internal R&D: Foundation Model for Biomedical Imaging','PG-2402', 'active',  '2024-06-01', '2026-05-31', 300000.00,  'Internal',     'INTERNAL-2402-FMB'),
    ('DoD SBIR Phase I: Edge Inference for ISR Platforms',   'PG-2403', 'closed',  '2023-01-01', '2023-12-31', 275000.00,  'DoD / AFRL',   'AFRL-SBIR-23-01-EII'),
    ('MassAI Innovation Grant: CV for Urban Mobility',       'PG-2404', 'pending', '2025-09-01', '2027-08-31', 400000.00,  'MassTech',     'MASSAI-2025-UMC');

-- Program Assignments
INSERT INTO program_assignments (staff_id, program_id, role, start_date, end_date, is_active) VALUES
    -- DoD SBIR Autonomous Perception
    (2,  1, 'Principal Investigator',       '2022-09-01', NULL, TRUE),
    (5,  1, 'Co-Investigator',              '2022-09-01', NULL, TRUE),
    (6,  1, 'Senior ML Engineer',           '2022-09-01', NULL, TRUE),
    (7,  1, 'Senior CV Engineer',           '2022-09-01', NULL, TRUE),
    (8,  1, 'MLOps Engineer',               '2023-01-01', NULL, TRUE),
    (15, 1, 'Finance Lead',                 '2022-09-01', NULL, TRUE),

    -- NIH STTR Pathology
    (3,  2, 'Principal Investigator',       '2023-04-01', NULL, TRUE),
    (9,  2, 'Research Scientist',           '2023-04-01', NULL, TRUE),
    (10, 2, 'CV Engineer',                  '2023-04-01', NULL, TRUE),
    (14, 2, 'Research Scientist',           '2023-06-01', NULL, TRUE),
    (15, 2, 'Finance Lead',                 '2023-04-01', NULL, TRUE),

    -- NSF CAREER
    (3,  3, 'Principal Investigator',       '2023-07-01', NULL, TRUE),
    (5,  3, 'Co-Investigator',              '2023-07-01', NULL, TRUE),
    (9,  3, 'Research Scientist',           '2023-07-01', NULL, TRUE),
    (14, 3, 'Research Scientist',           '2023-07-01', NULL, TRUE),

    -- Commercial MedDevice
    (4,  4, 'Program Manager / Tech Lead',  '2024-01-01', NULL, TRUE),
    (7,  4, 'Senior CV Engineer',           '2024-01-01', NULL, TRUE),
    (11, 4, 'ML Engineer',                  '2024-01-01', NULL, TRUE),
    (12, 4, 'Software Engineer',            '2024-01-01', NULL, TRUE),
    (13, 4, 'Product Manager',              '2024-01-01', NULL, TRUE),

    -- Internal R&D Foundation Model
    (2,  5, 'Technical Sponsor',            '2024-06-01', NULL, TRUE),
    (5,  5, 'Research Lead',                '2024-06-01', NULL, TRUE),
    (6,  5, 'ML Engineer',                  '2024-06-01', NULL, TRUE),
    (9,  5, 'Research Scientist',           '2024-06-01', NULL, TRUE),

    -- DoD SBIR Phase I (closed)
    (2,  6, 'Principal Investigator',       '2023-01-01', '2023-12-31', FALSE),
    (6,  6, 'ML Engineer',                  '2023-01-01', '2023-12-31', FALSE),
    (7,  6, 'CV Engineer',                  '2023-01-01', '2023-12-31', FALSE);

-- Program Assignment Allocations (monthly %)
INSERT INTO program_assignment_allocations (assignment_id, month, percentage) VALUES
    -- Marcus (id=1): 60% DoD SBIR, 20% Internal R&D
    (1,  '2025-01-01', 60.00), (1,  '2025-02-01', 60.00), (1,  '2025-03-01', 60.00),
    (21, '2025-01-01', 20.00), (21, '2025-02-01', 20.00), (21, '2025-03-01', 20.00),

    -- Sofia (id=7): 40% NIH, 30% NSF, 30% Internal
    (7,  '2025-01-01', 40.00), (7,  '2025-02-01', 40.00), (7,  '2025-03-01', 40.00),
    (12, '2025-01-01', 30.00), (12, '2025-02-01', 30.00), (12, '2025-03-01', 30.00),
    (22, '2025-01-01', 30.00), (22, '2025-02-01', 30.00), (22, '2025-03-01', 30.00),

    -- Lena (id=2): 50% DoD, 50% NSF
    (2,  '2025-01-01', 50.00), (2,  '2025-02-01', 50.00), (2,  '2025-03-01', 50.00),
    (13, '2025-01-01', 50.00), (13, '2025-02-01', 50.00), (13, '2025-03-01', 50.00),

    -- Derek (id=3): 70% DoD, 30% Internal
    (3,  '2025-01-01', 70.00), (3,  '2025-02-01', 70.00), (3,  '2025-03-01', 70.00),
    (23, '2025-01-01', 30.00), (23, '2025-02-01', 30.00), (23, '2025-03-01', 30.00),

    -- Aiko (id=4): 60% DoD, 40% Commercial
    (4,  '2025-01-01', 60.00), (4,  '2025-02-01', 60.00), (4,  '2025-03-01', 60.00),
    (17, '2025-01-01', 40.00), (17, '2025-02-01', 40.00), (17, '2025-03-01', 40.00),

    -- Claire (id=9): 50% NIH, 25% NSF, 25% Internal
    (8,  '2025-01-01', 50.00), (8,  '2025-02-01', 50.00), (8,  '2025-03-01', 50.00),
    (14, '2025-01-01', 25.00), (14, '2025-02-01', 25.00), (14, '2025-03-01', 25.00),
    (24, '2025-01-01', 25.00), (24, '2025-02-01', 25.00), (24, '2025-03-01', 25.00),

    -- Tyler (id=10): 100% NIH
    (9,  '2025-01-01', 100.00), (9,  '2025-02-01', 100.00), (9,  '2025-03-01', 100.00),

    -- Nadia (id=11): 100% Commercial
    (18, '2025-01-01', 100.00), (18, '2025-02-01', 100.00), (18, '2025-03-01', 100.00),

    -- Omar (id=14): 50% NIH, 50% NSF
    (10, '2025-01-01', 50.00), (10, '2025-02-01', 50.00), (10, '2025-03-01', 50.00),
    (15, '2025-01-01', 50.00), (15, '2025-02-01', 50.00), (15, '2025-03-01', 50.00);

-- Staff Salaries (Boston ML/CV market rates)
INSERT INTO staff_salaries (staff_id, annual_salary, effective_date, end_date) VALUES
    (1,  195000.00, '2024-01-01', NULL),  -- CEO
    (2,  210000.00, '2024-01-01', NULL),  -- CTO
    (3,  195000.00, '2024-01-01', NULL),  -- VP Research
    (4,  195000.00, '2024-01-01', NULL),  -- VP Engineering
    (5,  185000.00, '2024-01-01', NULL),  -- Principal Research Scientist
    (6,  175000.00, '2024-01-01', NULL),  -- Senior ML Engineer
    (7,  178000.00, '2024-01-01', NULL),  -- Senior CV Engineer
    (8,  155000.00, '2024-01-01', NULL),  -- MLOps Engineer
    (9,  165000.00, '2024-01-01', NULL),  -- Research Scientist
    (10, 162000.00, '2024-01-01', NULL),  -- CV Engineer
    (11, 158000.00, '2024-01-01', NULL),  -- ML Engineer
    (12, 148000.00, '2024-01-01', NULL),  -- Software Engineer
    (13, 155000.00, '2024-01-01', NULL),  -- Product Manager
    (14, 165000.00, '2024-01-01', NULL),  -- Research Scientist
    (15, 120000.00, '2024-01-01', NULL);  -- Finance & Ops Manager

-- Program Expenses
INSERT INTO program_expenses (program_id, staff_id, expense_date, amount, category, vendor, description, reference_number) VALUES
    -- DoD SBIR
    (1, 6,  '2025-01-08', 12400.00, 'Equipment',   'NVIDIA',              'RTX 6000 Ada GPU (x2) for edge inference testing',   'EXP-2501-001'),
    (1, 7,  '2025-01-15', 3800.00,  'Software',    'Weights & Biases',    'W&B Teams annual license',                           'EXP-2501-002'),
    (1, 8,  '2025-02-04', 6200.00,  'Contractor',  'BostonRobotics LLC',  'Sensor integration consulting (40 hrs)',              'EXP-2501-003'),
    (1, 6,  '2025-02-20', 1950.00,  'Travel',      'Delta / Marriott',    'DARPA quarterly review — Arlington VA',               'EXP-2501-004'),
    (1, 2,  '2025-03-11', 2400.00,  'Travel',      'Delta / Hilton',      'DoD program review — Pentagon',                      'EXP-2501-005'),

    -- NIH STTR
    (2, 10, '2025-01-10', 8900.00,  'Equipment',   'Leica Biosystems',    'Digital pathology slide scanner (partial pmt)',       'EXP-2502-001'),
    (2, 9,  '2025-01-22', 4200.00,  'Contractor',  'PathologyAI Inc.',    'Dataset annotation — 5,000 WSI labels',              'EXP-2502-002'),
    (2, 14, '2025-02-05', 1600.00,  'Travel',      'United / Westin',     'NIH study section presentation — Bethesda MD',       'EXP-2502-003'),
    (2, 3,  '2025-02-18', 2750.00,  'Supplies',    'AWS',                 'S3 + EC2 cloud compute — Jan/Feb batch jobs',        'EXP-2502-004'),
    (2, 9,  '2025-03-03', 5100.00,  'Contractor',  'PathologyAI Inc.',    'Dataset annotation — 6,000 additional WSI labels',   'EXP-2502-005'),

    -- NSF CAREER
    (3, 14, '2025-01-14', 3200.00,  'Supplies',    'AWS',                 'GPU compute — distribution shift experiments',       'EXP-2503-001'),
    (3, 9,  '2025-02-12', 1850.00,  'Travel',      'JetBlue / Marriott',  'ICLR 2025 — Singapore (registration + travel)',      'EXP-2503-002'),
    (3, 5,  '2025-03-06', 1100.00,  'Supplies',    'OpenAI',              'API credits for benchmark comparison study',         'EXP-2503-003'),

    -- Commercial MedDevice
    (4, 11, '2025-01-06', 4500.00,  'Contractor',  'UX Boston',           'UI/UX research sprint — clinical workflow',          'EXP-2504-001'),
    (4, 12, '2025-01-28', 2200.00,  'Software',    'Vercel / PlanetScale','Infrastructure — prod deployment Jan',               'EXP-2504-002'),
    (4, 7,  '2025-02-10', 3600.00,  'Travel',      'Delta / Hyatt',       'On-site integration at MedDevice Co. — Chicago',     'EXP-2504-003'),
    (4, 12, '2025-03-01', 2200.00,  'Software',    'Vercel / PlanetScale','Infrastructure — prod deployment Feb',               'EXP-2504-004'),

    -- Internal R&D
    (5, 6,  '2025-01-20', 9800.00,  'Equipment',   'NVIDIA',              'H100 PCIe GPU for foundation model pretraining',     'EXP-2505-001'),
    (5, 5,  '2025-02-14', 5600.00,  'Supplies',    'AWS',                 'SageMaker + S3 — pretraining data pipeline',         'EXP-2505-002'),
    (5, 6,  '2025-03-05', 3100.00,  'Supplies',    'Hugging Face',        'Dataset Hub enterprise subscription + storage',      'EXP-2505-003');

-- Program Salary Charges (Jan–Mar 2025)
INSERT INTO program_salary_charges (program_id, staff_id, charge_month, amount_charged, applied_percentage) VALUES
    -- Marcus (CTO, $210k/yr ≈ $17,500/mo)
    (1, 2, '2025-01-01', 10500.00, 60.00),
    (5, 2, '2025-01-01',  3500.00, 20.00),
    (1, 2, '2025-02-01', 10500.00, 60.00),
    (5, 2, '2025-02-01',  3500.00, 20.00),
    (1, 2, '2025-03-01', 10500.00, 60.00),
    (5, 2, '2025-03-01',  3500.00, 20.00),

    -- Sofia (VP Research, $195k/yr ≈ $16,250/mo)
    (2, 3, '2025-01-01',  6500.00, 40.00),
    (3, 3, '2025-01-01',  4875.00, 30.00),
    (5, 3, '2025-01-01',  4875.00, 30.00),
    (2, 3, '2025-02-01',  6500.00, 40.00),
    (3, 3, '2025-02-01',  4875.00, 30.00),
    (5, 3, '2025-02-01',  4875.00, 30.00),
    (2, 3, '2025-03-01',  6500.00, 40.00),
    (3, 3, '2025-03-01',  4875.00, 30.00),
    (5, 3, '2025-03-01',  4875.00, 30.00),

    -- Lena (Principal Research Scientist, $185k/yr ≈ $15,417/mo)
    (1, 5, '2025-01-01',  7708.00, 50.00),
    (3, 5, '2025-01-01',  7708.00, 50.00),
    (1, 5, '2025-02-01',  7708.00, 50.00),
    (3, 5, '2025-02-01',  7708.00, 50.00),
    (1, 5, '2025-03-01',  7708.00, 50.00),
    (3, 5, '2025-03-01',  7708.00, 50.00),

    -- Derek (Senior ML Engineer, $175k/yr ≈ $14,583/mo)
    (1, 6, '2025-01-01', 10208.00, 70.00),
    (5, 6, '2025-01-01',  4375.00, 30.00),
    (1, 6, '2025-02-01', 10208.00, 70.00),
    (5, 6, '2025-02-01',  4375.00, 30.00),
    (1, 6, '2025-03-01', 10208.00, 70.00),
    (5, 6, '2025-03-01',  4375.00, 30.00),

    -- Aiko (Senior CV Engineer, $178k/yr ≈ $14,833/mo)
    (1, 7, '2025-01-01',  8900.00, 60.00),
    (4, 7, '2025-01-01',  5933.00, 40.00),
    (1, 7, '2025-02-01',  8900.00, 60.00),
    (4, 7, '2025-02-01',  5933.00, 40.00),
    (1, 7, '2025-03-01',  8900.00, 60.00),
    (4, 7, '2025-03-01',  5933.00, 40.00),

    -- Claire (Research Scientist, $165k/yr ≈ $13,750/mo)
    (2, 9, '2025-01-01',  6875.00, 50.00),
    (3, 9, '2025-01-01',  3438.00, 25.00),
    (5, 9, '2025-01-01',  3438.00, 25.00),
    (2, 9, '2025-02-01',  6875.00, 50.00),
    (3, 9, '2025-02-01',  3438.00, 25.00),
    (5, 9, '2025-02-01',  3438.00, 25.00),
    (2, 9, '2025-03-01',  6875.00, 50.00),
    (3, 9, '2025-03-01',  3438.00, 25.00),
    (5, 9, '2025-03-01',  3438.00, 25.00),

    -- Tyler (CV Engineer, $162k/yr ≈ $13,500/mo)
    (2, 10, '2025-01-01', 13500.00, 100.00),
    (2, 10, '2025-02-01', 13500.00, 100.00),
    (2, 10, '2025-03-01', 13500.00, 100.00),

    -- Omar (Research Scientist, $165k/yr ≈ $13,750/mo)
    (2, 14, '2025-01-01',  6875.00, 50.00),
    (3, 14, '2025-01-01',  6875.00, 50.00),
    (2, 14, '2025-02-01',  6875.00, 50.00),
    (3, 14, '2025-02-01',  6875.00, 50.00),
    (2, 14, '2025-03-01',  6875.00, 50.00),
    (3, 14, '2025-03-01',  6875.00, 50.00),

    -- Nadia (ML Engineer, $158k/yr ≈ $13,167/mo)
    (4, 11, '2025-01-01', 13167.00, 100.00),
    (4, 11, '2025-02-01', 13167.00, 100.00),
    (4, 11, '2025-03-01', 13167.00, 100.00),

    -- Brianna (Finance & Ops, $120k/yr ≈ $10,000/mo) split across grants
    (1, 15, '2025-01-01',  4000.00, 40.00),
    (2, 15, '2025-01-01',  3000.00, 30.00),
    (4, 15, '2025-01-01',  3000.00, 30.00),
    (1, 15, '2025-02-01',  4000.00, 40.00),
    (2, 15, '2025-02-01',  3000.00, 30.00),
    (4, 15, '2025-02-01',  3000.00, 30.00),
    (1, 15, '2025-03-01',  4000.00, 40.00),
    (2, 15, '2025-03-01',  3000.00, 30.00),
    (4, 15, '2025-03-01',  3000.00, 30.00);
