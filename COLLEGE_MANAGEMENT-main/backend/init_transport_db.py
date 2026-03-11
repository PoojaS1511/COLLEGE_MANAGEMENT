"""
Initialize Transport Database Tables
"""

import sqlite3
import os
from datetime import datetime, date, timedelta
import json
import random

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')

def create_transport_tables():
    """Create transport tables in the database"""
    conn = sqlite3.connect(DB_PATH)
    
    try:
        # Read and execute the SQL schema
        schema_path = os.path.join(os.path.dirname(__file__), 'create_transport_tables.sql')
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute all SQL statements
        conn.executescript(schema_sql)
        conn.commit()
        print("✓ Transport tables created successfully")
        
    except Exception as e:
        print(f"✗ Error creating transport tables: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def generate_mock_data():
    """Generate mock data for transport system"""
    conn = sqlite3.connect(DB_PATH)
    
    try:
        cursor = conn.cursor()
        
        # Generate mock routes first
        routes_data = []
        for i in range(1, 16):  # 15 routes
            stops = [
                {'name': f'Stop {i*3+1}', 'time': '07:30 AM'},
                {'name': f'Stop {i*3+2}', 'time': '07:45 AM'},
                {'name': f'Stop {i*3+3}', 'time': '08:00 AM'},
                {'name': 'College', 'time': '08:15 AM'}
            ]
            
            cursor.execute("""
                INSERT INTO routes 
                (route_id, route_name, stops, pickup_time, drop_time, total_students, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f'RT-{str(i).zfill(2)}',
                f'Route {i}',
                json.dumps(stops),
                '07:30 AM',
                '06:00 PM',
                random.randint(30, 50),
                'Active' if i % 10 != 0 else 'Inactive'
            ))
            routes_data.append(f'RT-{str(i).zfill(2)}')
        
        # Generate mock drivers
        drivers_data = []
        for i in range(1, 31):  # 30 drivers
            driver_id = f'DRV{str(i).zfill(3)}'
            cursor.execute("""
                INSERT INTO drivers 
                (driver_id, name, phone, license_number, license_expiry, blood_group,
                 emergency_contact, experience_years, shift, working_hours, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                driver_id,
                f'Driver {i}',
                f'+91 98765{str(43210 + i)[-5:]}',
                f'TN{123456789 + i}',
                (datetime.now() + timedelta(days=random.randint(30, 365))).strftime('%Y-%m-%d'),
                random.choice(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']),
                f'+91 98765{str(54321 + i)[-5:]}',
                random.randint(5, 25),
                random.choice(['Morning', 'Evening', 'Full Day']),
                '8 hours',
                'On Leave' if i % 15 == 0 else 'Active'
            ))
            drivers_data.append(driver_id)
        
        # Generate mock buses
        buses_data = []
        for i in range(1, 26):  # 25 buses
            bus_id = i
            route_id = random.choice(routes_data) if i <= 15 else None
            driver_id = random.choice(drivers_data) if i <= 25 else None
            
            cursor.execute("""
                INSERT INTO buses 
                (bus_number, route_id, route_name, capacity, driver_id, driver_name, status,
                 last_service, next_service)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f'TN-09-AB-{str(1234 + i).zfill(4)}',
                route_id,
                f'Route {route_id.split("-")[1]}' if route_id else None,
                random.choice([40, 45, 50, 55]),
                i,  # driver_id as integer
                f'Driver {i}' if i <= 30 else None,
                'Under Maintenance' if i % 8 == 0 else 'Inactive' if i % 10 == 0 else 'Active',
                (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d'),
                (datetime.now() + timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d')
            ))
            buses_data.append(bus_id)
        
        # Update some drivers with assigned buses
        for i in range(min(25, len(drivers_data))):
            cursor.execute("""
                UPDATE drivers SET assigned_bus = ? WHERE driver_id = ?
            """, (f'TN-09-AB-{str(1234 + i + 1).zfill(4)}', drivers_data[i]))
        
        # Generate mock transport students
        for i in range(1, 21):  # 20 students
            student_id = f'2024{str(i).zfill(3)}'
            route_id = random.choice(routes_data)
            
            cursor.execute("""
                INSERT INTO transport_students 
                (student_id, name, email, phone, address, route_id, route_name, 
                 pickup_point, status, fee_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                student_id,
                f'Student {i}',
                f'student{i}@college.edu',
                f'+91 98765{str(43210 + i)[-5:]}',
                f'{i}, Main Street, Chennai',
                route_id,
                f'Route {route_id.split("-")[1]}',
                f'Stop {random.randint(1, 8)}',
                'Inactive' if i % 10 == 0 else 'Active',
                'Pending' if i % 3 == 0 else 'Paid'
            ))
            
            # Create fee record for each student
            cursor.execute("""
                INSERT INTO transport_fees 
                (student_id, student_name, amount, due_date, payment_status, 
                 payment_date, payment_mode, route_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                student_id,
                f'Student {i}',
                2500,
                (datetime.now() + timedelta(days=random.randint(-30, 60))).strftime('%Y-%m-%d'),
                'Pending' if i % 3 == 0 else 'Paid' if i % 3 == 1 else 'Overdue',
                (datetime.now() - timedelta(days=random.randint(1, 10))).strftime('%Y-%m-%d') if i % 3 == 1 else None,
                random.choice(['Online', 'Cash', 'Cheque']) if i % 3 == 1 else None,
                route_id
            ))
        
        # Generate mock transport faculty
        departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE']
        for i in range(1, 16):  # 15 faculty
            faculty_id = f'FAC{str(i).zfill(3)}'
            route_id = random.choice(routes_data)
            
            cursor.execute("""
                INSERT INTO transport_faculty 
                (faculty_id, name, email, phone, department, route_id, route_name, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                faculty_id,
                f'Faculty {i}',
                f'faculty{i}@college.edu',
                f'+91 98765{str(43210 + i)[-5:]}',
                departments[i % len(departments)],
                route_id,
                f'Route {route_id.split("-")[1]}',
                'Inactive' if i % 12 == 0 else 'Active'
            ))
        
        # Generate mock attendance records for last 30 days
        for days_ago in range(30):
            attendance_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            # Student attendance
            for i in range(1, 21):
                student_id = f'2024{str(i).zfill(3)}'
                route_id = random.choice(routes_data)
                status = 'Absent' if random.randint(1, 20) == 1 else 'Present'
                
                cursor.execute("""
                    INSERT INTO transport_attendance 
                    (date, entity_type, entity_id, entity_name, route_id, bus_number, status, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    attendance_date,
                    'Student',
                    student_id,
                    f'Student {i}',
                    route_id,
                    f'TN-09-AB-{str(1234 + random.randint(1, 25)).zfill(4)}',
                    status,
                    'Absent without notice' if status == 'Absent' else ''
                ))
            
            # Faculty attendance
            for i in range(1, 16):
                faculty_id = f'FAC{str(i).zfill(3)}'
                route_id = random.choice(routes_data)
                status = 'Absent' if random.randint(1, 25) == 1 else 'Present'
                
                cursor.execute("""
                    INSERT INTO transport_attendance 
                    (date, entity_type, entity_id, entity_name, route_id, bus_number, status, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    attendance_date,
                    'Faculty',
                    faculty_id,
                    f'Faculty {i}',
                    route_id,
                    f'TN-09-AB-{str(1234 + random.randint(1, 25)).zfill(4)}',
                    status,
                    'Absent without notice' if status == 'Absent' else ''
                ))
        
        # Generate mock live locations
        for i in range(1, 16):  # 15 buses
            cursor.execute("""
                INSERT INTO live_locations 
                (bus_id, bus_number, route_id, latitude, longitude, speed, status, driver_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                i,
                f'TN-09-AB-{str(1234 + i).zfill(4)}',
                routes_data[i-1] if i <= len(routes_data) else None,
                13.0827 + (random.random() - 0.5) * 0.1,
                80.2707 + (random.random() - 0.5) * 0.1,
                random.randint(20, 60),
                'Stopped' if i % 10 == 0 else 'Moving',
                f'Driver {i}'
            ))
        
        # Generate mock transport activities
        activities = [
            ('attendance', 'Bus RT-12 marked attendance', 'admin'),
            ('payment', 'Fee payment received from Student ID: 2024001', 'admin'),
            ('route', 'Route RT-05 updated with new stops', 'admin'),
            ('bus', 'Bus TN-09-AB-1234 maintenance completed', 'admin'),
        ]
        
        for i, (activity_type, message, user_id) in enumerate(activities):
            cursor.execute("""
                INSERT INTO transport_activities 
                (type, message, user_id, time)
                VALUES (?, ?, ?, ?)
            """, (
                activity_type,
                message,
                user_id,
                datetime.now() - timedelta(minutes=i*15)
            ))
        
        conn.commit()
        print("✓ Mock data generated successfully")
        print(f"  - Routes: {len(routes_data)}")
        print(f"  - Drivers: {len(drivers_data)}")
        print(f"  - Buses: {len(buses_data)}")
        print(f"  - Students: 20")
        print(f"  - Faculty: 15")
        print(f"  - Attendance records: 1050")
        print(f"  - Fee records: 20")
        print(f"  - Live locations: 15")
        print(f"  - Activities: 4")
        
    except Exception as e:
        print(f"✗ Error generating mock data: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def main():
    """Main function to initialize transport system"""
    print("Initializing Transport Management System...")
    
    try:
        # Create tables
        create_transport_tables()
        
        # Generate mock data
        generate_mock_data()
        
        print("\n✓ Transport system initialized successfully!")
        print("\nAvailable endpoints:")
        print("  - GET /api/transport/dashboard/metrics")
        print("  - GET /api/transport/students")
        print("  - GET /api/transport/faculty")
        print("  - GET /api/transport/buses")
        print("  - GET /api/transport/drivers")
        print("  - GET /api/transport/routes")
        print("  - GET /api/transport/fees")
        print("  - GET /api/transport/attendance")
        print("  - GET /api/transport/live-locations")
        print("  - GET /api/transport/reports/<type>")
        print("  - GET /api/transport/health")
        print("  - GET /api/transport/info")
        
    except Exception as e:
        print(f"\n✗ Failed to initialize transport system: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
