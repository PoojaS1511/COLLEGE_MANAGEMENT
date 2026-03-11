#!/usr/bin/env python3
"""
Check and create missing transport tables in Supabase
"""

from supabase_client import get_supabase
import json

def check_tables():
    """Check existing tables and their structure"""
    supabase = get_supabase()

    try:
        # Get all tables
        response = supabase.table('information_schema.tables').select('table_name').eq('table_schema', 'public').execute()
        tables = [row['table_name'] for row in response.data]
        print('Existing tables:')
        for table in sorted(tables):
            print(f'  - {table}')

        # Check transport_students structure
        if 'transport_students' in tables:
            print('\ntransport_students columns:')
            response = supabase.table('information_schema.columns').select('column_name,data_type').eq('table_name', 'transport_students').execute()
            for col in response.data:
                print(f'  - {col["column_name"]} ({col["data_type"]})')

        # Check transport_faculty structure
        if 'transport_faculty' in tables:
            print('\ntransport_faculty columns:')
            response = supabase.table('information_schema.columns').select('column_name,data_type').eq('table_name', 'transport_faculty').execute()
            for col in response.data:
                print(f'  - {col["column_name"]} ({col["data_type"]})')

        return tables

    except Exception as e:
        print(f'Error checking tables: {e}')
        return []

def create_missing_tables():
    """Create missing transport tables"""
    supabase = get_supabase()

    try:
        # Get existing tables
        response = supabase.table('information_schema.tables').select('table_name').eq('table_schema', 'public').execute()
        existing_tables = [row['table_name'] for row in response.data]

        # Create buses table if missing
        if 'buses' not in existing_tables:
            print('Creating buses table...')
            # Use raw SQL to create table
            sql = """
            CREATE TABLE buses (
                id SERIAL PRIMARY KEY,
                bus_number VARCHAR(50) UNIQUE NOT NULL,
                route_id VARCHAR(20),
                route_name VARCHAR(100),
                capacity INTEGER NOT NULL,
                driver_id INTEGER,
                driver_name VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            """
            supabase.rpc('exec_sql', {'sql': sql})

        # Create drivers table if missing
        if 'drivers' not in existing_tables:
            print('Creating drivers table...')
            sql = """
            CREATE TABLE drivers (
                id SERIAL PRIMARY KEY,
                driver_id VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                license_number VARCHAR(50) UNIQUE NOT NULL,
                license_expiry DATE NOT NULL,
                blood_group VARCHAR(5),
                emergency_contact VARCHAR(15),
                experience_years INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            """
            supabase.rpc('exec_sql', {'sql': sql})

        # Create routes table if missing
        if 'routes' not in existing_tables:
            print('Creating routes table...')
            sql = """
            CREATE TABLE routes (
                id SERIAL PRIMARY KEY,
                route_id VARCHAR(20) UNIQUE NOT NULL,
                route_name VARCHAR(100) NOT NULL,
                stops JSONB,
                pickup_time TIME NOT NULL,
                drop_time TIME NOT NULL,
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            """
            supabase.rpc('exec_sql', {'sql': sql})

        # Create transport_faculty table if missing
        if 'transport_faculty' not in existing_tables:
            print('Creating transport_faculty table...')
            sql = """
            CREATE TABLE transport_faculty (
                id SERIAL PRIMARY KEY,
                faculty_id VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(15),
                department VARCHAR(50),
                route_id VARCHAR(20),
                route_name VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            """
            supabase.rpc('exec_sql', {'sql': sql})

        # Add missing columns to transport_students
        print('Checking transport_students columns...')
        response = supabase.table('information_schema.columns').select('column_name').eq('table_name', 'transport_students').execute()
        existing_columns = [col['column_name'] for col in response.data]

        missing_columns = []
        if 'address' not in existing_columns:
            missing_columns.append("ADD COLUMN address TEXT")
        if 'phone' not in existing_columns:
            missing_columns.append("ADD COLUMN phone VARCHAR(15)")
        if 'route_name' not in existing_columns:
            missing_columns.append("ADD COLUMN route_name VARCHAR(100)")
        if 'pickup_point' not in existing_columns:
            missing_columns.append("ADD COLUMN pickup_point VARCHAR(100)")

        if missing_columns:
            print('Adding missing columns to transport_students...')
            alter_sql = f"ALTER TABLE transport_students {', '.join(missing_columns)};"
            supabase.rpc('exec_sql', {'sql': alter_sql})

        # Add missing columns to transport_faculty
        if 'transport_faculty' in existing_tables:
            print('Checking transport_faculty columns...')
            response = supabase.table('information_schema.columns').select('column_name').eq('table_name', 'transport_faculty').execute()
            existing_columns = [col['column_name'] for col in response.data]

            missing_columns = []
            if 'phone' not in existing_columns:
                missing_columns.append("ADD COLUMN phone VARCHAR(15)")
            if 'route_name' not in existing_columns:
                missing_columns.append("ADD COLUMN route_name VARCHAR(100)")

            if missing_columns:
                print('Adding missing columns to transport_faculty...')
                alter_sql = f"ALTER TABLE transport_faculty {', '.join(missing_columns)};"
                supabase.rpc('exec_sql', {'sql': alter_sql})

        print('Database setup completed successfully!')

    except Exception as e:
        print(f'Error creating tables: {e}')

if __name__ == '__main__':
    print('Checking existing transport tables...')
    existing_tables = check_tables()
    print('\n' + '='*50)
    print('Creating missing tables and fixing schema...')
    create_missing_tables()
