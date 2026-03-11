#!/usr/bin/env python3
"""
Test Transport Attendance Endpoint
Tests the transport attendance API endpoint to verify data is returned correctly
"""

import requests
import json
from datetime import datetime

def test_transport_attendance_endpoint():
    """Test the transport attendance endpoint"""
    try:
        # Test the attendance endpoint
        base_url = "http://localhost:5001"
        endpoint = "/api/transport/attendance"

        print(f"Testing endpoint: {base_url}{endpoint}")

        # Make request to attendance endpoint
        response = requests.get(f"{base_url}{endpoint}", timeout=10)

        print(f"Response status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"Response success: {data.get('success', False)}")

            if data.get('success'):
                attendance_data = data.get('data', [])
                total = data.get('total', 0)

                print(f"Total attendance records: {total}")
                print(f"Returned records count: {len(attendance_data)}")

                if attendance_data:
                    print("Sample attendance record:")
                    print(json.dumps(attendance_data[0], indent=2, default=str))
                else:
                    print("No attendance data returned!")

                return True
            else:
                print(f"API returned error: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("Connection Error: Could not connect to the server. Is the backend running?")
        return False
    except Exception as e:
        print(f"Error testing attendance endpoint: {e}")
        return False

def test_attendance_model_directly():
    """Test the attendance model directly"""
    try:
        print("\nTesting attendance model directly...")

        # Import the attendance model directly
        from models.supabase_transport_adapter import SupabaseTransportAttendance
        from supabase_client import get_supabase

        # Create model instance
        supabase = get_supabase()
        attendance_model = SupabaseTransportAttendance(supabase)

        # Test get_all method directly
        print("Calling attendance_model.get_all()...")
        attendance_data = attendance_model.get_all()

        print(f"Model returned {len(attendance_data)} records")

        if attendance_data:
            print("Sample attendance record from model:")
            print(json.dumps(attendance_data[0], indent=2, default=str))
            return True
        else:
            print("No attendance data returned from model!")
            return False

    except Exception as e:
        print(f"Error testing attendance model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing Transport Attendance System")
    print("=" * 50)

    # Test the model directly first
    model_success = test_attendance_model_directly()

    print("\n" + "=" * 50)

    # Test the API endpoint
    api_success = test_transport_attendance_endpoint()

    print("\n" + "=" * 50)
    print("Test Results:")
    print(f"Model Test: {'PASS' if model_success else 'FAIL'}")
    print(f"API Test: {'PASS' if api_success else 'FAIL'}")

    if model_success and api_success:
        print("✅ All tests passed! Transport attendance is working correctly.")
    else:
        print("❌ Some tests failed. Transport attendance needs fixing.")
