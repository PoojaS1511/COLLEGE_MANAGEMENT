#!/usr/bin/env python3
"""
Test Backend API for transport_students
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import requests
import json
from supabase_client import get_supabase

def test_backend_api():
    """Test backend API endpoints"""
    print("🔍 Testing Backend API...")
    
    # Base URL for backend API
    base_url = os.getenv('API_BASE_URL', 'http://localhost:5001')
    
    # Test endpoints
    endpoints = [
        '/api/transport/health',
        '/api/transport/info',
        '/api/transport/students',
        '/api/transport/dashboard/metrics'
    ]
    
    results = {}
    
    for endpoint in endpoints:
        print(f"\n📡 Testing {endpoint}...")
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=10)
            
            results[endpoint] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response_time': response.elapsed.total_seconds(),
                'data_length': len(response.text) if response.text else 0
            }
            
            if response.status_code == 200:
                print(f"✅ {endpoint} - Status: {response.status_code}")
                try:
                    data = response.json()
                    if endpoint == '/api/transport/students':
                        print(f"📊 Students returned: {len(data.get('data', []))}")
                        if data.get('data'):
                            print(f"📋 Sample student: {data['data'][0].get('full_name', 'N/A')}")
                    elif endpoint == '/api/transport/dashboard/metrics':
                        print(f"📈 Dashboard metrics: {list(data.get('data', {}).keys())}")
                except:
                    print(f"⚠️  Response is not valid JSON")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
                print(f"📝 Error: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - Connection failed (backend not running)")
            results[endpoint] = {
                'status_code': None,
                'success': False,
                'error': 'Connection failed'
            }
        except Exception as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
            results[endpoint] = {
                'status_code': None,
                'success': False,
                'error': str(e)
            }
    
    return results

def test_direct_supabase_access():
    """Test direct Supabase access like the backend does"""
    print("\n🔍 Testing Direct Supabase Access (Backend Simulation)...")
    
    try:
        supabase = get_supabase()
        
        # Test get_all method like backend controller
        print("📊 Testing get_all() method...")
        students = supabase.table('transport_students').select('*').order('full_name').execute()
        
        if students.data:
            print(f"✅ Direct Supabase access successful")
            print(f"📈 Total students: {len(students.data)}")
            print(f"📋 Sample student: {students.data[0].get('full_name', 'N/A')}")
            
            # Test filters like backend
            print("\n🔍 Testing filters...")
            active_students = supabase.table('transport_students').select('*').eq('status', 'active').execute()
            print(f"📊 Active students: {len(active_students.data)}")
            
            transport_students = supabase.table('transport_students').select('*').eq('transport_required', True).execute()
            print(f"🚌 Transport required: {len(transport_students.data)}")
            
            return True
        else:
            print("❌ No data returned from Supabase")
            return False
            
    except Exception as e:
        print(f"❌ Direct Supabase access failed: {str(e)}")
        return False

def check_backend_configuration():
    """Check backend configuration"""
    print("\n🔧 Checking Backend Configuration...")
    
    try:
        # Check if backend uses Supabase correctly
        from controllers.transportController import StudentController
        
        controller = StudentController()
        print("✅ StudentController initialized")
        
        # Check if it uses Supabase model
        student_model = controller.student_model
        print(f"📋 Student model type: {type(student_model).__name__}")
        
        # Test the model directly
        students = student_model.get_all()
        print(f"📊 Students via model: {len(students)}")
        
        if students:
            print(f"📋 Sample student via model: {students[0].get('full_name', 'N/A')}")
            return True
        else:
            print("⚠️  No students returned via model")
            return False
            
    except Exception as e:
        print(f"❌ Backend configuration check failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Backend API Verification")
    print("=" * 50)
    
    # Test direct Supabase access
    direct_success = test_direct_supabase_access()
    
    # Check backend configuration
    config_success = check_backend_configuration()
    
    # Test API endpoints (if backend is running)
    api_results = test_backend_api()
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    print(f"✅ Direct Supabase Access: {'PASS' if direct_success else 'FAIL'}")
    print(f"✅ Backend Configuration: {'PASS' if config_success else 'FAIL'}")
    
    api_success_count = sum(1 for r in api_results.values() if r.get('success', False))
    api_total_count = len(api_results)
    print(f"✅ API Endpoints: {api_success_count}/{api_total_count} working")
    
    if api_success_count > 0:
        print("\n📋 API Test Results:")
        for endpoint, result in api_results.items():
            status = "✅ PASS" if result.get('success', False) else "❌ FAIL"
            print(f"   {endpoint}: {status}")
    
    print("\n" + "=" * 50)
    if direct_success and config_success:
        print("✅ Backend verification completed successfully")
    else:
        print("❌ Backend verification has issues")
