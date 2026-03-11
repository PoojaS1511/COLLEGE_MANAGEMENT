#!/usr/bin/env python3
"""
Check transport attendance data in Supabase
"""

from supabase_client import get_supabase

def check_attendance_data():
    """Check if attendance data exists in Supabase"""
    try:
        supabase = get_supabase()

        # Check total count
        response = supabase.table('transport_attendance').select('*', count='exact').execute()
        total_count = response.count
        print(f"Total attendance records: {total_count}")

        if total_count > 0:
            # Get sample records
            sample_response = supabase.table('transport_attendance').select('*').limit(3).execute()
            print("Sample attendance records:")
            for record in sample_response.data:
                print(f"  - ID: {record.get('id')}, Date: {record.get('date')}, Entity: {record.get('entity_name')}, Status: {record.get('status')}")
        else:
            print("No attendance records found in database")

        # Check recent records (last 7 days)
        from datetime import datetime, timedelta
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        recent_response = supabase.table('transport_attendance').select('*').gte('date', week_ago).execute()
        print(f"Recent attendance records (last 7 days): {len(recent_response.data) if recent_response.data else 0}")

    except Exception as e:
        print(f"Error checking attendance data: {e}")

if __name__ == "__main__":
    check_attendance_data()
