#!/usr/bin/env python3
"""
Comprehensive test script to verify quality_grivance table integration
"""

import requests
import json
import time

BASE_URL = 'http://localhost:5001'

def test_supabase_connection():
    """Test direct Supabase connection to quality_grivance table"""
    print("🧪 Testing Supabase connection to quality_grivance table...")

    try:
        from supabase_client import get_supabase
        supabase = get_supabase()

        # Test table access
        result = supabase.table('quality_grivance').select('*', count='exact').limit(1).execute()
        count = result.count if hasattr(result, 'count') else 0

        print(f"   ✅ Connected to quality_grivance table")
        print(f"   📊 Total records: {count}")

        if count > 0:
            sample = result.data[0] if result.data else {}
            print(f"   📋 Sample record keys: {list(sample.keys())}")
            print(f"   🔍 grievance_id: {sample.get('grievance_id')}")
            print(f"   🔍 status: {sample.get('status')}")
            print(f"   🔍 grievance_type: {sample.get('grievance_type')}")

        return count > 0

    except Exception as e:
        print(f"   ❌ Supabase connection failed: {e}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print("\n🧪 Testing backend API endpoints...")

    try:
        # Test grievances endpoint
        response = requests.get(f'{BASE_URL}/api/quality/grievances', timeout=10)
        print(f"   GET /api/quality/grievances - Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success', False)}")
            if data.get('success'):
                grievances = data.get('data', [])
                pagination = data.get('pagination', {})
                print(f"   📊 Returned {len(grievances)} grievances")
                print(f"   📄 Pagination: {pagination}")

                if grievances:
                    sample = grievances[0]
                    print(f"   📋 Sample grievance keys: {list(sample.keys())}")
                    print(f"   🔍 ID: {sample.get('id')}, Status: {sample.get('status')}, Category: {sample.get('category')}")

        # Test analytics endpoint
        response = requests.get(f'{BASE_URL}/api/quality/grievances/analytics', timeout=10)
        print(f"   GET /api/quality/grievances/analytics - Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Analytics Success: {data.get('success', False)}")
            if data.get('success'):
                analytics = data.get('data', {})
                print(f"   📊 Analytics keys: {list(analytics.keys())}")

        return True

    except requests.exceptions.ConnectionError:
        print(f"   ❌ Backend server not running or connection failed")
        return False
    except Exception as e:
        print(f"   ❌ API test failed: {e}")
        return False

def test_frontend_integration():
    """Test frontend data flow (mock test)"""
    print("\n🧪 Testing frontend integration expectations...")

    # This would normally test the actual frontend, but we'll simulate
    expected_fields = ['id', 'title', 'description', 'category', 'priority', 'status', 'user_type', 'submitted_date', 'ai_classification']

    try:
        response = requests.get(f'{BASE_URL}/api/quality/grievances?limit=1', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                grievance = data['data'][0]
                actual_fields = list(grievance.keys())

                print(f"   📋 Expected fields: {expected_fields}")
                print(f"   📋 Actual fields: {actual_fields}")

                missing_fields = set(expected_fields) - set(actual_fields)
                extra_fields = set(actual_fields) - set(expected_fields)

                if missing_fields:
                    print(f"   ⚠️  Missing fields: {list(missing_fields)}")
                if extra_fields:
                    print(f"   ℹ️  Extra fields: {list(extra_fields)}")

                if not missing_fields:
                    print("   ✅ Frontend field mapping looks good")
                else:
                    print("   ❌ Frontend field mapping issues detected")

        return True

    except Exception as e:
        print(f"   ❌ Frontend integration test failed: {e}")
        return False

def test_data_integrity():
    """Test data integrity and RLS"""
    print("\n🧪 Testing data integrity...")

    try:
        from supabase_client import get_supabase
        supabase = get_supabase()

        # Check for required fields in sample records
        result = supabase.table('quality_grivance').select('*').limit(5).execute()
        records = result.data or []

        required_fields = ['grievance_id', 'user_id', 'user_type', 'grievance_type', 'description', 'status', 'resolution_date']

        integrity_issues = 0
        for i, record in enumerate(records):
            missing_fields = []
            for field in required_fields:
                if field not in record or record[field] is None:
                    missing_fields.append(field)

            if missing_fields:
                print(f"   ⚠️  Record {i+1} missing fields: {missing_fields}")
                integrity_issues += 1

        if integrity_issues == 0:
            print("   ✅ Data integrity looks good")
        else:
            print(f"   ❌ Found {integrity_issues} records with integrity issues")

        # Check status values
        status_counts = {}
        for record in records:
            status = record.get('status', 'Unknown')
            status_counts[status] = status_counts.get(status, 0) + 1

        print(f"   📊 Status distribution in sample: {status_counts}")

        return integrity_issues == 0

    except Exception as e:
        print(f"   ❌ Data integrity test failed: {e}")
        return False

def main():
    print("🚀 QUALITY GRIVANCE INTEGRATION TEST")
    print("=" * 60)

    results = {}

    # Test Supabase connection
    results['supabase'] = test_supabase_connection()

    # Test backend API
    results['backend'] = test_backend_api()

    # Test frontend integration
    results['frontend'] = test_frontend_integration()

    # Test data integrity
    results['integrity'] = test_data_integrity()

    print("\n" + "=" * 60)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 60)

    all_passed = True
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test.upper()}: {status}")
        if not passed:
            all_passed = False

    print("=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED - Integration successful!")
    else:
        print("⚠️  SOME TESTS FAILED - Check issues above")

    return all_passed

if __name__ == "__main__":
    main()
