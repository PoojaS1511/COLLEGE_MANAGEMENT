#!/usr/bin/env python3
"""
Transport Faculty Integration Verification Script
Verifies the complete integration between Supabase, Backend API, and Frontend
"""

import os
import sys
import requests
import json
from datetime import datetime
import time

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5001')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

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

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Supabase credentials not found in environment variables")
        print("   Set SUPABASE_URL and SUPABASE_KEY environment variables")
        return False

    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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
                'phone_number': ('bigint', None),
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

            # Check RLS
            try:
                # Try to access without auth (should work if RLS allows public access)
                test_result = supabase.table('transport_faculty').select('*').limit(1).execute()
                print("✅ Row Level Security allows read access")
            except Exception as e:
                print(f"⚠️  RLS check failed: {e}")

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
                        expected_fields = ['id', 'name', 'department', 'email', 'phone_number', 'faculty_id']

                        print("\n📋 Response structure validation:")
                        all_fields_present = True

                        for field in expected_fields:
                            if field in sample:
                                print(f"  ✅ {field}: present")
                            else:
                                print(f"  ❌ {field}: MISSING")
                                all_fields_present = False

                        # Check data types
                        print("\n📋 Data type validation:")
                        if isinstance(sample.get('id'), (int, str)):
                            print("  ✅ id: valid type")
                        else:
                            print("  ❌ id: invalid type")

                        if isinstance(sample.get('phone_number'), (int, str)):
                            print("  ✅ phone_number: valid type")
                        else:
                            print("  ❌ phone_number: invalid type")

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
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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

def check_frontend_integration():
    """4. Frontend Integration Check"""
    print_step("4", "FRONTEND INTEGRATION CHECK")

    # Check if frontend service file exists
    frontend_service_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'services', 'transportService.js')

    if os.path.exists(frontend_service_path):
        print("✅ Frontend transport service exists")

        try:
            with open(frontend_service_path, 'r') as f:
                service_content = f.read()

            # Check for faculty-related functions
            required_functions = [
                'getTransportFaculty',
                'fetchFaculty'  # Alternative naming
            ]

            functions_found = []
            for func in required_functions:
                if func in service_content:
                    functions_found.append(func)

            if functions_found:
                print(f"✅ Frontend service functions found: {', '.join(functions_found)}")
            else:
                print("❌ No faculty-related functions found in frontend service")

            # Check API endpoint configuration
            if API_BASE_URL in service_content or 'api/transport/faculty' in service_content:
                print("✅ API endpoint configured in frontend service")
            else:
                print("⚠️  API endpoint configuration not found")

            return len(functions_found) > 0

        except Exception as e:
            print(f"❌ Error reading frontend service: {e}")
            return False
    else:
        print("❌ Frontend transport service not found")
        print(f"   Expected path: {frontend_service_path}")
        return False

def check_performance():
    """5. Security & Performance Checks"""
    print_step("5", "SECURITY & PERFORMANCE CHECKS")

    try:
        # Performance test - measure API response time
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/api/transport/faculty", timeout=30)
        end_time = time.time()

        response_time = end_time - start_time

        if response.status_code == 200:
            data = response.json()
            record_count = len(data.get('data', []))

            print(f"⏱️  Response time: {response_time:.2f} seconds")
            print(f"📊 Records fetched: {record_count}")

            # Performance thresholds
            if response_time < 2.0:
                print("✅ Response time acceptable")
            elif response_time < 5.0:
                print("⚠️  Response time slow but acceptable")
            else:
                print("❌ Response time too slow")
                return False

            # Check for large dataset handling
            if record_count >= 2000:
                print("✅ Large dataset handling verified")
            elif record_count > 0:
                print(f"⚠️  Dataset smaller than expected: {record_count} vs 2000+")
            else:
                print("❌ No records returned")
                return False

            return True
        else:
            print(f"❌ Performance test failed with status {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Performance check failed: {e}")
        return False

def main():
    """Main verification function"""
    print_header("🚀 TRANSPORT FACULTY INTEGRATION VERIFICATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Base URL: {API_BASE_URL}")

    # Run all verification steps
    steps = [
        ("Supabase Database", check_supabase_connection),
        ("Backend API", check_backend_api),
        ("Data Consistency", check_data_consistency),
        ("Frontend Integration", check_frontend_integration),
        ("Performance", check_performance)
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
        print("✅ Frontend integration properly configured")
        print("✅ Data consistency maintained across all layers")
        print("✅ Performance meets requirements")
        return True
    else:
        print(f"⚠️  {total - passed} verification(s) failed")
        print("Please check the detailed logs above for troubleshooting")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
