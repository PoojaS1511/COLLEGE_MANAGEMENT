#!/usr/bin/env python3
"""
Test Transport Students Data Fetching
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from supabase_client import get_supabase
import json

def test_transport_students():
    """Test transport_students table data fetching"""
    print("🚀 Testing Transport Students Data Fetching")
    print("=" * 60)

    try:
        # Get Supabase client
        supabase = get_supabase()
        print("✅ Supabase client initialized successfully")

        # Test 1: Check table exists and get record count
        print("\n📊 Testing transport_students table...")
        count_result = supabase.table('transport_students').select('id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
        print(f"📈 Total records in transport_students: {total_count}")

        if total_count >= 1500 and total_count <= 2500:
            print("✅ Record count is within expected range (~2000)")
        else:
            print(f"⚠️  Record count {total_count} is outside expected range (~2000)")

        # Test 2: Fetch sample data
        print("\n📝 Fetching sample data...")
        sample_result = supabase.table('transport_students').select('*').limit(5).execute()

        if sample_result.data:
            print("✅ Sample data fetched successfully")
            print("📋 Sample record structure:")
            for key, value in sample_result.data[0].items():
                print(f"   - {key}: {type(value).__name__} = {str(value)[:50]}...")
        else:
            print("⚠️  No sample data returned")

        # Test 3: Check schema matches expected
        print("\n🏗️  Verifying schema...")
        expected_columns = {
            'id', 'register_number', 'full_name', 'email', 'phone', 'gender',
            'department_id', 'course_id', 'year', 'quota', 'category',
            'hostel_required', 'transport_required', 'admission_year',
            'current_semester', 'father_name', 'mother_name', 'status', 'created_at'
        }

        if sample_result.data:
            actual_columns = set(sample_result.data[0].keys())
            missing_columns = expected_columns - actual_columns
            extra_columns = actual_columns - expected_columns

            if missing_columns:
                print(f"❌ Missing columns: {missing_columns}")
            if extra_columns:
                print(f"⚠️  Extra columns: {extra_columns}")

            if not missing_columns:
                print("✅ Schema matches expected structure")
            else:
                print("⚠️  Schema differences detected")

        # Test 4: Test filtering
        print("\n🔍 Testing filters...")
        active_students = supabase.table('transport_students').select('*').eq('status', 'active').execute()
        print(f"📊 Active students: {len(active_students.data)}")

        transport_students = supabase.table('transport_students').select('*').eq('transport_required', True).execute()
        print(f"🚌 Transport required: {len(transport_students.data)}")

        # Test 5: Test ordering
        print("\n📋 Testing ordering...")
        ordered_result = supabase.table('transport_students').select('full_name').order('full_name').limit(3).execute()
        if ordered_result.data:
            print("✅ Ordering works correctly")
            print(f"📝 First 3 students: {[s['full_name'] for s in ordered_result.data]}")

        return True

    except Exception as e:
        print(f"❌ Error testing transport_students: {str(e)}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print("\n🌐 Testing Backend API Endpoints")
    print("=" * 60)

    import requests

    API_BASE = 'http://localhost:5001/api/transport'

    endpoints = [
        '/health',
        '/students',
        '/dashboard/metrics'
    ]

    for endpoint in endpoints:
        try:
            print(f"\n🔍 Testing {endpoint}...")
            response = requests.get(f'{API_BASE}{endpoint}', timeout=10)

            if response.status_code == 200:
                print(f"✅ {endpoint}: HTTP {response.status_code}")

                # Check response content for students endpoint
                if endpoint == '/students':
                    data = response.json()
                    if 'data' in data:
                        student_count = len(data['data'])
                        print(f"📊 Students returned: {student_count}")
                        if student_count > 0:
                            print(f"📋 Sample student: {data['data'][0].get('full_name', 'N/A')}")
                    else:
                        print("⚠️  Unexpected response format")
            else:
                print(f"❌ {endpoint}: HTTP {response.status_code}")

        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint}: Connection failed - {str(e)}")
        except Exception as e:
            print(f"❌ {endpoint}: Error - {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Transport Students Verification")
    print("=" * 60)

    # Test Supabase connection and data
    success = test_transport_students()

    # Test backend API
    test_backend_api()

    print("\n" + "=" * 60)
    if success:
        print("✅ Transport students verification completed successfully")
    else:
        print("❌ Transport students verification failed")
