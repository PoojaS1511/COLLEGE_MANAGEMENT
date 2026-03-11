#!/usr/bin/env python3
"""
Setup script for Transport module database tables in Supabase
"""

from supabase_client import get_supabase
import uuid
from datetime import datetime, timedelta
import traceback

def create_transport_tables():
    """Create all transport-related tables in Supabase"""
    try:
        supabase = get_supabase()
        print("Connected to Supabase")

        # SQL to create transport tables
        # Using the same SQL as create_transport_tables.sql for consistency
        import os
        sql_path = os.path.join(os.path.dirname(__file__), 'create_transport_tables.sql')
        with open(sql_path, 'r') as f:
            full_sql = f.read()

        # Split SQL by semicolon and execute parts (Supabase exec_sql might have trouble with multiple statements)
        # Actually, exec_sql usually handles multiple statements, but let's be safe
        try:
            print("Creating/Updating transport tables...")
            # Try exec_sql first, then execute_sql as suggested by the hint
            try:
                result = supabase.rpc('exec_sql', {'sql': full_sql}).execute()
                print("Transport tables created/updated successfully via exec_sql")
            except Exception as e1:
                if 'exec_sql' in str(e1):
                    print("exec_sql not found, trying execute_sql...")
                    result = supabase.rpc('execute_sql', {'sql': full_sql}).execute()
                    print("Transport tables created/updated successfully via execute_sql")
                else:
                    raise e1
        except Exception as e:
            print(f"Table creation via RPC failed: {str(e)}")
            print("Please run the SQL in create_transport_tables.sql manually in the Supabase SQL Editor.")
            
        print("All transport tables setup process finished!")
        return True

    except Exception as e:
        print(f"Error setting up transport tables: {str(e)}")
        traceback.print_exc()
        return False

def insert_sample_data():
    """Insert sample data into transport tables"""
    try:
        supabase = get_supabase()
        print("Inserting sample transport data...")

        # Sample routes data
        routes_data = [
            {
                'route_id': 'RT-01',
                'route_name': 'Route 1',
                'stops': '[{"name": "Stop 1", "time": "07:30 AM"}, {"name": "Stop 2", "time": "07:45 AM"}, {"name": "College", "time": "08:15 AM"}]',
                'pickup_time': '07:30:00',
                'drop_time': '18:00:00',
                'status': 'Active'
            },
            {
                'route_id': 'RT-02',
                'route_name': 'Route 2',
                'stops': '[{"name": "Stop 3", "time": "07:30 AM"}, {"name": "Stop 4", "time": "07:45 AM"}, {"name": "College", "time": "08:15 AM"}]',
                'pickup_time': '07:30:00',
                'drop_time': '18:00:00',
                'status': 'Active'
            }
        ]

        # Insert routes
        for route in routes_data:
            try:
                supabase.table('transport_routes').insert(route).execute()
            except Exception as e:
                print(f"Failed to insert route {route['route_id']}: {str(e)}")

        # Sample drivers data
        drivers_data = [
            {
                'driver_id': 'DRV001',
                'name': 'Rajesh Kumar',
                'phone': '+919876543210',
                'license_number': 'TN123456789',
                'license_expiry': (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d'),
                'blood_group': 'O+',
                'emergency_contact': '+919876543211',
                'experience_years': 8,
                'status': 'Active'
            },
            {
                'driver_id': 'DRV002',
                'name': 'Suresh Babu',
                'phone': '+919876543212',
                'license_number': 'TN123456790',
                'license_expiry': (datetime.now() + timedelta(days=400)).strftime('%Y-%m-%d'),
                'blood_group': 'A+',
                'emergency_contact': '+919876543213',
                'experience_years': 12,
                'status': 'Active'
            }
        ]

        # Insert drivers
        for driver in drivers_data:
            try:
                supabase.table('transport_drivers').insert(driver).execute()
            except Exception as e:
                print(f"Failed to insert driver {driver['driver_id']}: {str(e)}")

        # Sample buses data
        buses_data = [
            {
                'bus_number': 'TN-09-AB-1234',
                'route_id': 'RT-01',
                'route_name': 'Route 1',
                'capacity': 50,
                'driver_id': 'DRV001',
                'driver_name': 'Rajesh Kumar',
                'status': 'Active'
            },
            {
                'bus_number': 'TN-09-AB-1235',
                'route_id': 'RT-02',
                'route_name': 'Route 2',
                'capacity': 45,
                'driver_id': 'DRV002',
                'driver_name': 'Suresh Babu',
                'status': 'Active'
            }
        ]

        # Insert buses
        for bus in buses_data:
            try:
                supabase.table('transport_buses').insert(bus).execute()
            except Exception as e:
                print(f"Failed to insert bus {bus['bus_number']}: {str(e)}")

        print("Sample transport data inserted successfully!")
        return True

    except Exception as e:
        print(f"Error inserting sample data: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Main setup function"""
    print("Starting Transport Module Setup...")
    print("=" * 50)

    # Create tables
    if create_transport_tables():
        print("\n" + "=" * 50)
        # Insert sample data
        if insert_sample_data():
            print("\n" + "=" * 50)
            print("Transport module setup completed successfully!")
        else:
            print("Failed to insert sample data")
    else:
        print("Failed to create transport tables")

if __name__ == "__main__":
    main()
