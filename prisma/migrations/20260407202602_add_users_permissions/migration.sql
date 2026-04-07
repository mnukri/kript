-- CreateEnum
CREATE TYPE "labor_category" AS ENUM ('FTE', 'COOP', 'TEMP');

-- CreateEnum
CREATE TYPE "program_status" AS ENUM ('active', 'closed', 'pending');

-- CreateEnum
CREATE TYPE "charge_type" AS ENUM ('effort', 'purchase', 'travel');

-- CreateEnum
CREATE TYPE "charge_status" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "global_role" AS ENUM ('admin', 'manager', 'staff');

-- CreateEnum
CREATE TYPE "access_level" AS ENUM ('read', 'write', 'approve');

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "job_title" VARCHAR(150),
    "department" VARCHAR(150),
    "labor_category" "labor_category" NOT NULL,
    "hire_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "manager_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "fringe_rates" (
    "fringe_rate_id" SERIAL NOT NULL,
    "labor_category" "labor_category" NOT NULL,
    "rate" DECIMAL(6,4) NOT NULL,
    "effective_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,

    CONSTRAINT "fringe_rates_pkey" PRIMARY KEY ("fringe_rate_id")
);

-- CreateTable
CREATE TABLE "indirect_rates" (
    "indirect_rate_id" SERIAL NOT NULL,
    "rate_type" VARCHAR(100) NOT NULL,
    "rate" DECIMAL(6,4) NOT NULL,
    "effective_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,

    CONSTRAINT "indirect_rates_pkey" PRIMARY KEY ("indirect_rate_id")
);

-- CreateTable
CREATE TABLE "programs" (
    "program_id" SERIAL NOT NULL,
    "program_name" VARCHAR(255) NOT NULL,
    "worktag" VARCHAR(100) NOT NULL,
    "status" "program_status" NOT NULL DEFAULT 'active',
    "pop_start" DATE,
    "pop_end" DATE,
    "total_budget_burdened" DECIMAL(15,2),
    "total_budget_salary_burdened" DECIMAL(15,2),
    "total_budget_salary_unburdened" DECIMAL(15,2),
    "total_budget_purchases_unburdened" DECIMAL(15,2),
    "total_budget_capital_equipment_unburdened" DECIMAL(15,2),
    "sponsor" VARCHAR(255),
    "grant_number" VARCHAR(100),
    "tpoc_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "microsoft_oid" VARCHAR(255) NOT NULL,
    "global_role" "global_role" NOT NULL DEFAULT 'staff',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "program_permissions" (
    "permission_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "access_level" "access_level" NOT NULL,
    "granted_by" INTEGER NOT NULL,

    CONSTRAINT "program_permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "staff_salaries" (
    "salary_id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "annual_salary" DECIMAL(15,2) NOT NULL,
    "effective_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,

    CONSTRAINT "staff_salaries_pkey" PRIMARY KEY ("salary_id")
);

-- CreateTable
CREATE TABLE "effort_entries" (
    "effort_id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "effort_date" DATE NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "effort_entries_pkey" PRIMARY KEY ("effort_id")
);

-- CreateTable
CREATE TABLE "charges" (
    "charge_id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "charge_type" "charge_type" NOT NULL,
    "charge_date" DATE NOT NULL,
    "amount" DECIMAL(15,2),
    "description" TEXT,
    "reference_number" INTEGER NOT NULL DEFAULT 1,
    "status" "charge_status" NOT NULL DEFAULT 'draft',
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("charge_id")
);

-- CreateTable
CREATE TABLE "charge_travel_details" (
    "charge_id" INTEGER NOT NULL,
    "destination" VARCHAR(255),
    "trip_purpose" TEXT,
    "departure_date" DATE NOT NULL,
    "return_date" DATE NOT NULL,

    CONSTRAINT "charge_travel_details_pkey" PRIMARY KEY ("charge_id")
);

-- CreateTable
CREATE TABLE "charge_purchase_details" (
    "charge_id" INTEGER NOT NULL,
    "vendor" VARCHAR(255),
    "category" VARCHAR(100),

    CONSTRAINT "charge_purchase_details_pkey" PRIMARY KEY ("charge_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fringe_rates_labor_category_effective_date_key" ON "fringe_rates"("labor_category", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "indirect_rates_rate_type_effective_date_key" ON "indirect_rates"("rate_type", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_staff_id_key" ON "users"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_microsoft_oid_key" ON "users"("microsoft_oid");

-- CreateIndex
CREATE UNIQUE INDEX "program_permissions_user_id_program_id_key" ON "program_permissions"("user_id", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_salaries_staff_id_effective_date_key" ON "staff_salaries"("staff_id", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "effort_entries_staff_id_program_id_effort_date_key" ON "effort_entries"("staff_id", "program_id", "effort_date");

-- CreateIndex
CREATE UNIQUE INDEX "charges_program_id_staff_id_charge_date_charge_type_referen_key" ON "charges"("program_id", "staff_id", "charge_date", "charge_type", "reference_number");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "staff"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_tpoc_staff_id_fkey" FOREIGN KEY ("tpoc_staff_id") REFERENCES "staff"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_permissions" ADD CONSTRAINT "program_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_permissions" ADD CONSTRAINT "program_permissions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_permissions" ADD CONSTRAINT "program_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_salaries" ADD CONSTRAINT "staff_salaries_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "effort_entries" ADD CONSTRAINT "effort_entries_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "effort_entries" ADD CONSTRAINT "effort_entries_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "staff"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_travel_details" ADD CONSTRAINT "charge_travel_details_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("charge_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_purchase_details" ADD CONSTRAINT "charge_purchase_details_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("charge_id") ON DELETE CASCADE ON UPDATE CASCADE;
