#!/usr/bin/env python3
"""
Test script to verify quality_accreditation table data fetching and API endpoints
"""

import requests
import json
import time
from datetime import datetime

# API base URL
API_BASE_URL = "http://localhost:5001/api/quality"

def test_api_endpoints():
    """Test all accreditation API endpoints"""
    print("=" * 60)
    print("TESTING ACCREDITATION API ENDPOINTS")
    print("=" * 60)

    results = {}

    # Test 1: Get accreditation data
    print("\n1. Testing /accreditation endpoint...")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/accreditation", timeout=10)
        response_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                records = data['data']
                total_count = data['pagination']['totalItems']
                print(f"   ✅ SUCCESS: {len(records)} records returned, total: {total_count}")
                print(".2f")
                results['accreditation'] = True
            else:
                print(f"   ❌ FAILED: Invalid response format: {data}")
                results['accreditation'] = False
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results['accreditation'] = False
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results['accreditation'] = False

    # Test 2: Get readiness score
    print("\n2. Testing /accreditation/readiness endpoint...")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/accreditation/readiness", timeout=10)
        response_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                score_data = data['data']
                print(f"   ✅ SUCCESS: Readiness score: {score_data.get('overall_score', 'N/A')}")
                print(".2f")
                results['readiness'] = True
            else:
                print(f"   ❌ FAILED: Invalid response format: {data}")
                results['readiness'] = False
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results['readiness'] = False
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results['readiness'] = False

    # Test 3: Get analytics
    print("\n3. Testing /accreditation/analytics endpoint...")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/accreditation/analytics", timeout=10)
        response_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                analytics_data = data['data']
                print(f"   ✅ SUCCESS: Analytics data retrieved")
                print(".2f")
                results['analytics'] = True
            else:
                print(f"   ❌ FAILED: Invalid response format: {data}")
                results['analytics'] = False
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results['analytics'] = False
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results['analytics'] = False

    # Test 4: Get reports with pagination
    print("\n4. Testing /accreditation/reports endpoint...")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/accreditation/reports?page=1&limit=10", timeout=10)
        response_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                reports = data['data']
                pagination = data['pagination']
                print(f"   ✅ SUCCESS: {len(reports)} reports returned, total: {pagination['total']}")
                print(".2f")
                results['reports'] = True
            else:
                print(f"   ❌ FAILED: Invalid response format: {data}")
                results['reports'] = False
        else:
            print(f"   ❌ FAILED: HTTP {response.status_code}")
            results['reports'] = False
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        results['reports'] = False

    return results

