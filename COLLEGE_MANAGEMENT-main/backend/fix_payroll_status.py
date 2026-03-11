"""
Fix payroll status to enable payslip generation
Updates some payroll records to 'Approved' status
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import get_supabase

def fix_payroll_status():
    """Update some payroll records to Approved status for testing"""
    supabase = get_supabase()

    print("🔧 Fixing payroll status for payslip generation...")

    try:
        # Get some pending payroll records
        result = supabase.table('payroll').select('*').eq('status', 'Pending').limit(5).execute()

        if not result.data:
            print("⚠️  No pending payroll records found")
            return False

        print(f"📊 Found {len(result.data)} pending records")

        # Update them to Approved status
        updated_count = 0
        for record in result.data:
            update_result = supabase.table('payroll').update({'status': 'Approved'}).eq('id', record['id']).execute()
            if update_result.data:
                updated_count += 1
                print(f"✅ Updated payroll ID {record['id']} to Approved status")

        print(f"🎉 Successfully updated {updated_count} payroll records to Approved status")
        print("💡 These records can now be used for payslip generation")

        return True

    except Exception as e:
        print(f"❌ Error fixing payroll status: {str(e)}")
        return False

if __name__ == "__main__":
    fix_payroll_status()
