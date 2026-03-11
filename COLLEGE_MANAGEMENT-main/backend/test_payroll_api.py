"""
Test script for payroll API endpoints
Tests the payroll list and payslip generation endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
from datetime import datetime

def test_payroll_api():
    """Test payroll API endpoints"""
    base_url = "http://localhost:5001"

    print("🧪 Testing Payroll API Endpoints")
    print("=" * 50)

    try:
        # Test 1: Get approved payroll records
        print("\n📋 Test 1: Getting approved payroll records...")
        response = requests.get(f"{base_url}/api/payroll/?status=Approved&limit=5")

        if response.status_code != 200:
            print(f"❌ Failed to get payroll records: {response.status_code}")
            print(f"Response: {response.text}")
            return False

        payroll_data = response.json()
        if not payroll_data.get('success', False):
            print(f"❌ API returned error: {payroll_data}")
            return False

        records = payroll_data.get('data', [])
        print(f"✅ Found {len(records)} approved payroll records")

        if not records:
            print("❌ No approved payroll records found!")
            return False

        # Show first record details
        first_record = records[0]
        print(f"📊 Sample Record - ID: {first_record['id']}, Faculty: {first_record.get('faculty_id', 'N/A')}, Status: {first_record.get('status', 'N/A')}")

        # Test 2: Get specific payroll record
        payroll_id = first_record['id']
        print(f"\n📋 Test 2: Getting specific payroll record (ID: {payroll_id})...")
        detail_response = requests.get(f"{base_url}/api/payroll/{payroll_id}")

        if detail_response.status_code != 200:
            print(f"❌ Failed to get payroll detail: {detail_response.status_code}")
            print(f"Response: {detail_response.text}")
            return False

        detail_data = detail_response.json()
        if not detail_data.get('success', False):
            print(f"❌ Detail API returned error: {detail_data}")
            return False

        print("✅ Payroll detail retrieved successfully")

        # Test 3: Generate payslip
        print(f"\n🧾 Test 3: Generating payslip for payroll ID: {payroll_id}...")
        payslip_response = requests.get(f"{base_url}/api/payroll/payslip/{payroll_id}")

        if payslip_response.status_code != 200:
            print(f"❌ Payslip generation failed: {payslip_response.status_code}")
            print(f"Response: {payslip_response.text}")
            return False

        payslip_data = payslip_response.json()
        if not payslip_data.get('success', False):
            print(f"❌ Payslip API returned error: {payslip_data}")
            return False

        print("✅ Payslip generated successfully!")
        print(f"Payslip ID: {payslip_data['data']['payslip_id']}")
        print(f"Generated Date: {payslip_data['data']['generated_date']}")

        # Show payroll details
        payroll = payslip_data['data']['payroll']
        print("\n📊 Payroll Details:")
        print(f"  Faculty ID: {payroll.get('faculty_id')}")
        print(f"  Pay Month: {payroll.get('pay_month')}")
        print(f"  Basic Salary: ₹{payroll.get('basic_salary', 0):,.2f}")
        print(f"  Net Salary: ₹{payroll.get('net_salary', 0):,.2f}")
        print(f"  Status: {payroll.get('status')}")

        return True

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Make sure it's running on port 5001")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Payroll API Test")
    print("=" * 50)

    success = test_payroll_api()

    print("\n" + "=" * 50)
    if success:
        print("🎉 All API tests passed! Payroll system is working.")
        print("\n✅ The payroll table should now display approved records")
        print("✅ Payslip generation should work for approved records")
    else:
        print("💥 API tests failed. Issues remain with payroll system.")
        print("\n🔧 Possible solutions:")
        print("1. Ensure backend server is running")
        print("2. Check if payroll records are approved")
        print("3. Verify API routes are properly registered")

    return success

if __name__ == "__main__":
    main()