def test_data_volume():
    """Test data volume and pagination"""
    print("\n" + "=" * 60)
    print("TESTING DATA VOLUME AND PAGINATION")
    print("=" * 60)

    try:
        # Test with small limit to get total count
        response = requests.get(f"{API_BASE_URL}/accreditation?limit=1", timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                total_count = data['pagination']['totalItems']
                print(f"📊 Total records in database: {total_count}")

                if total_count >= 2000:
                    print("✅ SUCCESS: Found 2000+ records as expected")
                    return total_count
                else:
                    print(f"⚠️  WARNING: Only {total_count} records found (expected ~2000)")
                    return total_count
            else:
                print(f"❌ FAILED: Invalid response format")
                return 0
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return 0
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return 0

def test_data_integrity():
    """Test data integrity by sampling records"""
    print("\n" + "=" * 60)
    print("TESTING DATA INTEGRITY")
    print("=" * 60)

    try:
        # Get first page of records
        response = requests.get(f"{API_BASE_URL}/accreditation?page=1&limit=10", timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                records = data['data']
                total_records = len(records)

                integrity_score = 100
                issues = []

                for i, record in enumerate(records):
                    # Check required fields
                    required_fields = ['id', 'body', 'program', 'status', 'valid_until', 'grade']
                    missing_fields = [field for field in required_fields if field not in record or record[field] is None]

                    if missing_fields:
                        integrity_score -= 10
                        issues.append(f"Record {i+1}: Missing fields {missing_fields}")

                    # Check grade validity
                    valid_grades = ['A+', 'A', 'B+', 'B']
                    if record.get('grade') and record['grade'] not in valid_grades:
                        integrity_score -= 5
                        issues.append(f"Record {i+1}: Invalid grade '{record['grade']}'")

                    # Check status validity
                    valid_statuses = ['completed', 'pending', 'in_progress']
                    if record.get('status') and record['status'] not in valid_statuses:
                        integrity_score -= 5
                        issues.append(f"Record {i+1}: Invalid status '{record['status']}'")

                print(f"📊 Sampled {total_records} records")
                print(f"📊 Data Integrity Score: {integrity_score}/100")

                if issues:
                    print("⚠️  Issues found:")
                    for issue in issues[:5]:  # Show first 5 issues
                        print(f"   - {issue}")
                    if len(issues) > 5:
                        print(f"   ... and {len(issues) - 5} more issues")

                if integrity_score >= 90:
                    print("✅ Data integrity: Excellent")
                elif integrity_score >= 70:
                    print("✅ Data integrity: Good")
                else:
                    print("⚠️  Data integrity: Needs improvement")

                return integrity_score >= 70
            else:
                print(f"❌ FAILED: Invalid response format")
                return False
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_performance():
    """Test API performance with large datasets"""
    print("\n" + "=" * 60)
    print("TESTING API PERFORMANCE")
    print("=" * 60)

    try:
        # Test different page sizes
        page_sizes = [10, 50, 100]
        results = {}

        for limit in page_sizes:
            print(f"\nTesting with page size {limit}...")
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}/accreditation?page=1&limit={limit}", timeout=15)
            response_time = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    record_count = len(data['data'])
                    print(f"   📊 Retrieved {record_count} records in {response_time:.2f}s")
                    results[limit] = response_time

                    if response_time < 2.0:
                        print("   ✅ Performance: Excellent")
                    elif response_time < 5.0:
                        print("   ✅ Performance: Good")
                    else:
                        print("   ⚠️  Performance: Needs optimization")
                else:
                    print(f"   ❌ Failed: Invalid response")
                    results[limit] = None
            else:
                print(f"   ❌ Failed: HTTP {response.status_code}")
                results[limit] = None

        # Summary
        successful_tests = sum(1 for t in results.values() if t is not None and t < 5.0)
        print(f"\n📈 Performance Summary: {successful_tests}/{len(page_sizes)} tests passed")

        return successful_tests >= len(page_sizes) * 0.8  # 80% success rate

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 QUALITY ACCREDITATION VERIFICATION")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Base URL: {API_BASE_URL}")

    results = {}

    # Test 1: API Endpoints
    results['API Endpoints'] = test_api_endpoints()

    # Test 2: Data Volume
    total_records = test_data_volume()
    results['Data Volume'] = total_records >= 2000

    # Test 3: Data Integrity
    results['Data Integrity'] = test_data_integrity()

    # Test 4: Performance
    results['Performance'] = test_performance()

    # Final summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)

    passed = 0
    total = len(results)

    for test_name, result in results.items():
        if isinstance(result, dict):
            # API endpoints test
            endpoint_passed = sum(result.values())
            endpoint_total = len(result)
            status = "✅ PASS" if endpoint_passed == endpoint_total else f"⚠️  PARTIAL ({endpoint_passed}/{endpoint_total})"
            print(f"{test_name}: {status}")
            if endpoint_passed == endpoint_total:
                passed += 1
        else:
            # Other tests
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
            if result:
                passed += 1

    print(f"\n📊 Overall Result: {passed}/{total} test categories passed")

    if passed == total:
        print("\n🎉 VERIFICATION COMPLETED SUCCESSFULLY!")
        print("✅ Supabase database connection: Working")
        print("✅ Backend API endpoints: All functional")
        print("✅ Data volume: 2000+ records confirmed")
        print("✅ Data integrity: High quality")
        print("✅ Performance: Within acceptable limits")
        print("✅ System ready for production use")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed or partially failed")
        print("Please review the detailed logs above for issues")

    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
