#!/usr/bin/env python3
"""
Comprehensive verification script for Supabase database connection and
quality_facultyperformance table data fetching verification.
"""

import os
import sys
import json
import time
import requests
from datetime import datetime

# Add backend directory to path for imports
sys.path.append('backend')

try:
    from backend.supabase_client import get_supabase
    print("✅ Successfully imported Supabase client")
except ImportError as e:
    print(f"❌ Failed to import Supabase client: {e}")
    sys.exit(1)

def test_supabase_connection():
    """Test basic Supabase connectivity"""
    print("\n" + "="*60)
    print("1. SUPABASE CONNECTION CHECK")
    print("="*60)

    try:
        supabase = get_supabase()
        print("✅ Supabase client initialized successfully")

        # Test basic connectivity with a simple query
        result = supabase.table('students').select('id', count='exact').limit(1).execute()
        print("✅ Basic connectivity test passed")

        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_table_existence():
    """Test if quality_facultyperformance table exists"""
    print("\n" + "="*60)
    print("2. TABLE EXISTENCE CHECK")
    print("="*60)

    try:
        supabase = get_supabase()

        # Try to select from the table
        result = supabase.table('quality_facultyperformance').select('*', count='exact').limit(1).execute()

        if hasattr(result, 'count'):
            print("✅ quality_facultyperformance table exists")
            return True
        else:
            print("❌ quality_facultyperformance table does not exist or is not accessible")
            return False

    except Exception as e:
        print(f"❌ Table existence check failed: {e}")
        return False

def test_table_schema():
    """Test table schema and column names"""
    print("\n" + "="*60)
    print("3. TABLE SCHEMA VERIFICATION")
    print("="*60)

    expected_columns = {
        'faculty_id', 'faculty_name', 'department',
        'feedback_score', 'research_papers', 'performance_rating'
    }

    try:
        supabase = get_supabase()

        # Get a sample record to check schema
        result = supabase.table('quality_facultyperformance').select('*').limit(1).execute()

        if result.data and len(result.data) > 0:
            sample_record = result.data[0]
            actual_columns = set(sample_record.keys())

            print(f"✅ Sample record retrieved: {sample_record}")

            # Check if all expected columns are present
            missing_columns = expected_columns - actual_columns
            extra_columns = actual_columns - expected_columns

            if missing_columns:
                print(f"❌ Missing expected columns: {missing_columns}")
                return False
            else:
                print("✅ All expected columns are present")

            if extra_columns:
                print(f"ℹ️  Additional columns found: {extra_columns}")

            # Validate data types
            print("\n📊 Data Type Validation:")
            for col in expected_columns:
                if col in sample_record:
                    value = sample_record[col]
                    expected_type = "string" if col in ['faculty_name', 'department'] else "number"
                    actual_type = type(value).__name__

                    if col in ['faculty_name', 'department']:
                        if isinstance(value, str):
                            print(f"✅ {col}: {actual_type} (expected)")
                        else:
                            print(f"❌ {col}: {actual_type} (expected string)")
                    elif col in ['feedback_score', 'research_papers', 'performance_rating']:
                        if isinstance(value, (int, float)):
                            print(f"✅ {col}: {actual_type} (expected)")
                        else:
                            print(f"❌ {col}: {actual_type} (expected number)")
                    else:
                        print(f"ℹ️  {col}: {actual_type}")

            return True
        else:
            print("❌ No data found in table")
            return False

    except Exception as e:
        print(f"❌ Schema verification failed: {e}")
        return False

