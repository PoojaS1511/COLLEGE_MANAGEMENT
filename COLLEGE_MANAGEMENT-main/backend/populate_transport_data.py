#!/usr/bin/env python3
"""
Comprehensive script to populate all transport tables with test data
Fixes attendance display and dashboard activities issues
"""

import os
import sys
import json
import random
from datetime import datetime, timedelta
from supabase_client import get_supabase

def get_supabase_client():
    """Get Supabase client"""
    return get_supabase()

def populate_transport_students():
    """Populate transport_students table with more data"""
    print("🚀 Populating transport_students table...")

    supabase = get_supabase_client()

    # Generate more students
    students = []
    routes = ['RT-01', 'RT-02', 'RT-03', 'RT-04', 'RT-05']
    pickup_points = ['College Campus', 'Stop A', 'Stop B', 'Stop C', 'Stop D', 'Stop E']

    for i in range(100, 2000):  # Add students from STU1100 to STU2999
        student = {
            'student_id': f'STU{i:04d}',
            'name': f'Student {i}',
            'email': f'student{i}@college.edu',
            'phone': f'98765{random.randint(10000, 99999)}',
            'address': f'{random.randint(1, 100)}, Street {random.randint(1, 20)}, City',
            'route_id': random.choice(routes),
            'route_name': f'Route {random.choice(routes).split("-")[1]}',
            'pickup_point': random.choice(pickup_points),
            'status': random.choice(['Active', 'Active', 'Active', 'Inactive']),  # 75% active
            'fee_status': random.choice(['Paid', 'Pending', 'Paid', 'Paid'])  # 75% paid
        }
        students.append(student)

    # Insert in batches
    batch_size = 50
    total_inserted = 0

    for i in range(0, len(students), batch_size):
        batch = students[i:i + batch_size]
        try:
            response = supabase.table('transport_students').insert(batch).execute()
            total_inserted += len(batch)
            print(f"✅ Inserted batch {i//batch_size + 1}: {len(batch)} students")
        except Exception as e:
            print(f"❌ Error inserting batch {i//batch_size + 1}: {e}")

    print(f"✅ Total students inserted: {total_inserted}")
    return total_inserted

def populate_transport_routes():
    """Populate transport_routes table with more data"""
    print("🚀 Populating transport_routes table...")

    supabase = get_supabase_client()

    routes = []
    route_names = [
        'North Campus Route', 'South Campus Route', 'East Campus Route',
        'West Campus Route', 'Central Campus Route', 'Main Highway Route',
        'Residential Route A', 'Residential Route B', 'Industrial Route',
        'Commercial Route'
    ]

    for i in range(6, 51):  # Add routes RT-06 to RT-50
        route = {
            'route_id': f'RT-{i:02d}',
            'route_name': f'{random.choice(route_names)} {i}',
            'stops': json.dumps([
                'College Campus',
                f'Stop {chr(65 + (i % 5))}',
                f'Stop {chr(66 + (i % 5))}',
                f'Stop {chr(67 + (i % 5))}',
                'Terminal'
            ]),
            'pickup_time': f'0{random.randint(6, 8)}:{random.randint(0, 59):02d}',
            'drop_time': f'1{random.randint(6, 8)}:{random.randint(0, 59):02d}',
            'total_students': random.randint(20, 100),
            'assigned_bus': f'BUS-{random.randint(1, 20):02d}',
            'assigned_driver': f'DRV-{random.randint(1, 15):03d}',
            'status': random.choice(['Active', 'Active', 'Active', 'Inactive'])
        }
        routes.append(route)

    # Insert routes
    try:
        response = supabase.table('transport_routes').insert(routes).execute()
        print(f"✅ Inserted {len(routes)} routes")
        return len(routes)
    except Exception as e:
        print(f"❌ Error inserting routes: {e}")
        return 0

