#!/usr/bin/env python3
"""
Test script to check if frontend can access policies API without authentication
"""

import requests
import json

BASE_URL = 'http://localhost:5001'

def test_policies_without_auth():
    """Test policies endpoint without authentication headers"""
    try:
        print("🧪 Testing /api/quality/policies without auth headers...")
        response = requests.get(f'{BASE_URL}/api/quality/policies', timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success') and data.get('data'):
                policies = data['data']
                pagination = data.get('pagination', {})
                print(f"   📊 Policies returned: {len(policies)}")
                print(f"   📄 Total items: {pagination.get('totalItems', 0)}")

                if policies:
                    print("   📋 Sample policy:")
                    policy = policies[0]
                    print(f"      ID: {policy.get('id', 'N/A')}")
                    print(f"      Title: {policy.get('title', 'N/A')}")
            else:
                print("   ❌ No data returned")
                print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def test_policies_with_empty_auth():
    """Test policies endpoint with empty auth headers"""
    try:
        print("\n🧪 Testing /api/quality/policies with empty auth headers...")
        headers = {
            'Content-Type': 'application/json',
            'Authorization': '',
            'X-Requested-With': 'XMLHttpRequest'
        }
        response = requests.get(f'{BASE_URL}/api/quality/policies', headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success') and data.get('data'):
                policies = data['data']
                print(f"   📊 Policies returned: {len(policies)}")
        else:
            print(f"   ❌ Error: {response.text}")

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

def main():
    print("🚀 FRONTEND ACCESS TEST")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print("=" * 50)

    # Test without auth headers
    test_policies_without_auth()

    # Test with empty auth headers
    test_policies_with_empty_auth()

    print("\n" + "=" * 50)
    print("✅ Test completed")

if __name__ == "__main__":
    main()
