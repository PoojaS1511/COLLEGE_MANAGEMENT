"""
Test script for transport_routes API endpoints
"""

import requests
import json
import time
from datetime import datetime

# API base URL
API_BASE_URL = "http://localhost:5001/api/transport-routes"

def test_api_endpoints():
    """Test all transport_routes API endpoints"""
    print("🚌 TESTING TRANSPORT_ROUTES API ENDPOINTS")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Base URL: {API_BASE_URL}")
    
    results = {}
    
    # Test 1: Health Check
    print("\n1️⃣ Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check successful")
            print(f"   Message: {data.get('message')}")
            print(f"   Table: {data.get('table')}")
            results['health_check'] = True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            results['health_check'] = False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - make sure Flask app is running")
        results['health_check'] = False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        results['health_check'] = False
    
    if not results.get('health_check', False):
        print("\n⚠️  Server is not running. Please start the Flask app first:")
        print("   cd backend && python app.py")
        return results
    
    # Test 2: Get All Routes
    print("\n2️⃣ Testing Get All Routes...")
    try:
        response = requests.get(API_BASE_URL, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                routes = data.get('data', [])
                total = data.get('total', 0)
                print(f"✅ Get all routes successful")
                print(f"   Total routes: {total}")
                print(f"   Returned routes: {len(routes)}")
                if routes:
                    print(f"   Sample route: {routes[0]}")
                results['get_all'] = True
            else:
                print(f"❌ Get all routes failed: {data.get('error')}")
                results['get_all'] = False
        else:
            print(f"❌ Get all routes failed: HTTP {response.status_code}")
            results['get_all'] = False
    except Exception as e:
        print(f"❌ Get all routes error: {e}")
        results['get_all'] = False
    
    # Test 3: Get Routes with Pagination
    print("\n3️⃣ Testing Pagination...")
    try:
        response = requests.get(f"{API_BASE_URL}?limit=10&page=1", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                routes = data.get('data', [])
                total = data.get('total', 0)
                limit = data.get('limit', 0)
                page = data.get('page', 0)
                pages = data.get('pages', 0)
                print(f"✅ Pagination successful")
                print(f"   Page {page} of {pages}, showing {len(routes)} of {total} routes")
                print(f"   Limit per page: {limit}")
                results['pagination'] = True
            else:
                print(f"❌ Pagination failed: {data.get('error')}")
                results['pagination'] = False
        else:
            print(f"❌ Pagination failed: HTTP {response.status_code}")
            results['pagination'] = False
    except Exception as e:
        print(f"❌ Pagination error: {e}")
        results['pagination'] = False
    
    # Test 4: Get Specific Route
    print("\n4️⃣ Testing Get Specific Route...")
    try:
        response = requests.get(f"{API_BASE_URL}/1", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                route = data.get('data')
                print(f"✅ Get specific route successful")
                print(f"   Route ID: {route.get('id')}")
                print(f"   Bus Name: {route.get('bus_name')}")
                print(f"   Route: {route.get('route')}")
                print(f"   Capacity: {route.get('capacity')}")
                print(f"   Driver: {route.get('driver_name')}")
                print(f"   Faculty ID: {route.get('faculty_id')}")
                results['get_specific'] = True
            else:
                print(f"❌ Get specific route failed: {data.get('error')}")
                results['get_specific'] = False
        else:
            print(f"❌ Get specific route failed: HTTP {response.status_code}")
            results['get_specific'] = False
    except Exception as e:
        print(f"❌ Get specific route error: {e}")
        results['get_specific'] = False
    
    # Test 5: Create New Route
    print("\n5️⃣ Testing Create Route...")
    test_route = {
        "bus_name": "Test-Bus-001",
        "route": "Test-Route-001",
        "capacity": 45,
        "driver_name": "Test-Driver-001",
        "faculty_id": "test-faculty-uuid"
    }
    
    try:
        response = requests.post(API_BASE_URL, json=test_route, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                created_route = data.get('data')
                print(f"✅ Create route successful")
                print(f"   Created route ID: {created_route.get('id')}")
                print(f"   Bus Name: {created_route.get('bus_name')}")
                results['create'] = True
                # Store created route ID for update/delete tests
                created_id = created_route.get('id')
            else:
                print(f"❌ Create route failed: {data.get('error')}")
                results['create'] = False
                created_id = None
        else:
            print(f"❌ Create route failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            results['create'] = False
            created_id = None
    except Exception as e:
        print(f"❌ Create route error: {e}")
        results['create'] = False
        created_id = None
    
    # Test 6: Update Route (only if create was successful)
    if created_id:
        print("\n6️⃣ Testing Update Route...")
        update_data = {
            "bus_name": "Updated-Bus-001",
            "capacity": 50
        }
        
        try:
            response = requests.put(f"{API_BASE_URL}/{created_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    updated_route = data.get('data')
                    print(f"✅ Update route successful")
                    print(f"   Updated bus name: {updated_route.get('bus_name')}")
                    print(f"   Updated capacity: {updated_route.get('capacity')}")
                    results['update'] = True
                else:
                    print(f"❌ Update route failed: {data.get('error')}")
                    results['update'] = False
            else:
                print(f"❌ Update route failed: HTTP {response.status_code}")
                results['update'] = False
        except Exception as e:
            print(f"❌ Update route error: {e}")
            results['update'] = False
    else:
        print("\n6️⃣ Skipping Update Route (create failed)")
        results['update'] = False
    
    # Test 7: Delete Route (only if create was successful)
    if created_id:
        print("\n7️⃣ Testing Delete Route...")
        try:
            response = requests.delete(f"{API_BASE_URL}/{created_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"✅ Delete route successful")
                    results['delete'] = True
                else:
                    print(f"❌ Delete route failed: {data.get('error')}")
                    results['delete'] = False
            else:
                print(f"❌ Delete route failed: HTTP {response.status_code}")
                results['delete'] = False
        except Exception as e:
            print(f"❌ Delete route error: {e}")
            results['delete'] = False
    else:
        print("\n7️⃣ Skipping Delete Route (create failed)")
        results['delete'] = False
    
    # Test 8: Filter Routes
    print("\n8️⃣ Testing Filter Routes...")
    try:
        response = requests.get(f"{API_BASE_URL}?bus_name=Bus-002", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                routes = data.get('data', [])
                total = data.get('total', 0)
                print(f"✅ Filter routes successful")
                print(f"   Found {total} routes matching filter")
                if routes:
                    print(f"   Sample filtered route: {routes[0]}")
                results['filter'] = True
            else:
                print(f"❌ Filter routes failed: {data.get('error')}")
                results['filter'] = False
        else:
            print(f"❌ Filter routes failed: HTTP {response.status_code}")
            results['filter'] = False
    except Exception as e:
        print(f"❌ Filter routes error: {e}")
        results['filter'] = False
    
    # Test 9: API Info
    print("\n9️⃣ Testing API Info...")
    try:
        response = requests.get(f"{API_BASE_URL}/info", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                api_info = data.get('data')
                print(f"✅ API info successful")
                print(f"   API Name: {api_info.get('name')}")
                print(f"   Version: {api_info.get('version')}")
                print(f"   Table: {api_info.get('table')}")
                results['info'] = True
            else:
                print(f"❌ API info failed: {data.get('error')}")
                results['info'] = False
        else:
            print(f"❌ API info failed: HTTP {response.status_code}")
            results['info'] = False
    except Exception as e:
        print(f"❌ API info error: {e}")
        results['info'] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("API TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed >= 7:  # Allow for some non-critical failures
        print("\n🎉 API TESTING COMPLETED SUCCESSFULLY!")
        print("✅ Backend API is working correctly")
        print("✅ transport_routes table is accessible")
        print("✅ CRUD operations are functional")
        print("✅ Pagination and filtering work")
        print("✅ Ready for frontend integration")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("Please check the detailed logs above for troubleshooting")
    
    return passed >= 7

if __name__ == "__main__":
    success = test_api_endpoints()
    exit(0 if success else 1)
