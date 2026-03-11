"""
Create transport_routes table with the exact schema specified in requirements
"""

import sqlite3
import os
import uuid
from datetime import datetime

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')

def create_transport_routes_table():
    """Create transport_routes table with exact schema"""
    print("Creating transport_routes table with specified schema...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Drop existing table if it exists
        cursor.execute("DROP TABLE IF EXISTS transport_routes")
        
        # Create table with exact schema from requirements
        cursor.execute("""
            CREATE TABLE transport_routes (
                id BIGINT PRIMARY KEY,
                bus_name TEXT NOT NULL,
                route TEXT NOT NULL,
                capacity BIGINT NOT NULL,
                driver_name TEXT NOT NULL,
                faculty_id TEXT
            )
        """)
        
        print("✅ transport_routes table created successfully")
        
        # Create sample data with ~2000 records
        print("Creating sample data (~2000 records)...")
        sample_data = []
        
        bus_names = [f"Bus-{i:03d}" for i in range(1, 51)]  # 50 different buses
        routes = [f"Route-{chr(65+i//26)}{chr(65+i%26)}-{i%15+1:02d}" for i in range(1, 101)]  # 100 different routes
        driver_names = [f"Driver-{i:03d}" for i in range(1, 201)]  # 200 different drivers
        
        for i in range(1, 2001):  # Create 2000 records
            record = {
                'id': i,
                'bus_name': bus_names[i % len(bus_names)],
                'route': routes[i % len(routes)],
                'capacity': 40 + (i % 21),  # Capacity between 40-60
                'driver_name': driver_names[i % len(driver_names)],
                'faculty_id': f"faculty_{uuid.uuid4().hex[:8]}" if i % 3 == 0 else None  # Some records have faculty_id
            }
            sample_data.append(record)
        
        # Insert all records
        cursor.executemany("""
            INSERT INTO transport_routes (id, bus_name, route, capacity, driver_name, faculty_id)
            VALUES (:id, :bus_name, :route, :capacity, :driver_name, :faculty_id)
        """, sample_data)
        
        conn.commit()
        print(f"✅ Created {len(sample_data)} sample records in transport_routes table")
        
        # Verify the data
        cursor.execute("SELECT COUNT(*) FROM transport_routes")
        count = cursor.fetchone()[0]
        print(f"📊 Total records in transport_routes: {count}")
        
        # Show sample records
        cursor.execute("SELECT * FROM transport_routes LIMIT 5")
        samples = cursor.fetchall()
        
        print("\n📝 Sample records:")
        for i, record in enumerate(samples, 1):
            print(f"  {i}: {record}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ ERROR: Failed to create transport_routes table: {e}")
        return False

def verify_table_structure():
    """Verify the table structure matches requirements"""
    print("\nVerifying table structure...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get table structure
        cursor.execute("PRAGMA table_info(transport_routes)")
        columns = cursor.fetchall()
        
        expected_columns = {
            'id': 'BIGINT',
            'bus_name': 'TEXT', 
            'route': 'TEXT',
            'capacity': 'BIGINT',
            'driver_name': 'TEXT',
            'faculty_id': 'TEXT'
        }
        
        print("\n📋 Table Structure Verification:")
        all_match = True
        
        for col in columns:
            col_name = col[1]
            col_type = col[2]
            expected_type = expected_columns.get(col_name)
            
            if expected_type:
                # Check if type matches (allowing for SQLite type variations)
                type_match = (
                    (expected_type == 'BIGINT' and 'INT' in col_type.upper()) or
                    (expected_type == 'TEXT' and 'TEXT' in col_type.upper())
                )
                status = "✅" if type_match else "❌"
                print(f"  - {col_name} ({col_type}) expected ({expected_type}) {status}")
                if not type_match:
                    all_match = False
            else:
                print(f"  - {col_name} ({col_type}) ⚠️  Unexpected column")
                all_match = False
        
        conn.close()
        return all_match
        
    except Exception as e:
        print(f"❌ ERROR: Failed to verify table structure: {e}")
        return False

def main():
    """Main function"""
    print("🚌 TRANSPORT_ROUTES TABLE SETUP")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create table
    if create_transport_routes_table():
        # Verify structure
        if verify_table_structure():
            print("\n🎉 SUCCESS: transport_routes table created and verified!")
            print("✅ Table structure matches requirements exactly")
            print("✅ Sample data (~2000 records) created successfully")
            print("✅ Ready for backend API and frontend integration")
        else:
            print("\n⚠️  WARNING: Table created but structure verification failed")
    else:
        print("\n❌ FAILED: Could not create transport_routes table")

if __name__ == "__main__":
    main()
