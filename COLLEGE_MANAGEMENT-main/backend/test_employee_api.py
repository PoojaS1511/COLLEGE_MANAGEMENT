"""
Test Employee Management API Endpoints
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_employee_endpoints():
    """Test all employee management endpoints"""
    
    print("🧪 Testing Employee Management API Endpoints")
    print("=" * 50)
    
    # Test 1: Get Dashboard Stats
    print("\n1. Testing GET /api/employees/stats/dashboard")
    try:
        response = requests.get(f"{BASE_URL}/api/employees/stats/dashboard")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Dashboard stats endpoint working")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 2: Get Employees List
    print("\n2. Testing GET /api/employees")
    try:
        response = requests.get(f"{BASE_URL}/api/employees")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Employees list endpoint working")
            print(f"Total employees: {data.get('pagination', {}).get('total', 0)}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 3: Create Employee (Sample Data)
    print("\n3. Testing POST /api/employees")
    sample_employee = {
        "name": "John Doe",
        "email": "john.doe@college.edu",
        "phone_number": "9876543210",
        "role": "Faculty",
        "department": "Computer Science Engineering",
        "designation": "Assistant Professor",
        "employee_type": "Faculty",
        "joining_date": "2024-01-15",
        "salary_structure": {
            "basic_pay": 50000,
            "hra": 20000,
            "da": 5000,
            "allowances": 10000,
            "pf_deduction": 6000,
            "tax_deduction": 8000,
            "effective_from": "2024-01-15"
        },
        "leave_policy": {
            "academic_year": "2024",
            "casual_leave_total": 12,
            "sick_leave_total": 10,
            "earned_leave_total": 15
        },
        "work_policy": {
            "work_start_time": "09:00",
            "work_end_time": "16:00",
            "weekly_off_days": ["Sunday"],
            "lunch_break_start": "13:00",
            "lunch_break_end": "14:00"
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/employees",
            json=sample_employee,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print("✅ Employee creation endpoint working")
            print(f"Employee ID: {data.get('data', {}).get('employee_id')}")
            return data.get('data', {}).get('employee_id')  # Return for further tests
        else:
            print(f"❌ Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return None

def test_specific_employee(employee_id):
    """Test endpoints for a specific employee"""
    
    if not employee_id:
        print("\n⚠️ Skipping employee-specific tests (no employee ID)")
        return
    
    print(f"\n4. Testing GET /api/employees/{employee_id}")
    try:
        response = requests.get(f"{BASE_URL}/api/employees/{employee_id}")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Get employee endpoint working")
            print(f"Employee Name: {data.get('data', {}).get('employee', {}).get('name')}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def test_server_status():
    """Test if the server is running"""
    print("\n🔍 Checking server status...")
    try:
        response = requests.get(f"{BASE_URL}/api/test", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running")
            return True
        else:
            print(f"❌ Server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running or not accessible")
        return False
    except Exception as e:
        print(f"❌ Error checking server: {str(e)}")
        return False

if __name__ == "__main__":
    # Check if server is running first
    if not test_server_status():
        print("\n💡 Please start the Flask server first:")
        print("   cd backend && python app.py")
        exit(1)
    
    # Run the tests
    employee_id = test_employee_endpoints()
    test_specific_employee(employee_id)
    
    print("\n🎯 Test Summary:")
    print("   - If all tests pass ✅, the employee management system is working")
    print("   - If there are errors ❌, check the server logs and database connection")
    print("   - Make sure Supabase credentials are properly configured in .env file")
