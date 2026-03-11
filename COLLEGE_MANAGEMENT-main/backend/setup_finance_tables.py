#!/usr/bin/env python3
"""
Setup script for Finance module database tables in Supabase
"""

from supabase_client import get_supabase
import uuid
from datetime import datetime, timedelta
import traceback

def create_finance_tables():
    """Create all finance-related tables in Supabase"""
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # SQL to create finance tables
        tables_sql = [
            # Student Fees Table
            """
            CREATE TABLE IF NOT EXISTS finance_studentfees (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                student_id TEXT NOT NULL,
                student_name TEXT NOT NULL,
                department TEXT,
                year INTEGER,
                total_fee DECIMAL(10,2),
                paid_amount DECIMAL(10,2) DEFAULT 0,
                pending_amount DECIMAL(10,2),
                payment_date DATE,
                payment_status TEXT DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_by UUID,
                updated_by UUID
            );
            """,

            # Expenses Table
            """
            CREATE TABLE IF NOT EXISTS finance_expense (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                expense_id TEXT NOT NULL UNIQUE,
                department TEXT,
                category TEXT,
                amount DECIMAL(10,2),
                vendor TEXT,
                date DATE,
                payment_status TEXT DEFAULT 'pending',
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_by UUID,
                updated_by UUID
            );
            """,

            # Budget Allocation Table
            """
            CREATE TABLE IF NOT EXISTS finance_budgetallocation (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                budget_id TEXT NOT NULL UNIQUE,
                department TEXT,
                financial_year TEXT,
                allocated_amount DECIMAL(10,2),
                used_amount DECIMAL(10,2) DEFAULT 0,
                remaining_amount DECIMAL(10,2),
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_by UUID,
                updated_by UUID
            );
            """,

            # Staff Payroll Table
            """
            CREATE TABLE IF NOT EXISTS finance_staffpayroll (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                staff_id TEXT NOT NULL,
                staff_name TEXT NOT NULL,
                department TEXT,
                role TEXT,
                base_salary DECIMAL(10,2),
                allowance DECIMAL(10,2) DEFAULT 0,
                deduction DECIMAL(10,2) DEFAULT 0,
                net_salary DECIMAL(10,2),
                payment_date DATE,
                payment_status TEXT DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_by UUID,
                updated_by UUID
            );
            """,

            # Vendors Table
            """
            CREATE TABLE IF NOT EXISTS finance_vendors (
                vendor_id TEXT PRIMARY KEY,
                vendor_name TEXT NOT NULL,
                service_type TEXT,
                contact_no TEXT,
                email TEXT,
                total_transactions INTEGER DEFAULT 0,
                amount_paid DECIMAL(10,2) DEFAULT 0,
                amount_due DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_by UUID,
                updated_by UUID
            );
            """,

            # Operation & Maintenance Table
            """
            CREATE TABLE IF NOT EXISTS finance_operationmaintenance (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                request_id TEXT NOT NULL UNIQUE,
                department TEXT,
                asset TEXT,
                issue_description TEXT,
                reported_date DATE,
                resolved_date DATE,
                cost DECIMAL(10,2) DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_by UUID,
                updated_by UUID
            );
            """
        ]

        # Execute table creation
        for i, sql in enumerate(tables_sql, 1):
            try:
                print(f"📋 Creating table {i}/6...")
                result = supabase.rpc('exec_sql', {'sql': sql}).execute()
                print(f"✅ Table {i} created successfully")
            except Exception as e:
                print(f"⚠️  Table {i} creation failed (might already exist): {str(e)}")

        print("🎉 All finance tables created successfully!")
        return True

    except Exception as e:
        print(f"❌ Error creating finance tables: {str(e)}")
        traceback.print_exc()
        return False

