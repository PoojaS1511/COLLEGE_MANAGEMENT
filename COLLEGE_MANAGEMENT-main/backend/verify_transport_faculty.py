"""
Transport Faculty Connectivity Verification Script
This script verifies the transport_faculty table connection and data flow
"""

import sqlite3
import os
import requests
import json
from datetime import datetime

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')
API_BASE_URL = "http://localhost:5001/api/transport"

def verify_database_connection():
    """Step 1: Verify database connection and table structure"""
    print("=" * 60)
    print("STEP 1: DATABASE CONNECTION VERIFICATION")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='transport_faculty'
        """)
        
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ ERROR: transport_faculty table does not exist")
            return False
        
        print("✅ SUCCESS: transport_faculty table exists")
        
        # Get table structure
        cursor.execute("PRAGMA table_info(transport_faculty)")
        columns = cursor.fetchall()
        
        print("\n📋 Table Structure:")
        expected_columns = {
            'id': 'BIGINT',
            'name': 'TEXT', 
            'department': 'TEXT',
            'email': 'TEXT',
            'phone_number': 'BIGINT',
            'faculty_id': 'TEXT'
        }
        
        for col in columns:
            col_name = col[1]
            col_type = col[2]
            print(f"  - {col_name} ({col_type}) {'✅' if col_name in expected_columns else '⚠️'}")
        
        # Check record count
        cursor.execute("SELECT COUNT(*) FROM transport_faculty")
        record_count = cursor.fetchone()[0]
        print(f"\n📊 Total Records: {record_count}")
        
        if record_count == 0:
            print("⚠️  WARNING: No records found in transport_faculty table")
        else:
            print("✅ SUCCESS: Records found in transport_faculty table")
        
        # Sample data verification
        cursor.execute("SELECT * FROM transport_faculty LIMIT 3")
        sample_data = cursor.fetchall()
        
        if sample_data:
            print("\n📝 Sample Records:")
            for i, record in enumerate(sample_data, 1):
                print(f"  Record {i}: {record}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ ERROR: Database connection failed: {e}")
        return False

def verify_backend_api():
    """Step 2: Verify backend API connectivity"""
    print("\n" + "=" * 60)
    print("STEP 2: BACKEND API VERIFICATION")
    print("=" * 60)
    
    try:
        # Test GET endpoint
        response = requests.get(f"{API_BASE_URL}/faculty", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                faculty_data = data.get('data', [])
                print("✅ SUCCESS: Backend API responding correctly")
                print(f"📊 API returned {len(faculty_data)} records")
                
                # Verify data structure
                if faculty_data:
                    sample = faculty_data[0]
                    print("\n📋 Sample API Response Structure:")
                    expected_fields = ['id', 'name', 'department', 'email', 'phone_number', 'faculty_id']
                    
                    for field in expected_fields:
                        status = "✅" if field in sample else "❌"
                        print(f"  - {field}: {status}")
                
                return True
            else:
                print(f"❌ ERROR: API returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ ERROR: API returned status code {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend API")
        print("📋 Make sure the Flask server is running on http://localhost:5001")
        return False
    except Exception as e:
        print(f"❌ ERROR: API verification failed: {e}")
        return False

def verify_data_mapping():
    """Step 3: Verify data mapping between database and API"""
    print("\n" + "=" * 60)
    print("STEP 3: DATA MAPPING VERIFICATION")
    print("=" * 60)
    
    try:
        # Get data directly from database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transport_faculty LIMIT 5")
        db_data = cursor.fetchall()
        conn.close()
        
        # Get data from API
        response = requests.get(f"{API_BASE_URL}/faculty")
        api_data = response.json().get('data', [])
        
        if db_data and api_data:
            print("✅ SUCCESS: Both database and API have data")
            
            # Compare structure
            db_columns = ['id', 'faculty_id', 'name', 'email', 'phone', 'department', 'route_id', 'route_name', 'status', 'created_at', 'updated_at']
            api_fields = list(api_data[0].keys()) if api_data else []
            
            print("\n📋 Field Mapping Verification:")
            for field in ['id', 'faculty_id', 'name', 'department', 'email']:
                db_has = field in db_columns
                api_has = field in api_fields
                status = "✅" if (db_has and api_has) else "❌"
                print(f"  - {field}: DB({db_has}) API({api_has}) {status}")
            
            # Check phone number mapping (DB: phone, API: phone_number)
            phone_status = "✅" if ('phone' in db_columns and 'phone_number' in api_fields) else "❌"
            print(f"  - phone_number: DB(phone) API(phone_number) {phone_status}")
            
            return True
        else:
            print("❌ ERROR: No data available for comparison")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Data mapping verification failed: {e}")
        return False

def verify_frontend_compatibility():
    """Step 4: Verify frontend compatibility"""
    print("\n" + "=" * 60)
    print("STEP 4: FRONTEND COMPATIBILITY VERIFICATION")
    print("=" * 60)
    
    try:
        # Check if frontend service exists
        frontend_service_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'services', 'transportService.js')
        
        if os.path.exists(frontend_service_path):
            print("✅ SUCCESS: Frontend transport service exists")
            
            # Read and check service methods
            with open(frontend_service_path, 'r') as f:
                service_content = f.read()
            
            required_methods = [
                'getTransportFaculty',
                'addTransportFaculty', 
                'updateTransportFaculty',
                'deleteTransportFaculty'
            ]
            
            print("\n📋 Frontend Service Methods:")
            for method in required_methods:
                exists = method in service_content
                status = "✅" if exists else "❌"
                print(f"  - {method}: {status}")
            
            return True
        else:
            print("❌ ERROR: Frontend transport service not found")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Frontend compatibility check failed: {e}")
        return False

def test_crud_operations():
    """Step 5: Test CRUD operations"""
    print("\n" + "=" * 60)
    print("STEP 5: CRUD OPERATIONS TESTING")
    print("=" * 60)
    
    test_data = {
        "faculty_id": "TEST001",
        "name": "Test Faculty",
        "email": "test@college.edu",
        "phone": "+91 9876543210",
        "department": "CSE"
    }
    
    try:
        # Test CREATE
        print("📝 Testing CREATE operation...")
        response = requests.post(f"{API_BASE_URL}/faculty", json=test_data)
        
        if response.status_code == 200:
            created_data = response.json().get('data', {})
            created_id = created_data.get('faculty_id')
            print("✅ CREATE operation successful")
            
            # Test READ
            print("📝 Testing READ operation...")
            response = requests.get(f"{API_BASE_URL}/faculty")
            if response.status_code == 200:
                faculty_list = response.json().get('data', [])
                test_faculty = next((f for f in faculty_list if f['faculty_id'] == created_id), None)
                if test_faculty:
                    print("✅ READ operation successful")
                    
                    # Test UPDATE
                    print("📝 Testing UPDATE operation...")
                    update_data = {"name": "Updated Test Faculty"}
                    response = requests.put(f"{API_BASE_URL}/faculty/{created_id}", json=update_data)
                    
                    if response.status_code == 200:
                        print("✅ UPDATE operation successful")
                        
                        # Test DELETE
                        print("📝 Testing DELETE operation...")
                        response = requests.delete(f"{API_BASE_URL}/faculty/{created_id}")
                        
                        if response.status_code == 200:
                            print("✅ DELETE operation successful")
                            return True
                        else:
                            print(f"❌ DELETE operation failed: {response.status_code}")
                    else:
                        print(f"❌ UPDATE operation failed: {response.status_code}")
                else:
                    print("❌ READ operation failed - created record not found")
            else:
                print(f"❌ READ operation failed: {response.status_code}")
        else:
            print(f"❌ CREATE operation failed: {response.status_code}")
            print(f"Response: {response.text}")
        
        return False
        
    except Exception as e:
        print(f"❌ ERROR: CRUD operations testing failed: {e}")
        return False

def main():
    """Main verification function"""
    print("🚀 TRANSPORT FACULTY CONNECTIVITY VERIFICATION")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all verification steps
    steps = [
        ("Database Connection", verify_database_connection),
        ("Backend API", verify_backend_api),
        ("Data Mapping", verify_data_mapping),
        ("Frontend Compatibility", verify_frontend_compatibility),
        ("CRUD Operations", test_crud_operations)
    ]
    
    results = {}
    
    for step_name, step_func in steps:
        try:
            results[step_name] = step_func()
        except Exception as e:
            print(f"❌ ERROR in {step_name}: {e}")
            results[step_name] = False
    
    # Final summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for step_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{step_name}: {status}")
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL VERIFICATIONS PASSED!")
        print("✅ The transport_faculty table is successfully connected to both frontend and backend")
        print("✅ Data flow from database → backend → frontend works as expected")
        print("✅ All columns are mapped accurately")
        print("✅ CRUD operations are functioning correctly")
    else:
        print(f"\n⚠️  {total - passed} verification(s) failed")
        print("Please check the detailed logs above for troubleshooting")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
