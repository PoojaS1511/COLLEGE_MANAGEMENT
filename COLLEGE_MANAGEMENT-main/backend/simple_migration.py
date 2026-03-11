"""
Simple Transport Fee Migration to Supabase
"""

import sqlite3
import os
import httpx
from datetime import datetime
from supabase import create_client

# Patch httpx to ignore proxy argument
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')

def simple_migration():
    """Simple migration script"""
    print("=" * 60)
    print("SIMPLE TRANSPORT FEES MIGRATION")
    print("=" * 60)
    
    try:
        # Initialize Supabase client
        supabase_url = 'https://qkaaoeismqnhjyikgkme.supabase.co'
        supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Connect to SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get all records from SQLite
        cursor.execute("SELECT * FROM transport_fees")
        records = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(transport_fees)")
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"📊 Found {len(records)} records to migrate")
        
        if len(records) == 0:
            print("ℹ️ No records to migrate")
            return True
        
        # Prepare data for Supabase
        success_count = 0
        error_count = 0
        
        for i, record in enumerate(records, 1):
            try:
                record_dict = dict(zip(columns, record))
                
                # Prepare Supabase data
                supabase_data = {
                    'student_id': str(record_dict.get('student_id', '')),
                    'route_name': record_dict.get('route_id', f"Route {record_dict.get('route_id', 'Unknown')}"),
                    'bus_no': record_dict.get('bus_no'),
                    'fee_amount': float(record_dict.get('amount', 2500.0)),
                    'paid_amount': float(record_dict.get('amount', 0.0)) if record_dict.get('payment_status') == 'Paid' else 0.0,
                    'payment_status': record_dict.get('payment_status', 'Pending'),
                    'payment_date': record_dict.get('payment_date'),
                    'academic_year': '2025-2026'
                }
                
                # Remove None values
                supabase_data = {k: v for k, v in supabase_data.items() if v is not None}
                
                print(f"📝 Migrating record {i}: {record_dict.get('student_id')}")
                
                # Insert into Supabase
                response = supabase.table('transport_fee').insert(supabase_data).execute()
                
                if response.data:
                    print(f"✅ Successfully migrated record {i}")
                    success_count += 1
                else:
                    print(f"❌ Failed to migrate record {i}: {response.error}")
                    error_count += 1
                    
            except Exception as e:
                print(f"❌ Error migrating record {i}: {e}")
                error_count += 1
        
        conn.close()
        
        # Summary
        print(f"\n📊 MIGRATION SUMMARY:")
        print(f"  - Total records: {len(records)}")
        print(f"  - Successful: {success_count}")
        print(f"  - Errors: {error_count}")
        print(f"  - Success rate: {(success_count/len(records)*100):.1f}%")
        
        return error_count == 0
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def verify_migration():
    """Verify migration"""
    print("\n" + "=" * 60)
    print("VERIFYING MIGRATION")
    print("=" * 60)
    
    try:
        # Initialize Supabase
        supabase_url = 'https://qkaaoeismqnhjyikgkme.supabase.co'
        supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
        supabase = create_client(supabase_url, supabase_key)
        
        # Get Supabase count
        response = supabase.table('transport_fee').select('count', count='exact').execute()
        supabase_count = response.count if hasattr(response, 'count') else len(response.data) if response.data else 0
        
        # Get SQLite count
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM transport_fees")
        sqlite_count = cursor.fetchone()[0]
        conn.close()
        
        print(f"📊 SQLite records: {sqlite_count}")
        print(f"📊 Supabase records: {supabase_count}")
        
        if sqlite_count == supabase_count:
            print("✅ Migration verification successful!")
            return True
        else:
            print(f"⚠️ Count mismatch: {sqlite_count} vs {supabase_count}")
            return False
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 SIMPLE TRANSPORT FEE MIGRATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Migrate data
    migration_success = simple_migration()
    
    # Verify migration
    if migration_success:
        verification_success = verify_migration()
        
        if verification_success:
            print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
            print("✅ All transport fee data is now in Supabase")
        else:
            print("\n⚠️ MIGRATION COMPLETED WITH VERIFICATION ISSUES")
    else:
        print("\n❌ MIGRATION FAILED")
    
    return migration_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
