#!/usr/bin/env python3
"""
Test script to check quality policies API endpoints
"""

import requests
import json

BASE_URL = 'http://localhost:5001'

def test_policies_endpoint():
    """Test the policies endpoint"""
    try:
        print("🧪 Testing /api/quality/policies endpoint...")
        response = requests.get(f'{BASE_URL}/api/quality/policies', timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success') and data.get('data'):
                policies = data['data']
                pagination = data.get('pagination', {})
                print(f"   📊 Policies returned: {len(policies)}")
                print(f"   📄 Pagination: {pagination}")
                print(f"   📊 Total items: {pagination.get('totalItems', 0)}")

                if policies:
                    print("   📋 Sample policy:")
                    policy = policies[0]
                    print(f"      ID: {policy.get('id', 'N/A')}")
                    print(f"      Title: {policy.get('title', 'N/A')}")
                    print(f"      Department: {policy.get('department', 'N/A')}")
                    print(f"      Status: {policy.get('compliance_status', 'N/A')}")
            else:
                print("   ❌ No data returned")
                print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def test_policies_analytics():
    """Test the policies analytics endpoint"""
    try:
        print("\n🧪 Testing /api/quality/policies/analytics endpoint...")
        response = requests.get(f'{BASE_URL}/api/quality/policies/analytics', timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success') and data.get('data'):
                analytics = data['data']
                print("   📊 Analytics data:")
                print(f"      Compliance trends: {len(analytics.get('compliance_trends', []))}")
                print(f"      Upcoming deadlines: {len(analytics.get('upcoming_deadlines', []))}")
                print(f"      Policy compliance: {len(analytics.get('policy_compliance', []))}")
            else:
                print("   ❌ No analytics data returned")
                print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def test_policies_pagination():
    """Test pagination functionality"""
    try:
        print("\n🧪 Testing pagination (page=1, limit=5)...")
        response = requests.get(f'{BASE_URL}/api/quality/policies?page=1&limit=5', timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                policies = data['data']
                pagination = data.get('pagination', {})
                print(f"   📊 Policies on page 1: {len(policies)}")
                print(f"   📄 Current page: {pagination.get('currentPage', 'N/A')}")
                print(f"   📄 Total pages: {pagination.get('totalPages', 'N/A')}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def main():
    print("🚀 QUALITY POLICIES API TEST")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print("=" * 50)

    # Test policies endpoint
    test_policies_endpoint()

    # Test analytics endpoint
    test_policies_analytics()

    # Test pagination
    test_policies_pagination()

    print("\n" + "=" * 50)
    print("✅ Test completed")

if __name__ == "__main__":
    main()
