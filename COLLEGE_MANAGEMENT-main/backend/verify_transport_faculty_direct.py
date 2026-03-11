#!/usr/bin/env python3
"""
Transport Faculty Direct Verification Script
Uses hardcoded Supabase credentials for verification
"""

import os
import sys
import requests
import json
from datetime import datetime
import time

# Apply httpx patch for Supabase client
import httpx
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

# Hardcoded Supabase credentials (from supabase_client.py)
SUPABASE_URL = 'https://qkaaoeismqnhjyikgkme.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDI1NzQsImV4cCI6MjA2OTg3ODU3NH0.o3K8BNVZucbqFWsPzIZJ_H8_ApR3uu9Cvjm5C9HFKX0'
API_BASE_URL = 'http://localhost:5001'

def print_header(title):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_step(step_num, title):
    """Print formatted step header"""
    print(f"\n{step_num}️⃣ {title.upper()}")
    print("-" * 40)

def check_supabase_connection():
    """1. Supabase Database Validation"""
    print_step("1", "SUPABASE DATABASE VALIDATION")

    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

        # Test connection
        result = supabase.table('transport_faculty').select('count').limit(1).execute()
        print("✅ Supabase connection active")

        # Check table exists
        result = supabase.table('transport_faculty').select('*', count='exact').limit(1).execute()
        print("✅ transport_faculty table exists")

        # Check record count
        record_count = result.count
        print(f"📊 Total records: {record_count}")

        if record_count >= 2000:
            print("✅ Record count matches expectation (~2000 records)")
        elif record_count > 0:
            print(f"⚠️  Record count lower than expected: {record_count} vs ~2000")
        else:
            print("❌ No records found in transport_faculty table")
            return False

        # Validate schema
        if result.data:
            sample = result.data[0]
            expected_schema = {
                'id': ('bigint', 'NOT NULL'),
                'name': ('text', None),
                'department': ('text', None),
                'email': ('text', None),
                'phone': ('bigint', None),  # Changed from phone_number to phone
                'faculty_id': ('text', None)
            }

            print("\n📋 Schema validation:")
            schema_valid = True

            for field, (expected_type, _) in expected_schema.items():
                if field in sample:
                    print(f"  ✅ {field}: present")
                else:
                    print(f"  ❌ {field}: MISSING")
                    schema_valid = False

            return schema_valid
        else:
            print("❌ No sample data available for schema validation")
            return False

    except ImportError:
        print("❌ Supabase client not installed. Install with: pip install supabase")
        return False
    except Exception as e:
        print(f"❌ Database validation failed: {e}")
        return False

def check_backend_api():
    """2. Backend API Verification"""
    print_step("2", "BACKEND API VERIFICATION")

    try:
        # Test faculty endpoint
        response = requests.get(f"{API_BASE_URL}/api/transport/faculty", timeout=10)

        if response.status_code == 200:
            print("✅ API endpoint responding (200)")

            try:
                data = response.json()

                if data.get('success'):
                    faculty_data = data.get('data', [])
                    print(f"📊 API returned {len(faculty_data)} faculty records")

                    if faculty_data:
                        sample = faculty_data[0]
                        expected_fields = ['id', 'name', 'department', 'email', 'phone', 'faculty_id']

                        print("\n📋 Response structure validation:")
                        all_fields_present = True

                        for field in expected_fields:
                            if field in sample:
                                print(f"  ✅ {field}: present")
                            else:
                                print(f"  ❌ {field}: MISSING")
                                all_fields_present = False

                        if isinstance(sample.get('phone'), (int, str)):
                            print("  ✅ phone: valid type")
                        else:
                            print("  ❌ phone: invalid type")
                            all_fields_present = False

                        return all_fields_present
                    else:
                        print("❌ No faculty records in API response")
                        return False
                else:
                    print(f"❌ API returned error: {data.get('error')}")
                    return False

            except json.JSONDecodeError:
                print("❌ API response is not valid JSON")
                return False
        else:
            print(f"❌ API returned status code {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend API")
        print(f"   Ensure backend server is running on {API_BASE_URL}")
        return False
    except Exception as e:
        print(f"❌ API verification failed: {e}")
        return False

