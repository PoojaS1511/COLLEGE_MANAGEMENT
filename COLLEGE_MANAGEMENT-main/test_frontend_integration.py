#!/usr/bin/env python3
"""
Test Frontend Integration with Supabase transport_students data
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import requests
import json
import os
from supabase_client import get_supabase
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:5001/api')

def test_supabase_data_structure():
    """Test Supabase data structure matches expected columns"""
    print("🔍 Testing Supabase Data Structure...")
    
    try:
        supabase = get_supabase()
        
        # Get sample data
        result = supabase.table('transport_students').select('*').limit(3).execute()
        
        if result.data:
            print("✅ Supabase data fetched successfully")
            
            # Expected columns
            expected_columns = {
                'id', 'register_number', 'full_name', 'email', 'phone', 'gender',
                'department_id', 'course_id', 'year', 'quota', 'category',
                'hostel_required', 'transport_required', 'admission_year',
                'current_semester', 'father_name', 'mother_name', 'status', 'created_at'
            }
            
            # Check first record structure
            sample_record = result.data[0]
            actual_columns = set(sample_record.keys())
            
            print(f"\n📊 Expected columns: {len(expected_columns)}")
            print(f"📊 Actual columns: {len(actual_columns)}")
            
            missing_columns = expected_columns - actual_columns
            extra_columns = actual_columns - expected_columns
            
            if missing_columns:
                print(f"❌ Missing columns: {missing_columns}")
            if extra_columns:
                print(f"⚠️  Extra columns: {extra_columns}")
            
            if not missing_columns and not extra_columns:
                print("✅ Column structure matches perfectly!")
            
            # Display sample data
            print(f"\n📋 Sample record structure:")
            for col in sorted(expected_columns):
                value = sample_record.get(col, 'N/A')
                print(f"   - {col}: {type(value).__name__} = {str(value)[:30]}...")
            
            return True
        else:
            print("❌ No data returned from Supabase")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Supabase data: {str(e)}")
        return False

def test_backend_api_data():
    """Test backend API returns correct data structure"""
    print("\n🔍 Testing Backend API Data...")
    
    try:
        # Test backend API endpoint
        response = requests.get(f'{API_BASE}/transport/students', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('data'):
                print("✅ Backend API returned successful response")
                print(f"📊 Total students: {len(data['data'])}")
                
                if data['data']:
                    sample_student = data['data'][0]
                    print(f"\n📋 Backend API sample record:")
                    for key, value in sample_student.items():
                        print(f"   - {key}: {type(value).__name__} = {str(value)[:30]}...")
                
                return True
            else:
                print(f"❌ Backend API returned error: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Backend API returned status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend API (is it running?)")
        return False
    except Exception as e:
        print(f"❌ Error testing backend API: {str(e)}")
        return False

def test_data_consistency():
    """Test data consistency between Supabase and Backend API"""
    print("\n🔍 Testing Data Consistency...")
    
    try:
        # Get data from Supabase directly
        supabase = get_supabase()
        supabase_result = supabase.table('transport_students').select('*').limit(5).execute()
        
        # Get data from Backend API
        api_response = requests.get(f'{API_BASE}/transport/students', timeout=10)
        
        if supabase_result.data and api_response.status_code == 200:
            api_data = api_response.json()
            
            if api_data.get('success') and api_data.get('data'):
                supabase_sample = supabase_result.data[0]
                api_sample = api_data['data'][0]
                
                print("📊 Comparing first record from both sources:")
                
                # Compare key fields
                key_fields = ['id', 'register_number', 'full_name', 'email', 'phone', 'status']
                all_match = True
                
                for field in key_fields:
                    supabase_val = supabase_sample.get(field)
                    api_val = api_sample.get(field)
                    match = supabase_val == api_val
                    status = "✅" if match else "❌"
                    print(f"   {status} {field}: Supabase='{supabase_val}' vs API='{api_val}'")
                    if not match:
                        all_match = False
                
                if all_match:
                    print("✅ Data consistency verified!")
                else:
                    print("⚠️  Data inconsistencies detected!")
                
                return all_match
            else:
                print("❌ API data not available for comparison")
                return False
        else:
            print("❌ Cannot compare data (missing from one or both sources)")
            return False
            
    except Exception as e:
        print(f"❌ Error testing data consistency: {str(e)}")
        return False

def test_frontend_column_mapping():
    """Test frontend column mapping matches backend data"""
    print("\n🔍 Testing Frontend Column Mapping...")
    
    # Expected frontend columns based on updated component
    frontend_columns = [
        'id', 'register_number', 'full_name', 'email', 'phone', 'gender',
        'department_id', 'course_id', 'year', 'quota', 'category',
        'hostel_required', 'transport_required', 'admission_year',
        'current_semester', 'father_name', 'mother_name', 'status'
    ]
    
    try:
        # Get backend API data
        response = requests.get(f'{API_BASE}/transport/students', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('data'):
                sample_student = data['data'][0]
                
                print("📊 Frontend column mapping verification:")
                all_columns_exist = True
                
                for col in frontend_columns:
                    exists = col in sample_student
                    status = "✅" if exists else "❌"
                    value = sample_student.get(col, 'MISSING')
                    print(f"   {status} {col}: {str(value)[:20]}...")
                    if not exists:
                        all_columns_exist = False
                
                if all_columns_exist:
                    print("✅ All frontend columns are available in backend data!")
                else:
                    print("⚠️  Some frontend columns are missing from backend data!")
                
                return all_columns_exist
            else:
                print("❌ Backend API data not available")
                return False
        else:
            print("❌ Cannot connect to backend API")
            return False
            
    except Exception as e:
        print(f"❌ Error testing frontend column mapping: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Frontend Integration Verification")
    print("=" * 60)
    
    # Run all tests
    tests = [
        ("Supabase Data Structure", test_supabase_data_structure),
        ("Backend API Data", test_backend_api_data),
        ("Data Consistency", test_data_consistency),
        ("Frontend Column Mapping", test_frontend_column_mapping),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        results[test_name] = test_func()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY:")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All integration tests passed! Frontend should work correctly.")
    else:
        print("⚠️  Some issues detected. Please review the failed tests.")
    
    print("\n" + "=" * 60)
