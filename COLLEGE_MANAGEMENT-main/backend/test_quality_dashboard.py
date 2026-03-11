#!/usr/bin/env python3
"""
Test script to check quality dashboard API endpoints
"""

import requests
import json

BASE_URL = 'http://localhost:5001'

def test_dashboard_kpis():
    """Test the dashboard KPIs endpoint"""
    try:
        print("🧪 Testing /api/quality/dashboard/kpis endpoint...")
        response = requests.get(f'{BASE_URL}/api/quality/dashboard/kpis', timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success') and data.get('data'):
                kpis = data['data']
                print("   📊 KPIs found:")
                print(f"      Total Faculty: {kpis.get('total_faculty', 0)}")
                print(f"      Pending Audits: {kpis.get('pending_audits', 0)}")
                print(f"      Open Grievances: {kpis.get('open_grievances', 0)}")
                print(f"      Policy Compliance: {kpis.get('overall_policy_compliance_rate', 0)}%")
                print(f"      Accreditation Score: {kpis.get('accreditation_readiness_score', 0)}")
            else:
                print("   ❌ No data returned")
                print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def test_dashboard_activity():
    """Test the dashboard recent activity endpoint"""
    try:
        print("\n🧪 Testing /api/quality/dashboard/recent-activity endpoint...")
        response = requests.get(f'{BASE_URL}/api/quality/dashboard/recent-activity', timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success') and data.get('data'):
                activities = data['data']
                print(f"   📋 Recent activities: {len(activities)}")
                for i, activity in enumerate(activities[:3]):  # Show first 3
                    print(f"      {i+1}. {activity.get('type', 'unknown')}: {activity.get('title', 'no title')}")
            else:
                print("   ❌ No activity data returned")
                print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def main():
    print("🚀 QUALITY DASHBOARD API TEST")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print("=" * 50)

    # Test KPIs endpoint
    test_dashboard_kpis()

    # Test activity endpoint
    test_dashboard_activity()

    print("\n" + "=" * 50)
    print("✅ Test completed")

if __name__ == "__main__":
    main()
