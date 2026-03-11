# PostgreSQL Migration TODO List

## Task Overview
Migrate the following 4 modules from Supabase to PostgreSQL (same as other modules like admissions, admin, faculty, etc.)

## Modules to Migrate
1. **Finance Module** - finance.py
2. **Transport Module** - transportController.py + transportRoutesController.py
3. **Quality Module** - quality/accreditation.py, audits.py, policies.py, grievances.py, faculty.py, dashboard.py, analytics.py
4. **Payroll Module** - payrollController.py + supabase_payroll.py

## Implementation Pattern
Following the same pattern as existing PostgreSQL modules:
- Replace `from supabase_client import get_supabase` with `from postgres_client import execute_query, execute_insert, execute_update, execute_delete`
- Replace `supabase.table(...).select(...).execute()` with `execute_query(...)`
- Replace `supabase.table(...).insert(...).execute()` with `execute_insert(...)`
- Replace `supabase.table(...).update(...).eq(...).execute()` with `execute_update(...)`
- Replace `supabase.table(...).delete().eq(...).execute()` with `execute_delete(...)`

---

## TODO Items

### Phase 1: Finance Module Migration
- [ ] 1.1 Migrate backend/routes/finance.py from Supabase to PostgreSQL
- [ ] 1.2 Test finance endpoints

### Phase 2: Transport Module Migration
- [ ] 2.1 Migrate backend/controllers/transportController.py from Supabase to PostgreSQL
- [ ] 2.2 Migrate backend/controllers/transportRoutesController.py from Supabase to PostgreSQL
- [ ] 2.3 Test transport endpoints

### Phase 3: Quality Module Migration
- [ ] 3.1 Migrate backend/routes/quality/accreditation.py from Supabase to PostgreSQL
- [ ] 3.2 Migrate backend/routes/quality/audits.py from Supabase to PostgreSQL
- [ ] 3.3 Migrate backend/routes/quality/policies.py from Supabase to PostgreSQL
- [ ] 3.4 Migrate backend/routes/quality/grievances.py from Supabase to PostgreSQL
- [ ] 3.5 Migrate backend/routes/quality/faculty.py from Supabase to PostgreSQL
- [ ] 3.6 Migrate backend/routes/quality/dashboard.py from Supabase to PostgreSQL
- [ ] 3.7 Migrate backend/routes/quality/analytics.py from Supabase to PostgreSQL
- [ ] 3.8 Test quality endpoints

### Phase 4: Payroll Module Migration
- [ ] 4.1 Migrate backend/controllers/payrollController.py from Supabase to PostgreSQL
- [ ] 4.2 Migrate backend/models/supabase_payroll.py from Supabase to PostgreSQL
- [ ] 4.3 Test payroll endpoints

### Phase 5: Final Testing
- [ ] 5.1 Run all endpoints to verify functionality
- [ ] 5.2 Verify database operations work correctly

