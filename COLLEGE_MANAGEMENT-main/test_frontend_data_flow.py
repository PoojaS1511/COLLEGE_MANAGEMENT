#!/usr/bin/env python3
"""
Test frontend data flow by simulating what the frontend does
"""
import requests
import json
import os
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:5001/api')

def test_frontend_data_flow():
    """Test the complete data flow from API to frontend display"""
    print("🔍 Testing Frontend Data Flow...")
    
    try:
        # Step 1: Get data from API (same as frontend)
        response = requests.get(f'{API_BASE}/transport/students', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if not data.get('success'):
                print(f"❌ API returned error: {data.get('error')}")
                return
                
            students = data.get('data', [])
            print(f"✅ API returned {len(students)} students")
            
            # Step 2: Simulate frontend filtering (empty search, all status)
            searchTerm = ""
            filterStatus = "All"
            
            filtered_students = []
            for student in students:
                # Same filtering logic as frontend
                matches_search = (
                    (student.get('full_name') and student['full_name'].lower().find(searchTerm.lower()) != -1) or
                    (student.get('register_number') and student['register_number'].lower().find(searchTerm.lower()) != -1) or
                    (student.get('email') and student['email'].lower().find(searchTerm.lower()) != -1) or
                    (student.get('id') and student['id'].lower().find(searchTerm.lower()) != -1)
                )
                matches_status = filterStatus == 'All' or student.get('status') == filterStatus
                
                if matches_search and matches_status:
                    filtered_students.append(student)
            
            print(f"✅ Frontend filtering: {len(filtered_students)} students remain")
            
            # Step 3: Simulate frontend display logic
            if filtered_students:
                sample = filtered_students[0]
                
                print(f"\n📋 Frontend Display Simulation:")
                print(f"   ID: {sample.get('id', 'No ID')}")
                print(f"   Register Number: {sample.get('register_number', 'No Register Number')}")
                print(f"   Full Name: {sample.get('full_name', 'No Name')}")
                print(f"   Email: {sample.get('email', 'No Email')}")
                print(f"   Phone: {sample.get('phone', 'No Phone')}")
                
                # Check for display issues
                display_issues = []
                if not sample.get('register_number'):
                    display_issues.append("Register Number is empty")
                if not sample.get('full_name'):
                    display_issues.append("Full Name is empty")
                if not sample.get('email'):
                    display_issues.append("Email is empty")
                if not sample.get('phone'):
                    display_issues.append("Phone is empty")
                
                if display_issues:
                    print(f"\n⚠️  Display Issues Found:")
                    for issue in display_issues:
                        print(f"   - {issue}")
                else:
                    print(f"\n✅ All fields have data for display")
                    
                # Check data types
                print(f"\n🔍 Data Type Check:")
                print(f"   - register_number: {type(sample.get('register_number'))}")
                print(f"   - full_name: {type(sample.get('full_name'))}")
                print(f"   - email: {type(sample.get('email'))}")
                print(f"   - phone: {type(sample.get('phone'))}")
            else:
                print("❌ No students after filtering")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_frontend_data_flow()
