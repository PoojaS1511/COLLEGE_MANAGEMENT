"""
Quick Migration with UUID generation
"""

import sqlite3
import os
import httpx
import uuid
from datetime import datetime
from supabase import create_client

# Patch httpx
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')

def quick_migrate():
    """Quick migration with UUID generation"""
    print("🚀 QUICK MIGRATION WITH UUIDS")
    
    supabase_url = 'https://qkaaoeismqnhjyikgkme.supabase.co'
    supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
    
    supabase = create_client(supabase_url, supabase_key)
    
    # Connect to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get records
    cursor.execute("SELECT * FROM transport_fees LIMIT 100")  # Start with 100 for testing
    records = cursor.fetchall()
    cursor.execute("PRAGMA table_info(transport_fees)")
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"📊 Migrating {len(records)} records...")
    
    success = 0
    for i, record in enumerate(records, 1):
        try:
            record_dict = dict(zip(columns, record))
            
            # Generate UUID for student_id
            student_uuid = str(uuid.uuid4())
            
            supabase_data = {
                'student_id': student_uuid,
                'route_name': f"Route {record_dict.get('route_id', 'Unknown')}",
                'bus_no': record_dict.get('bus_no'),
                'fee_amount': float(record_dict.get('amount', 2500.0)),
                'paid_amount': float(record_dict.get('amount', 0.0)) if record_dict.get('payment_status') == 'Paid' else 0.0,
                'payment_status': record_dict.get('payment_status', 'Pending'),
                'payment_date': record_dict.get('payment_date'),
                'academic_year': '2025-2026'
            }
            
            # Remove None values
            supabase_data = {k: v for k, v in supabase_data.items() if v is not None}
            
            response = supabase.table('transport_fee').insert(supabase_data).execute()
            
            if response.data:
                success += 1
                if i <= 5:  # Show first 5
                    print(f"✅ {i}: {record_dict.get('student_id')} -> {student_uuid}")
            
        except Exception as e:
            if i <= 5:
                print(f"❌ {i}: {e}")
    
    conn.close()
    
    print(f"\n📊 Success: {success}/{len(records)}")
    return success > 0

if __name__ == "__main__":
    quick_migrate()
