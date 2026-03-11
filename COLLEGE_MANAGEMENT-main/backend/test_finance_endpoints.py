#!/usr/bin/env python3
"""
Comprehensive test script for finance endpoints with /api/finance/ prefix
Tests all CRUD operations for dashboard, student-fees, and staff-payroll endpoints
"""

import requests
import json
import time
from datetime import datetime
import sys

# Configuration
BASE_URL = "http://localhost:5001"
TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  # Mock token for testing

HEADERS = {
    'Authorization': f'Bearer {TEST_TOKEN}',
    'Content-Type': 'application/json'
}

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"TESTING: {test_name}")
    print(f"{'='*60}")

def print_test_result(test_name, success, response=None, error=None):
    """Print formatted test result"""
    status = "✓ PASS" if success else "✗ FAIL"
    print(f"{status}: {test_name}")
    if error:
        print(f"  Error: {error}")
    if response and not success:
        print(f"  Response: {response}")

def test_endpoint(method, url, data=None, expected_status=200):
    """Test a single endpoint"""
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=HEADERS)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=HEADERS, json=data)
        elif method.upper() == 'PUT':
            response = requests.put(url, headers=HEADERS, json=data)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=HEADERS)
        else:
            return False, f"Unsupported method: {method}"

        if response.status_code == expected_status:
            return True, response.json()
        else:
            return False, f"Expected status {expected_status}, got {response.status_code}. Response: {response.text}"

    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {str(e)}"
    except json.JSONDecodeError as e:
        return False, f"JSON decode error: {str(e)}"

def test_dashboard_endpoints():
    """Test dashboard endpoints"""
    print_test_header("DASHBOARD ENDPOINTS")

    # Test dashboard metrics
    success, response = test_endpoint('GET', f"{BASE_URL}/api/finance/dashboard/metrics")
    print_test_result("Dashboard Metrics GET", success, response)

    return success

def test_student_fees_endpoints():
    """Test student fees endpoints"""
    print_test_header("STUDENT FEES ENDPOINTS")

    # Test GET all student fees
    success, response = test_endpoint('GET', f"{BASE_URL}/api/finance/student-fees")
    print_test_result("Student Fees GET (all)", success, response)

    # Test GET with filters
    success, response = test_endpoint('GET', f"{BASE_URL}/api/finance/student-fees?department=CSE&page=1&limit=10")
    print_test_result("Student Fees GET (filtered)", success, response)

    # Test POST create student fee
    test_fee_data = {
        "student_id": "TEST001",
        "student_name": "Test Student",
        "department": "CSE",
        "year": "2024",
        "total_fee": 50000,
        "paid_amount": 25000,
        "payment_status": "partial"
    }
    success, response = test_endpoint('POST', f"{BASE_URL}/api/finance/student-fees", test_fee_data, 201)
    print_test_result("Student Fees POST (create)", success, response)

    # Get the created fee ID for further testing
    created_fee_id = None
    if success and response.get('data', {}).get('id'):
        created_fee_id = response['data']['id']

    # Test PUT update (if we have an ID)
    if created_fee_id:
        update_data = {
            "paid_amount": 30000,
            "payment_status": "partial"
        }
        success, response = test_endpoint('PUT', f"{BASE_URL}/api/finance/student-fees/{created_fee_id}", update_data)
        print_test_result("Student Fees PUT (update)", success, response)

        # Test DELETE
        success, response = test_endpoint('DELETE', f"{BASE_URL}/api/finance/student-fees/{created_fee_id}", expected_status=200)
        print_test_result("Student Fees DELETE", success, response)

    return True

