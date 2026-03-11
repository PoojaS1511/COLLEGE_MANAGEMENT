"""
Test script for payslip generation API endpoint
Tests the /api/payroll/payslip/<payroll_id> endpoint
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
from datetime import datetime

def test_payslip_generation():
    """Test payslip generation endpoint"""
    base_url = "http://localhost:5001"

    print("🧪 Testing Payslip Generation API")
    print("=" * 50)

    try:
        # First, get approved payroll records
        print("\n📋 Getting approved payroll records...")
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
        if not records:
            print("❌ No approved payroll records found!")
            print("💡 This explains why the table shows no data.")
            return False

        print(f"✅ Found {len(records)} approved payroll records")

        # Test payslip generation for first record
        first_record = records[0]
        payroll_id = first_record['id']

        print(f"\n🧾 Testing payslip generation for payroll ID: {payroll_id}")
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
        print(f"Institution: {payslip_data['data']['institution']}")

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
    print("🚀 Starting Payslip Generation Test")
    print("=" * 50)

    success = test_payslip_generation()

    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Payslip generation is working.")
    else:
        print("💥 Tests failed. Issues found with payslip generation.")
        print("\n🔧 Possible solutions:")
        print("1. Ensure backend server is running")
        print("2. Check if payroll table has approved records")
        print("3. Verify API routes are properly registered")

    return success

if __name__ == "__main__":
    main()
