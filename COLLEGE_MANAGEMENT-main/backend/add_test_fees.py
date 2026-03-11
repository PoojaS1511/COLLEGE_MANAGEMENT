"""
Add Test Transport Fee Data to Supabase
"""

import httpx
from supabase import create_client
import uuid
from datetime import datetime, timedelta

# Patch httpx
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

def add_test_data():
    """Add test transport fee data"""
    print("🚀 Adding test transport fee data...")
    
    supabase_url = 'https://qkaaoeismqnhjyikgkme.supabase.co'
    supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODg1NzRfQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
    
    supabase = create_client(supabase_url, supabase_key)
    
    # Test data with different routes and statuses
    test_data = [
        {
            'student_id': str(uuid.uuid4()),
            'route_name': 'RT-01 - City Center',
            'bus_no': 'BUS-001',
            'fee_amount': 2500.00,
            'paid_amount': 2500.00,
            'payment_status': 'Paid',
            'payment_date': '2025-12-15',
            'academic_year': '2025-2026'
        },
        {
            'student_id': str(uuid.uuid4()),
            'route_name': 'RT-02 - North Campus',
            'bus_no': 'BUS-002',
            'fee_amount': 2500.00,
            'paid_amount': 0.00,
            'payment_status': 'Pending',
            'academic_year': '2025-2026'
        },
        {
            'student_id': str(uuid.uuid4()),
            'route_name': 'RT-03 - South Zone',
            'bus_no': 'BUS-003',
            'fee_amount': 2500.00,
            'paid_amount': 0.00,
            'payment_status': 'Overdue',
            'academic_year': '2025-2026'
        },
        {
            'student_id': str(uuid.uuid4()),
            'route_name': 'RT-04 - East Side',
            'bus_no': 'BUS-004',
            'fee_amount': 2500.00,
            'paid_amount': 1250.00,
            'payment_status': 'Partial',
            'payment_date': '2025-12-20',
            'academic_year': '2025-2026'
        },
        {
            'student_id': str(uuid.uuid4()),
            'route_name': 'RT-05 - West End',
            'bus_no': 'BUS-005',
            'fee_amount': 2500.00,
            'paid_amount': 2500.00,
            'payment_status': 'Paid',
            'payment_date': '2025-12-10',
            'academic_year': '2025-2026'
        }
    ]
    
    success_count = 0
    for i, data in enumerate(test_data, 1):
        try:
            response = supabase.table('transport_fee').insert(data).execute()
            if response.data:
                print(f"✅ Added test record {i}: {data['route_name']} - {data['payment_status']}")
                success_count += 1
            else:
                print(f"❌ Failed to add record {i}: {response.error}")
        except Exception as e:
            print(f"❌ Error adding record {i}: {e}")
    
    print(f"\n📊 Added {success_count}/{len(test_data)} test records")
    return success_count > 0

if __name__ == "__main__":
    add_test_data()