def populate_transport_attendance():
    """Populate transport_attendance table with attendance data"""
    print("🚀 Populating transport_attendance table...")

    supabase = get_supabase_client()

    # Get students and routes for attendance
    try:
        students_response = supabase.table('transport_students').select('student_id, name, route_id').execute()
        students = students_response.data

        routes_response = supabase.table('transport_routes').select('route_id').execute()
        routes = routes_response.data

        if not students or not routes:
            print("❌ No students or routes found for attendance generation")
            return 0

        attendance_records = []
        entity_types = ['Student', 'Faculty']
        statuses = ['Present', 'Present', 'Present', 'Present', 'Absent']  # 80% present

        # Generate attendance for last 30 days
        for days_ago in range(30):
            attendance_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')

            # Student attendance
            for student in students[:50]:  # Limit to first 50 students for performance
                record = {
                    'date': attendance_date,
                    'entity_type': 'Student',
                    'entity_id': student['student_id'],
                    'entity_name': student['name'],
                    'route_id': student.get('route_id', 'RT-01'),
                    'bus_number': f'BUS-{random.randint(1, 20):02d}',
                    'status': random.choice(statuses),
                    'remarks': random.choice(['', 'Late arrival', 'Medical leave', ''])
                }
                attendance_records.append(record)

            # Faculty attendance (smaller number)
            for i in range(5):
                record = {
                    'date': attendance_date,
                    'entity_type': 'Faculty',
                    'entity_id': f'FAC{i:03d}',
                    'entity_name': f'Faculty Member {i}',
                    'route_id': random.choice(routes)['route_id'] if routes else 'RT-01',
                    'bus_number': f'BUS-{random.randint(1, 20):02d}',
                    'status': random.choice(statuses),
                    'remarks': ''
                }
                attendance_records.append(record)

        # Insert in batches
        batch_size = 100
        total_inserted = 0

        for i in range(0, len(attendance_records), batch_size):
            batch = attendance_records[i:i + batch_size]
            try:
                response = supabase.table('transport_attendance').insert(batch).execute()
                total_inserted += len(batch)
                print(f"✅ Inserted attendance batch {i//batch_size + 1}: {len(batch)} records")
            except Exception as e:
                print(f"❌ Error inserting attendance batch {i//batch_size + 1}: {e}")

        print(f"✅ Total attendance records inserted: {total_inserted}")
        return total_inserted

    except Exception as e:
        print(f"❌ Error populating attendance: {e}")
        return 0

def populate_transport_activities():
    """Populate transport_activities table for dashboard"""
    print("🚀 Populating transport_activities table...")

    supabase = get_supabase_client()

    activities = [
        ('attendance', 'Bus RT-12 marked attendance for 45 students', 'admin'),
        ('payment', 'Fee payment received from Student ID: STU1001', 'admin'),
        ('route', 'Route RT-05 updated with new stops', 'admin'),
        ('bus', 'Bus TN-09-AB-1234 maintenance completed', 'admin'),
        ('student', 'New student STU1050 added to transport system', 'admin'),
        ('faculty', 'Faculty member FAC001 route assignment updated', 'admin'),
        ('payment', 'Monthly fee collection completed for Route RT-03', 'admin'),
        ('route', 'New route RT-15 created for east campus', 'admin'),
        ('bus', 'Bus BUS-08 assigned to Route RT-10', 'admin'),
        ('attendance', 'Morning attendance marked for all routes', 'admin'),
        ('payment', 'Outstanding fees reminder sent to 25 students', 'admin'),
        ('route', 'Route RT-07 timing adjusted for traffic', 'admin'),
        ('bus', 'Driver change for Bus BUS-12', 'admin'),
        ('student', 'Transport allocation updated for 10 students', 'admin'),
        ('faculty', 'New faculty member added to Route RT-02', 'admin')
    ]

    activity_records = []
    for i, (activity_type, message, user_id) in enumerate(activities):
        # Create activities at different times today
        created_time = datetime.now() - timedelta(minutes=i*15)
        record = {
            'type': activity_type,
            'message': message,
            'user_id': user_id,
            'time': created_time.isoformat(),
            'metadata': json.dumps({'source': 'system', 'priority': 'normal'})
        }
        activity_records.append(record)

    try:
        response = supabase.table('transport_activities').insert(activity_records).execute()
        print(f"✅ Inserted {len(activity_records)} activity records")
        return len(activity_records)
    except Exception as e:
        print(f"❌ Error inserting activities: {e}")
        return 0