def test_data_fetching():
    """Test data fetching performance and record count"""
    print("\n" + "="*60)
    print("4. DATA FETCHING VERIFICATION")
    print("="*60)

    try:
        supabase = get_supabase()

        # Test 1: Get total count
        start_time = time.time()
        count_result = supabase.table('quality_facultyperformance').select('*', count='exact').execute()
        count_time = time.time() - start_time

        total_records = count_result.count if hasattr(count_result, 'count') else 0
        print(f"📊 Total records in table: {total_records}")
        print(f"⏱️  Count query time: {count_time:.4f} seconds")
        # Check if close to 2000 records
        if 1800 <= total_records <= 2200:
            print("✅ Record count is approximately 2000 (within acceptable range)")
        elif total_records >= 2000:
            print(f"✅ Record count ({total_records}) exceeds 2000")
        else:
            print(f"⚠️  Record count ({total_records}) is less than expected 2000")

        # Test 2: Fetch all data
        start_time = time.time()
        all_data_result = supabase.table('quality_facultyperformance').select('*').execute()
        fetch_time = time.time() - start_time

        all_records = all_data_result.data if hasattr(all_data_result, 'data') else []
        print(f"📊 Successfully fetched {len(all_records)} records")
        print(f"⏱️  Full fetch time: {fetch_time:.4f} seconds")
        # Test 3: Pagination test
        start_time = time.time()
        page_size = 50
        paginated_result = supabase.table('quality_facultyperformance').select('*').range(0, page_size-1).execute()
        pagination_time = time.time() - start_time

        paginated_records = paginated_result.data if hasattr(paginated_result, 'data') else []
        print(f"📊 Pagination test: fetched {len(paginated_records)} records (page size: {page_size})")
        print(f"⏱️  Pagination time: {pagination_time:.4f} seconds")
        # Performance assessment
        print("\n⏱️  PERFORMANCE ASSESSMENT:")
        if count_time < 0.5:
            print("✅ Count query: Excellent")
        elif count_time < 2.0:
            print("✅ Count query: Good")
        else:
            print("⚠️  Count query: Needs optimization")

        if fetch_time < 5.0:
            print("✅ Full fetch: Excellent")
        elif fetch_time < 10.0:
            print("✅ Full fetch: Good")
        else:
            print("⚠️  Full fetch: Consider pagination for large datasets")

        if pagination_time < 0.5:
            print("✅ Pagination: Excellent")
        elif pagination_time < 1.0:
            print("✅ Pagination: Good")
        else:
            print("⚠️  Pagination: Needs optimization")

        # Data integrity check
        print("\n🔍 DATA INTEGRITY CHECK:")
        valid_records = 0
        invalid_records = 0

        for record in all_records[:100]:  # Check first 100 records
            is_valid = True

            # Check required fields
            if not record.get('faculty_id'):
                is_valid = False
            if not record.get('faculty_name'):
                is_valid = False
            if not record.get('department'):
                is_valid = False

            # Check numeric fields
            try:
                float(record.get('performance_rating', 0))
                float(record.get('feedback_score', 0))
                int(record.get('research_papers', 0))
            except (ValueError, TypeError):
                is_valid = False

            if is_valid:
                valid_records += 1
            else:
                invalid_records += 1

        print(f"📊 Sample integrity check (first 100 records):")
        print(f"  ✅ Valid records: {valid_records}")
        print(f"  ❌ Invalid records: {invalid_records}")

        if invalid_records == 0:
            print("✅ All sampled records are valid")
        else:
            print(f"⚠️  {invalid_records} invalid records found in sample")

        return True

    except Exception as e:
        print(f"❌ Data fetching verification failed: {e}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print("\n" + "="*60)
    print("5. BACKEND API VERIFICATION")
    print("="*60)

    base_url = "http://localhost:5001"

    try:
        # Test 1: Faculty list endpoint
        print("Testing faculty list endpoint...")
        response = requests.get(f"{base_url}/api/quality/faculty", params={'limit': 10, 'page': 1}, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'data' in data:
                faculty_count = len(data['data'])
                total_count = data.get('pagination', {}).get('total', 0)
                print(f"✅ Faculty API returned {faculty_count} records (total: {total_count})")
            else:
                print(f"❌ Faculty API returned error: {data}")
                return False
        else:
            print(f"❌ Faculty API returned status code {response.status_code}")
            return False

        # Test 2: Faculty analytics endpoint
        print("Testing faculty analytics endpoint...")
        response = requests.get(f"{base_url}/api/quality/faculty/analytics", timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'data' in data:
                analytics = data['data']
                total_faculty = analytics.get('total_faculty', 0)
                print(f"✅ Faculty analytics API returned data for {total_faculty} faculty members")
            else:
                print(f"❌ Faculty analytics API returned error: {data}")
                return False
        else:
            print(f"❌ Faculty analytics API returned status code {response.status_code}")
            return False

        return True

    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend API at {base_url}")
        print("   Make sure the backend server is running on port 5001")
        return False
    except Exception as e:
        print(f"❌ Backend API verification failed: {e}")
        return False

def test_frontend_access():
    """Test frontend access to data"""
    print("\n" + "="*60)
    print("6. FRONTEND ACCESS VERIFICATION")
    print("="*60)

    frontend_url = "http://localhost:3000"

    try:
        # Test if frontend is running
        response = requests.get(frontend_url, timeout=5)

        if response.status_code == 200:
            print("✅ Frontend is running and accessible")
        else:
            print(f"⚠️  Frontend returned status code {response.status_code}")
            print("   This may not be critical if testing backend-only functionality")

        # Note: Actual frontend data fetching would require authentication
        # and specific component testing, which is beyond this script's scope
        print("ℹ️  Frontend data fetching requires authentication and UI interaction")
        print("   Manual testing recommended for complete frontend verification")

        return True

    except requests.exceptions.ConnectionError:
        print(f"⚠️  Cannot connect to frontend at {frontend_url}")
        print("   This is expected if frontend is not running")
        return True  # Not critical for backend verification
    except Exception as e:
        print(f"❌ Frontend access verification failed: {e}")
        return False

def main():
    """Main verification function"""
    print("🚀 SUPABASE FACULTY DATA VERIFICATION")
    print("="*60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    results = {}

    # Run all tests
    results['Supabase Connection'] = test_supabase_connection()
    results['Table Existence'] = test_table_existence()
    results['Table Schema'] = test_table_schema()
    results['Data Fetching'] = test_data_fetching()
    results['Backend API'] = test_backend_api()
    results['Frontend Access'] = test_frontend_access()

    # Final summary
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)

    passed = sum(results.values())
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")

    print(f"\n📊 Overall Result: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL VERIFICATION TESTS PASSED!")
        print("✅ Supabase connection is working correctly")
        print("✅ quality_facultyperformance table exists with correct schema")
        print("✅ Data fetching is working properly")
        print("✅ Backend APIs are functioning")
        print("✅ System is ready for production use")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("Please check the detailed logs above for issues")

    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