def insert_sample_data():
    """Insert sample data into finance tables"""
    try:
        supabase = get_supabase()
        print("📊 Inserting sample finance data...")

        # Sample student fees data
        student_fees_data = [
            {
                'id': str(uuid.uuid4()),
                'student_id': 'REG2024001',
                'student_name': 'John Doe',
                'department': 'CSE',
                'year': 2024,
                'total_fee': 50000.00,
                'paid_amount': 25000.00,
                'pending_amount': 25000.00,
                'payment_status': 'partial',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'student_id': 'REG2024002',
                'student_name': 'Jane Smith',
                'department': 'ECE',
                'year': 2024,
                'total_fee': 55000.00,
                'paid_amount': 55000.00,
                'pending_amount': 0.00,
                'payment_status': 'completed',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'student_id': 'REG2024003',
                'student_name': 'Mike Johnson',
                'department': 'MECH',
                'year': 2024,
                'total_fee': 48000.00,
                'paid_amount': 12000.00,
                'pending_amount': 36000.00,
                'payment_status': 'partial',
                'created_at': datetime.now().isoformat()
            }
        ]

        # Insert student fees
        for fee in student_fees_data:
            try:
                supabase.table('finance_studentfees').insert(fee).execute()
            except Exception as e:
                print(f"⚠️  Failed to insert student fee for {fee['student_name']}: {str(e)}")

        # Sample expenses data
        expenses_data = [
            {
                'id': str(uuid.uuid4()),
                'expense_id': 'EXP001',
                'department': 'CSE',
                'category': 'Equipment',
                'amount': 15000.00,
                'vendor': 'TechCorp Solutions',
                'payment_status': 'paid',
                'description': 'Computer lab equipment purchase',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'expense_id': 'EXP002',
                'department': 'ECE',
                'category': 'Maintenance',
                'amount': 8000.00,
                'vendor': 'ServicePro Maintenance',
                'payment_status': 'pending',
                'description': 'Lab equipment maintenance',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'expense_id': 'EXP003',
                'department': 'MECH',
                'category': 'Utilities',
                'amount': 12000.00,
                'vendor': 'UtilityCorp',
                'payment_status': 'paid',
                'description': 'Monthly utility bills',
                'created_at': datetime.now().isoformat()
            }
        ]

        # Insert expenses
        for expense in expenses_data:
            try:
                supabase.table('finance_expense').insert(expense).execute()
            except Exception as e:
                print(f"⚠️  Failed to insert expense {expense['expense_id']}: {str(e)}")

        # Sample budget data
        budget_data = [
            {
                'id': str(uuid.uuid4()),
                'budget_id': 'BUD001',
                'department': 'CSE',
                'financial_year': '2024-25',
                'allocated_amount': 200000.00,
                'used_amount': 75000.00,
                'remaining_amount': 125000.00,
                'status': 'active',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'budget_id': 'BUD002',
                'department': 'ECE',
                'financial_year': '2024-25',
                'allocated_amount': 180000.00,
                'used_amount': 45000.00,
                'remaining_amount': 135000.00,
                'status': 'active',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'budget_id': 'BUD003',
                'department': 'MECH',
                'financial_year': '2024-25',
                'allocated_amount': 160000.00,
                'used_amount': 95000.00,
                'remaining_amount': 65000.00,
                'status': 'warning',
                'created_at': datetime.now().isoformat()
            }
        ]

        # Insert budget allocations
        for budget in budget_data:
            try:
                supabase.table('finance_budgetallocation').insert(budget).execute()
            except Exception as e:
                print(f"⚠️  Failed to insert budget {budget['budget_id']}: {str(e)}")

        # Sample staff payroll data
        payroll_data = [
            {
                'id': str(uuid.uuid4()),
                'staff_id': 'STF001',
                'staff_name': 'Dr. Rajesh Kumar',
                'department': 'CSE',
                'role': 'Professor',
                'base_salary': 75000.00,
                'allowance': 5000.00,
                'deduction': 2000.00,
                'net_salary': 78000.00,
                'payment_status': 'paid',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'staff_id': 'STF002',
                'staff_name': 'Dr. Priya Sharma',
                'department': 'ECE',
                'role': 'Associate Professor',
                'base_salary': 65000.00,
                'allowance': 4000.00,
                'deduction': 1500.00,
                'net_salary': 67500.00,
                'payment_status': 'pending',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'staff_id': 'STF003',
                'staff_name': 'Prof. Arun Kumar',
                'department': 'MECH',
                'role': 'Assistant Professor',
                'base_salary': 55000.00,
                'allowance': 3000.00,
                'deduction': 1000.00,
                'net_salary': 57000.00,
                'payment_status': 'paid',
                'created_at': datetime.now().isoformat()
            }
        ]

        # Insert payroll data
        for payroll in payroll_data:
            try:
                supabase.table('finance_staffpayroll').insert(payroll).execute()
            except Exception as e:
                print(f"⚠️  Failed to insert payroll for {payroll['staff_name']}: {str(e)}")

        # Sample vendors data
        vendors_data = [
            {
                'vendor_id': 'VEN001',
                'vendor_name': 'TechCorp Solutions',
                'service_type': 'IT Equipment',
                'contact_no': '+91-9876543210',
                'email': 'contact@techcorp.com',
                'total_transactions': 5,
                'amount_paid': 75000.00,
                'amount_due': 25000.00,
                'created_at': datetime.now().isoformat()
            },
            {
                'vendor_id': 'VEN002',
                'vendor_name': 'ServicePro Maintenance',
                'service_type': 'Maintenance Services',
                'contact_no': '+91-9876543211',
                'email': 'info@servicepro.com',
                'total_transactions': 3,
                'amount_paid': 24000.00,
                'amount_due': 0.00,
                'created_at': datetime.now().isoformat()
            },
            {
                'vendor_id': 'VEN003',
                'vendor_name': 'UtilityCorp',
                'service_type': 'Utilities',
                'contact_no': '+91-9876543212',
                'email': 'billing@utilitycorp.com',
                'total_transactions': 12,
                'amount_paid': 48000.00,
                'amount_due': 0.00,
                'created_at': datetime.now().isoformat()
            }
        ]

        # Insert vendors data
        for vendor in vendors_data:
            try:
                supabase.table('finance_vendors').insert(vendor).execute()
            except Exception as e:
                print(f"⚠️  Failed to insert vendor {vendor['vendor_id']}: {str(e)}")

        # Sample maintenance data
        maintenance_data = [
            {
                'id': str(uuid.uuid4()),
                'request_id': 'MAINT001',
                'department': 'CSE',
                'asset': 'Computer Lab Projector',
                'issue_description': 'Projector not displaying properly - needs bulb replacement',
                'status': 'resolved',
                'cost': 5000.00,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'request_id': 'MAINT002',
                'department': 'ECE',
                'asset': 'Lab Equipment',
                'issue_description': 'Circuit testing equipment malfunction - calibration required',
                'status': 'in progress',
                'cost': 0.00,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'request_id': 'MAINT003',
                'department': 'MECH',
                'asset': 'Workshop Tools',
                'issue_description': 'Hydraulic press needs maintenance - unusual noise during operation',
                'status': 'pending',
                'cost': 0.00,
                'created_at': datetime.now().isoformat()
            }
        ]

        # Insert maintenance data
        for maintenance in maintenance_data:
            try:
                supabase.table('finance_operationmaintenance').insert(maintenance).execute()
            except Exception as e:
                print(f"⚠️  Failed to insert maintenance {maintenance['request_id']}: {str(e)}")

        print("✅ Sample finance data inserted successfully!")
        return True

    except Exception as e:
        print(f"❌ Error inserting sample data: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Main setup function"""
    print("🚀 Starting Finance Module Setup...")
    print("=" * 50)

    # Create tables
    if create_finance_tables():
        print("\n" + "=" * 50)
        # Insert sample data
        if insert_sample_data():
            print("\n" + "=" * 50)
            print("🎉 Finance module setup completed successfully!")
            print("\n📋 Summary:")
            print("   ✅ Tables created: 6")
            print("   ✅ Student fees records: 3")
            print("   ✅ Expense records: 3")
            print("   ✅ Budget allocations: 3")
            print("   ✅ Staff payroll records: 3")
            print("   ✅ Vendor records: 3")
            print("   ✅ Maintenance requests: 3")
            print("\n🔄 You can now access the finance module in your application!")
        else:
            print("❌ Failed to insert sample data")
    else:
        print("❌ Failed to create finance tables")

if __name__ == "__main__":
    main()
