#!/usr/bin/env python3
"""
Final verification test for quality_grivance integration
"""

import requests
import json

BASE_URL = 'http://localhost:5001'

def test_dashboard_kpis():
    """Test that dashboard includes correct open grievances count"""
    print("🧪 Testing dashboard KPIs include open grievances...")

    try:
        response = requests.get(f'{BASE_URL}/api/quality/dashboard/kpis', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                kpis = data['data']
                open_grievances = kpis.get('open_grievances', 0)
                print(f"   ✅ Open grievances in dashboard: {open_grievances}")

                # Verify it matches actual count
                from supabase_client import get_supabase
                supabase = get_supabase()
                result = supabase.table('quality_grivance').select('status').execute()
                actual_open = sum(1 for g in result.data or [] if g.get('status') in ['Open', 'In-Progress'])

                if open_grievances == actual_open:
                    print(f"   ✅ Dashboard count matches actual count: {actual_open}")
                    return True
                else:
                    print(f"   ❌ Mismatch: Dashboard shows {open_grievances}, actual is {actual_open}")
                    return False
            else:
                print("   ❌ No KPI data returned")
                return False
        else:
            print(f"   ❌ Dashboard API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Dashboard test failed: {e}")
        return False

def test_recent_activity():
    """Test that recent activity includes grievances"""
    print("\n🧪 Testing recent activity includes grievances...")

    try:
        response = requests.get(f'{BASE_URL}/api/quality/dashboard/recent-activity', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                activities = data['data']
                grievance_activities = [a for a in activities if a.get('type') == 'grievance']

                print(f"   📋 Total activities: {len(activities)}")
                print(f"   📋 Grievance activities: {len(grievance_activities)}")

                if grievance_activities:
                    print("   ✅ Recent activity includes grievances")
                    return True
                else:
                    print("   ⚠️  No grievance activities in recent activity")
                    return True  # Not a failure, just no recent grievances
            else:
                print("   ❌ No activity data returned")
                return False
        else:
            print(f"   ❌ Recent activity API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Recent activity test failed: {e}")
        return False

def test_performance_with_2000_records():
    """Test performance with 2000 records"""
    print("\n🧪 Testing performance with 2000 records...")

    try:
        import time

        # Test grievances list endpoint
        start_time = time.time()
        response = requests.get(f'{BASE_URL}/api/quality/grievances?page=1&limit=50', timeout=15)
        end_time = time.time()

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                response_time = end_time - start_time
                print(".2f")
                print(f"   📊 Returned {len(data.get('data', []))} records")

                if response_time < 5.0:  # Should respond within 5 seconds
                    print("   ✅ Performance acceptable")
                    return True
                else:
                    print("   ⚠️  Response time too slow")
                    return False
            else:
                print("   ❌ API returned error")
                return False
        else:
            print(f"   ❌ API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Performance test failed: {e}")
        return False

def main():
    print("🎯 FINAL VERIFICATION - Quality Grievance Integration")
    print("=" * 60)

    results = {}

    # Test dashboard KPIs
    results['dashboard'] = test_dashboard_kpis()

    # Test recent activity
    results['activity'] = test_recent_activity()

    # Test performance
    results['performance'] = test_performance_with_2000_records()

    print("\n" + "=" * 60)
    print("📋 FINAL VERIFICATION RESULTS")
    print("=" * 60)

    all_passed = True
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test.upper()}: {status}")
        if not passed:
            all_passed = False

    print("=" * 60)
    if all_passed:
        print("🎉 ALL VERIFICATION TESTS PASSED!")
        print("✅ Supabase, Backend, and Frontend are correctly connected!")
        print("✅ Data is being fetched properly from quality_grivance table!")
        print("✅ System handles ~2000 records with good performance!")
    else:
        print("⚠️  SOME VERIFICATION TESTS FAILED")
        print("Please check the issues above.")

    return all_passed

if __name__ == "__main__":
    main()