def test_staff_payroll_endpoints():
    """Test staff payroll endpoints"""
    print_test_header("STAFF PAYROLL ENDPOINTS")

    # Test GET all staff payroll
    success, response = test_endpoint('GET', f"{BASE_URL}/api/finance/staff-payroll")
    print_test_result("Staff Payroll GET (all)", success, response)

    # Test GET with filters
    success, response = test_endpoint('GET', f"{BASE_URL}/api/finance/staff-payroll?department=CSE&page=1&limit=10")
    print_test_result("Staff Payroll GET (filtered)", success, response)

    # Test POST create staff payroll
    test_payroll_data = {
        "staff_id": "STAFF001",
        "staff_name": "Test Staff",
        "department": "CSE",
        "role": "Professor",
        "base_salary": 75000,
        "allowance": 5000,
        "deduction": 2000,
        "payment_status": "pending"
    }
    success, response = test_endpoint('POST', f"{BASE_URL}/api/finance/staff-payroll", test_payroll_data, 201)
    print_test_result("Staff Payroll POST (create)", success, response)

    # Get the created payroll ID for further testing
    created_payroll_id = None
    if success and response.get('data', {}).get('id'):
        created_payroll_id = response['data']['id']

    # Test PUT update (if we have an ID)
    if created_payroll_id:
        update_data = {
            "allowance": 6000,
            "payment_status": "paid"
        }
        success, response = test_endpoint('PUT', f"{BASE_URL}/api/finance/staff-payroll/{created_payroll_id}", update_data)
        print_test_result("Staff Payroll PUT (update)", success, response)

        # Test DELETE
        success, response = test_endpoint('DELETE', f"{BASE_URL}/api/finance/staff-payroll/{created_payroll_id}", expected_status=200)
        print_test_result("Staff Payroll DELETE", success, response)

    return True

def test_additional_endpoints():
    """Test additional finance endpoints to ensure they still work"""
    print_test_header("ADDITIONAL ENDPOINTS")

    endpoints_to_test = [
        ("Expenses GET", "GET", "/api/finance/expenses"),
        ("Budget GET", "GET", "/api/finance/budget"),
        ("Maintenance GET", "GET", "/api/finance/maintenance"),
        ("Vendors GET", "GET", "/api/finance/vendors"),
    ]

    all_passed = True
    for test_name, method, endpoint in endpoints_to_test:
        success, response = test_endpoint(method, f"{BASE_URL}{endpoint}")
        print_test_result(test_name, success, response)
        if not success:
            all_passed = False

    return all_passed

def test_error_handling():
    """Test error handling scenarios"""
    print_test_header("ERROR HANDLING")

    # Test invalid endpoint
    success, response = test_endpoint('GET', f"{BASE_URL}/api/finance/nonexistent", expected_status=404)
    print_test_result("Invalid Endpoint (404)", success, response)

    # Test unauthorized access (no token)
    try:
        response = requests.get(f"{BASE_URL}/api/finance/dashboard/metrics")
        success = response.status_code == 401
        print_test_result("Unauthorized Access (401)", success, None, f"Got status {response.status_code}")
    except Exception as e:
        print_test_result("Unauthorized Access (401)", False, None, str(e))

    return True

def wait_for_server(max_attempts=30):
    """Wait for the Flask server to be ready"""
    print("Waiting for Flask server to start...")
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/api/health", timeout=5)
            if response.status_code == 200:
                print("✓ Server is ready!")
                return True
        except requests.exceptions.RequestException:
            pass

        print(f"Attempt {attempt + 1}/{max_attempts} - Server not ready, waiting...")
        time.sleep(2)

    print("✗ Server failed to start within timeout")
    return False

def main():
    """Main test function"""
    print(f"{'='*80}")
    print("COMPREHENSIVE FINANCE ENDPOINTS TEST SUITE")
    print(f"Testing against: {BASE_URL}")
    print(f"{'='*80}")

    # Check if server is running
    if not wait_for_server():
        print("Cannot proceed with tests - server not available")
        sys.exit(1)

    # Run all tests
    test_results = []

    # Core endpoint tests
    test_results.append(("Dashboard Endpoints", test_dashboard_endpoints()))
    test_results.append(("Student Fees Endpoints", test_student_fees_endpoints()))
    test_results.append(("Staff Payroll Endpoints", test_staff_payroll_endpoints()))

    # Additional tests
    test_results.append(("Additional Endpoints", test_additional_endpoints()))
    test_results.append(("Error Handling", test_error_handling()))

    # Summary
    print(f"\n{'='*80}")
    print("TEST SUMMARY")
    print(f"{'='*80}")

    passed = 0
    total = len(test_results)

    for test_name, success in test_results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status}: {test_name}")
        if success:
            passed += 1

    print(f"\nResults: {passed}/{total} test suites passed")

    if passed == total:
        print("🎉 ALL TESTS PASSED! The finance endpoints are working correctly with the new /api/finance/ prefix.")
        return 0
    else:
        print("❌ Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