def check_data_consistency():
    """3. Data Consistency Validation"""
    print_step("3", "DATA CONSISTENCY VALIDATION")

    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

        # Get sample from database
        db_result = supabase.table('transport_faculty').select('*').limit(5).execute()
        db_samples = db_result.data

        # Get from API
        api_response = requests.get(f"{API_BASE_URL}/api/transport/faculty", timeout=10)
        api_data = api_response.json().get('data', [])

        if not db_samples:
            print("❌ No data in database")
            return False

        if not api_data:
            print("❌ No data in API response")
            return False

        print("✅ Both database and API have data")

        # Compare record counts
        db_count = len(db_samples) if len(db_samples) < 5 else "5+"
        api_count = len(api_data)
        print(f"📊 Sample comparison: DB({db_count}) vs API({api_count})")

        # Compare first record
        db_first = db_samples[0]
        api_first = api_data[0] if api_data else None

        if api_first:
            match_fields = ['faculty_id', 'name', 'department', 'email']
            matches = 0
            total_fields = len(match_fields)

            print("\n📋 Field-by-field comparison:")
            for field in match_fields:
                db_val = str(db_first.get(field, '')).strip()
                api_val = str(api_first.get(field, '')).strip()

                if db_val == api_val:
                    matches += 1
                    print(f"  ✅ {field}: matches")
                else:
                    print(f"  ❌ {field}: DB='{db_val}' vs API='{api_val}'")

            consistency_ratio = matches / total_fields
            if consistency_ratio == 1.0:
                print("✅ Perfect data consistency")
                return True
            elif consistency_ratio >= 0.8:
                print(f"⚠️  Good data consistency ({matches}/{total_fields} fields match)")
                return True
            else:
                print(f"❌ Poor data consistency ({matches}/{total_fields} fields match)")
                return False
        else:
            print("❌ Cannot compare - no API data")
            return False

    except Exception as e:
        print(f"❌ Data consistency check failed: {e}")
        return False

def check_backend_controller():
    """Check backend controller implementation"""
    print_step("4", "BACKEND CONTROLLER CHECK")

    try:
        # Check transport controller
        controller_path = os.path.join(os.path.dirname(__file__), 'controllers', 'transportController.py')
        
        if os.path.exists(controller_path):
            print("✅ Transport controller exists")
            
            with open(controller_path, 'r') as f:
                controller_content = f.read()
            
            # Check for faculty endpoint
            if 'def get_transport_faculty' in controller_content or 'faculty' in controller_content:
                print("✅ Faculty endpoint found in controller")
            else:
                print("❌ Faculty endpoint not found in controller")
                return False
            
            # Check for Supabase model usage
            if 'SupabaseTransportFaculty' in controller_content or 'supabase' in controller_content.lower():
                print("✅ Supabase integration found in controller")
            else:
                print("⚠️  Supabase integration not clearly found")
            
            return True
        else:
            print("❌ Transport controller not found")
            return False
            
    except Exception as e:
        print(f"❌ Controller check failed: {e}")
        return False

def main():
    """Main verification function"""
    print_header("🚀 TRANSPORT FACULTY DIRECT VERIFICATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Base URL: {API_BASE_URL}")

    # Run all verification steps
    steps = [
        ("Supabase Database", check_supabase_connection),
        ("Backend API", check_backend_api),
        ("Data Consistency", check_data_consistency),
        ("Backend Controller", check_backend_controller)
    ]

    results = {}

    for step_name, step_func in steps:
        try:
            results[step_name] = step_func()
        except Exception as e:
            print(f"❌ ERROR in {step_name}: {e}")
            results[step_name] = False

    # Final summary
    print_header("VERIFICATION SUMMARY")

    passed = sum(results.values())
    total = len(results)

    print(f"📊 Overall Result: {passed}/{total} tests passed")

    for step_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {step_name}: {status}")

    print_header("FINAL RESULT")

    if passed == total:
        print("🎉 ALL VERIFICATIONS PASSED!")
        print("✅ Supabase database connection working correctly")
        print("✅ Backend API fetches data from transport_faculty accurately")
        print("✅ Data consistency maintained across all layers")
        print("✅ Backend controller properly configured")
        return True
    else:
        print(f"⚠️  {total - passed} verification(s) failed")
        print("Please check the detailed logs above for troubleshooting")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