def populate_transport_fees():
    """Populate transport_fees table"""
    print("🚀 Populating transport_fees table...")

    supabase = get_supabase_client()

    try:
        students_response = supabase.table('transport_students').select('student_id, name, route_id').limit(100).execute()
        students = students_response.data

        if not students:
            print("❌ No students found for fee generation")
            return 0

        fee_records = []
        for student in students:
            fee_record = {
                'student_id': student['student_id'],
                'student_name': student['name'],
                'route_id': student.get('route_id', 'RT-01'),
                'amount': random.choice([2500, 3000, 2800, 3200]),
                'due_date': (datetime.now() + timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d'),
                'payment_status': random.choice(['Paid', 'Pending', 'Paid', 'Paid']),
                'payment_date': datetime.now().strftime('%Y-%m-%d') if random.random() > 0.3 else None,
                'payment_mode': random.choice(['Online', 'Cash', 'Bank Transfer']) if random.random() > 0.3 else None
            }
            fee_records.append(fee_record)

        response = supabase.table('transport_fees').insert(fee_records).execute()
        print(f"✅ Inserted {len(fee_records)} fee records")
        return len(fee_records)

    except Exception as e:
        print(f"❌ Error populating fees: {e}")
        return 0

def populate_transport_buses():
    """Populate transport_buses table"""
    print("🚀 Populating transport_buses table...")

    supabase = get_supabase_client()

    buses = []
    for i in range(6, 31):  # Add buses BUS-06 to BUS-30
        bus = {
            'bus_number': f'BUS-{i:02d}',
            'route_id': f'RT-{random.randint(1, 20):02d}',
            'route_name': f'Route {random.randint(1, 20)}',
            'capacity': random.randint(40, 60),
            'driver_id': f'DRV-{random.randint(1, 20):03d}',
            'driver_name': f'Driver {random.randint(1, 20)}',
            'status': random.choice(['Active', 'Active', 'Active', 'Maintenance']),
            'last_service': (datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%d'),
            'next_service': (datetime.now() + timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d')
        }
        buses.append(bus)

    try:
        response = supabase.table('transport_buses').insert(buses).execute()
        print(f"✅ Inserted {len(buses)} bus records")
        return len(buses)
    except Exception as e:
        print(f"❌ Error inserting buses: {e}")
        return 0

def populate_transport_drivers():
    """Populate transport_drivers table"""
    print("🚀 Populating transport_drivers table...")

    supabase = get_supabase_client()

    drivers = []
    for i in range(16, 31):  # Add drivers DRV-016 to DRV-030
        driver = {
            'driver_id': f'DRV-{i:03d}',
            'name': f'Driver {i}',
            'phone': f'98765{random.randint(10000, 99999)}',
            'license_number': f'TN{i:02d}AB{random.randint(100000, 999999)}',
            'license_expiry': (datetime.now() + timedelta(days=random.randint(180, 365))).strftime('%Y-%m-%d'),
            'blood_group': random.choice(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']),
            'emergency_contact': f'98765{random.randint(10000, 99999)}',
            'experience_years': random.randint(2, 15),
            'shift': random.choice(['Morning', 'Evening', 'Night']),
            'working_hours': f'{random.randint(8, 12)} hours',
            'assigned_bus': f'BUS-{random.randint(1, 30):02d}',
            'status': random.choice(['Active', 'Active', 'Active', 'On Leave'])
        }
        drivers.append(driver)

    try:
        response = supabase.table('transport_drivers').insert(drivers).execute()
        print(f"✅ Inserted {len(drivers)} driver records")
        return len(drivers)
    except Exception as e:
        print(f"❌ Error inserting drivers: {e}")
        return 0

def main():
    """Main function to populate all transport tables"""
    print("🚀 Starting comprehensive transport data population...")
    print("=" * 60)

    results = {}

    try:
        # Populate all tables
        results['students'] = populate_transport_students()
        results['routes'] = populate_transport_routes()
        results['attendance'] = populate_transport_attendance()
        results['activities'] = populate_transport_activities()
        results['fees'] = populate_transport_fees()
        results['buses'] = populate_transport_buses()
        results['drivers'] = populate_transport_drivers()

        print("\n" + "=" * 60)
        print("📊 POPULATION SUMMARY")
        print("=" * 60)

        for table, count in results.items():
            status = "✅" if count > 0 else "❌"
            print(f"{status} {table.capitalize()}: {count} records inserted")

        total_records = sum(results.values())
        print(f"\n🎉 Total records inserted: {total_records}")

        if total_records > 0:
            print("\n✅ Transport data population completed successfully!")
            print("The following issues should now be resolved:")
            print("- Attendance data will now display in transport modules")
            print("- Dashboard recent activities will show data")
            print("- All transport tables have sufficient test data")
            print("- Button functionality should work properly")
        else:
            print("\n❌ No data was inserted. Check the errors above.")

    except Exception as e:
        print(f"\n❌ Error during population: {e}")
        return False

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
