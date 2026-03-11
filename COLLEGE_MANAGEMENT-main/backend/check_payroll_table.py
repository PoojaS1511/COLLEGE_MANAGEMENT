"""
Check if payroll table exists and has data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import get_supabase

def check_payroll_table():
    """Check if payroll table exists and has data"""
    supabase = get_supabase()

    print("🔍 Checking payroll table...")

    try:
        # Try to select from payroll table
        result = supabase.table('payroll').select('*', count='exact').limit(5).execute()

        if result.data:
            print(f"✅ Payroll table exists with {result.count} records")
            print("📊 Sample records:")
            for record in result.data:
                print(f"   - ID: {record.get('id')}, Faculty: {record.get('faculty_id')}, Month: {record.get('pay_month')}, Status: {record.get('status')}")
        else:
            print("⚠️  Payroll table exists but has no data")

    except Exception as e:
        error_msg = str(e).lower()
        if "relation" in error_msg and "does not exist" in error_msg:
            print("❌ Payroll table does not exist")
            print("💡 You need to create the payroll table first")
            return False
        else:
            print(f"❌ Error checking payroll table: {str(e)}")
            return False

    return True

if __name__ == "__main__":
    check_payroll_table()
