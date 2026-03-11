#!/usr/bin/env python3
"""
Populate transport_students table with sample data
"""

from supabase_client import get_supabase
import uuid
from datetime import datetime

def populate_transport_students():
    """Populate transport_students table with sample data"""
    try:
        supabase = get_supabase()
        print("Connected to Supabase")

        # Sample student data
        students_data = [
            {
                'student_id': 'STU1001',
                'name': 'Aarav Sharma',
                'email': 'aarav.sharma@example.com',
                'phone': '+919876543211',
                'address': '123 Main Street, City',
                'route_id': 'RT-01',
                'route_name': 'Route 1',
                'pickup_point': 'Stop A',
                'status': 'Active',
                'fee_status': 'Paid'
            },
            {
                'student_id': 'STU1002',
                'name': 'Priya Patel',
                'email': 'priya.patel@example.com',
                'phone': '+919876543212',
                'address': '456 Oak Avenue, City',
                'route_id': 'RT-01',
                'route_name': 'Route 1',
                'pickup_point': 'Stop B',
                'status': 'Active',
                'fee_status': 'Paid'
            },
            {
                'student_id': 'STU1003',
                'name': 'Rohan Kumar',
                'email': 'rohan.kumar@example.com',
                'phone': '+919876543213',
                'address': '789 Pine Road, City',
                'route_id': 'RT-02',
                'route_name': 'Route 2',
                'pickup_point': 'Stop C',
                'status': 'Active',
                'fee_status': 'Pending'
            },
            {
                'student_id': 'STU1004',
                'name': 'Sneha Reddy',
                'email': 'sneha.reddy@example.com',
                'phone': '+919876543214',
                'address': '321 Elm Street, City',
                'route_id': 'RT-02',
                'route_name': 'Route 2',
                'pickup_point': 'Stop D',
                'status': 'Active',
                'fee_status': 'Paid'
            },
            {
                'student_id': 'STU1005',
                'name': 'Vikram Singh',
                'email': 'vikram.singh@example.com',
                'phone': '+919876543215',
                'address': '654 Maple Lane, City',
                'route_id': 'RT-01',
                'route_name': 'Route 1',
                'pickup_point': 'Stop A',
                'status': 'Active',
                'fee_status': 'Paid'
            }
        ]

        # Insert students
        inserted_count = 0
        for student in students_data:
            try:
                # Check if student already exists
                existing = supabase.table('transport_students').select('student_id').eq('student_id', student['student_id']).execute()
                if existing.data:
                    print(f"Student {student['student_id']} already exists, skipping...")
                    continue

                supabase.table('transport_students').insert(student).execute()
                inserted_count += 1
                print(f"Inserted student: {student['name']}")
            except Exception as e:
                print(f"Failed to insert student {student['student_id']}: {str(e)}")

        print(f"\nSuccessfully inserted {inserted_count} students")

        # Verify the data
        result = supabase.table('transport_students').select('*').execute()
        print(f"Total students in database: {len(result.data)}")

        return True

    except Exception as e:
        print(f"Error populating transport students: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Populating transport_students table...")
    success = populate_transport_students()
    if success:
        print("✅ Transport students populated successfully!")
    else:
        print("❌ Failed to populate transport students")
