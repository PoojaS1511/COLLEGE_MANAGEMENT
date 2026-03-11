"""
Migrate Transport Fee Data from SQLite to Supabase
"""

import sqlite3
import os
from datetime import datetime
from models.supabase_transport_fee import SupabaseTransportFee
def get_supabase():
    """Get Supabase client with hardcoded credentials"""
    class SupabaseClient:
        def __init__(self):
            self.supabase_url = 'https://qkaaoeismqnhjyikgkme.supabase.co'
            self.supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
    
    return SupabaseClient()

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')

def migrate_transport_fees():
    """Migrate transport fees from SQLite to Supabase"""
    print("=" * 60)
    print("MIGRATING TRANSPORT FEES TO SUPABASE")
    print("=" * 60)
    
    try:
        # Get Supabase client
        supabase_client = get_supabase()
        supabase_fee_model = SupabaseTransportFee(
            supabase_client.supabase_url, 
            supabase_client.supabase_key
        )
        
        # Connect to SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get all records from SQLite transport_fees table
        cursor.execute("SELECT * FROM transport_fees")
        sqlite_records = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(transport_fees)")
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"📊 Found {len(sqlite_records)} records in SQLite transport_fees table")
        
        if len(sqlite_records) == 0:
            print("ℹ️ No records to migrate")
            conn.close()
            return True
        
        # Map SQLite columns to Supabase columns
        column_mapping = {
            'id': 'id',
            'student_id': 'student_id',
            'student_name': None,  # Not in Supabase schema
            'amount': 'fee_amount',
            'due_date': None,  # Not in Supabase schema
            'payment_status': 'payment_status',
            'payment_date': 'payment_date',
            'payment_mode': None,  # Not in Supabase schema
            'route_id': 'route_name',  # Map route_id to route_name
            'created_at': 'created_at',
            'updated_at': None  # Not in Supabase schema
        }
        
        # Prepare data for migration
        migrated_count = 0
        error_count = 0
        
        for i, record in enumerate(sqlite_records, 1):
            try:
                # Convert record to dictionary
                record_dict = dict(zip(columns, record))
                
                # Prepare Supabase data
                supabase_data = {}
                
                # Map fields
                for sqlite_col, supabase_col in column_mapping.items():
                    if supabase_col and sqlite_col in record_dict:
                        value = record_dict[sqlite_col]
                        if value is not None:
                            supabase_data[supabase_col] = value
                
                # Add default values for required fields
                if 'route_name' not in supabase_data:
                    supabase_data['route_name'] = f"Route {record_dict.get('route_id', 'Unknown')}"
                
                if 'paid_amount' not in supabase_data:
                    # Calculate paid_amount based on payment_status
                    if record_dict.get('payment_status') == 'Paid':
                        supabase_data['paid_amount'] = record_dict.get('amount', 0)
                    else:
                        supabase_data['paid_amount'] = 0.0
                
                # Add academic year if not present
                if 'academic_year' not in supabase_data:
                    supabase_data['academic_year'] = '2025-2026'
                
                # Convert UUID if needed
                if 'student_id' in supabase_data:
                    student_id = supabase_data['student_id']
                    # Keep student_id as is, just ensure it's a string
                    supabase_data['student_id'] = str(student_id)
                
                print(f"📝 Migrating record {i}/{len(sqlite_records)}: {record_dict.get('student_id')}")
                
                # Insert into Supabase
                result = supabase_fee_model.create(supabase_data)
                print(f"✅ Successfully migrated record {i}")
                migrated_count += 1
                
            except Exception as e:
                print(f"❌ Error migrating record {i}: {e}")
                error_count += 1
                continue
        
        conn.close()
        
        # Summary
        print(f"\n📊 MIGRATION SUMMARY:")
        print(f"  - Total records in SQLite: {len(sqlite_records)}")
        print(f"  - Successfully migrated: {migrated_count}")
        print(f"  - Errors: {error_count}")
        print(f"  - Success rate: {(migrated_count/len(sqlite_records)*100):.1f}%")
        
        if error_count == 0:
            print("🎉 Migration completed successfully!")
            return True
        else:
            print("⚠️ Migration completed with some errors")
            return False
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def verify_migration():
    """Verify migration by comparing counts"""
    print("\n" + "=" * 60)
    print("VERIFYING MIGRATION")
    print("=" * 60)
    
    try:
        # Get Supabase client
        supabase_client = get_supabase()
        supabase_fee_model = SupabaseTransportFee(
            supabase_client.supabase_url, 
            supabase_client.supabase_key
        )
        
        # Connect to SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get SQLite count
        cursor.execute("SELECT COUNT(*) FROM transport_fees")
        sqlite_count = cursor.fetchone()[0]
        
        # Get Supabase count
        supabase_records = supabase_fee_model.get_all()
        supabase_count = len(supabase_records)
        
        print(f"📊 SQLite records: {sqlite_count}")
        print(f"📊 Supabase records: {supabase_count}")
        
        if sqlite_count == supabase_count:
            print("✅ Migration verification successful!")
            
            # Show sample data
            if supabase_records:
                print("\n📝 Sample Supabase record:")
                sample = supabase_records[0]
                for key, value in sample.items():
                    print(f"  - {key}: {value}")
            
            return True
        else:
            print(f"⚠️ Record count mismatch: {sqlite_count} vs {supabase_count}")
            return False
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Main migration function"""
    print("🚀 TRANSPORT FEE MIGRATION TO SUPABASE")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Migrate data
    migration_success = migrate_transport_fees()
    
    # Step 2: Verify migration
    if migration_success:
        verification_success = verify_migration()
        
        if verification_success:
            print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
            print("✅ All transport fee data has been migrated to Supabase")
            print("✅ The system is now using Supabase for transport fees")
        else:
            print("\n⚠️ MIGRATION COMPLETED WITH VERIFICATION ISSUES")
            print("Please check the data manually")
    else:
        print("\n❌ MIGRATION FAILED")
        print("Please check the error messages above and try again")
    
    return migration_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
