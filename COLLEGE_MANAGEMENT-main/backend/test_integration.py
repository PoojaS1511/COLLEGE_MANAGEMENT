#!/usr/bin/env python3
"""
Test script to verify frontend-backend integration for finance_operationmaintenance.
This script will:
1. Test the backend maintenance endpoint with proper authentication
2. Verify data structure matches frontend expectations
3. Test pagination and filtering
4. Check performance with large datasets
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5001"
MAINTENANCE_ENDPOINT = f"{BASE_URL}/api/finance/maintenance"

def test_backend_endpoint():
    """Test the backend maintenance endpoint"""
    print("🌐 TESTING BACKEND MAINTENANCE ENDPOINT")
    print("=" * 60)
    
    # Test without authentication (should fail)
    print("🔍 Testing without authentication...")
    try:
        response = requests.get(MAINTENANCE_ENDPOINT, timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Authentication required (expected)")
        else:
            print("   ⚠️  Unexpected response")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test with fake authentication (to test endpoint structure)
    print("\n🔍 Testing with fake authentication...")
    headers = {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
    }
    
    try:
        start_time = time.time()
        response = requests.get(MAINTENANCE_ENDPOINT, headers=headers, timeout=10)
        end_time = time.time()
        
        print(f"   Status: {response.status_code}")
        print(f"   Response time: {(end_time - start_time)*1000:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Endpoint accessible")
            print(f"   Success: {data.get('success', False)}")
            
            if data.get('success'):
                records = len(data.get('data', []))
                summary = data.get('summary', {})
                print(f"   Records returned: {records}")
                print(f"   Summary keys: {list(summary.keys())}")
                
                # Check data structure
                if records > 0:
                    sample_record = data['data'][0]
                    print(f"   Sample record keys: {list(sample_record.keys())}")
                    
                    # Verify expected fields
                    expected_fields = [
                        'request_id', 'department', 'asset', 'issue_description',
                        'status', 'reported_date', 'resolved_date', 'cost'
                    ]
                    
                    missing_fields = []
                    for field in expected_fields:
                        if field not in sample_record:
                            missing_fields.append(field)
                    
                    if missing_fields:
                        print(f"   ⚠️  Missing fields: {missing_fields}")
                    else:
                        print("   ✅ All expected fields present")
                
                return True
            else:
                print(f"   ❌ API error: {data.get('error', 'Unknown')}")
                return False
        else:
            print(f"   ❌ HTTP error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Response text: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_pagination():
    """Test pagination functionality"""
    print("\n📄 TESTING PAGINATION")
    print("=" * 60)
    
    headers = {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
    }
    
    page_sizes = [10, 50, 100, 500]
    
    for page_size in page_sizes:
        try:
            url = f"{MAINTENANCE_ENDPOINT}?limit={page_size}&page=1"
            start_time = time.time()
            response = requests.get(url, headers=headers, timeout=10)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                records = len(data.get('data', []))
                response_time = (end_time - start_time) * 1000
                
                print(f"   Page size {page_size:4d}: {records:4d} records in {response_time:6.2f}ms")
                
                if records > 0:
                    avg_time = response_time / records
                    print(f"                     Avg: {avg_time:.2f}ms per record")
            else:
                print(f"   Page size {page_size:4d}: ❌ Failed with status {response.status_code}")
                
        except Exception as e:
            print(f"   Page size {page_size:4d}: ❌ Error: {e}")

def test_filtering():
    """Test filtering functionality"""
    print("\n🔍 TESTING FILTERING")
    print("=" * 60)
    
    headers = {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
    }
    
    # Test department filter
    print("   Testing department filter...")
    try:
        url = f"{MAINTENANCE_ENDPOINT}?department=CSE&limit=10"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get('data', [])
            print(f"      CSE department: {len(records)} records")
            
            # Verify all records are from CSE
            all_cse = all(record.get('department') == 'CSE' for record in records)
            print(f"      All CSE records: {'✅' if all_cse else '❌'}")
        else:
            print(f"      Department filter failed: {response.status_code}")
    except Exception as e:
        print(f"      Department filter error: {e}")
    
    # Test status filter
    print("   Testing status filter...")
    try:
        url = f"{MAINTENANCE_ENDPOINT}?status=pending&limit=10"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get('data', [])
            print(f"      Pending status: {len(records)} records")
            
            # Verify all records are pending
            all_pending = all(record.get('status', '').lower() == 'pending' for record in records)
            print(f"      All pending records: {'✅' if all_pending else '❌'}")
        else:
            print(f"      Status filter failed: {response.status_code}")
    except Exception as e:
        print(f"      Status filter error: {e}")
    
    # Test search filter
    print("   Testing search filter...")
    try:
        url = f"{MAINTENANCE_ENDPOINT}?search=AC&limit=10"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get('data', [])
            print(f"      Search 'AC': {len(records)} records")
        else:
            print(f"      Search filter failed: {response.status_code}")
    except Exception as e:
        print(f"      Search filter error: {e}")

def test_data_structure():
    """Test data structure matches frontend expectations"""
    print("\n📊 TESTING DATA STRUCTURE")
    print("=" * 60)
    
    headers = {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{MAINTENANCE_ENDPOINT}?limit=5", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if not data.get('success'):
                print(f"   ❌ API returned error: {data.get('error')}")
                return False
            
            records = data.get('data', [])
            summary = data.get('summary', {})
            
            print("   📋 Response structure:")
            print(f"      Success field: {'✅' if 'success' in data else '❌'}")
            print(f"      Data field: {'✅' if 'data' in data else '❌'}")
            print(f"      Summary field: {'✅' if 'summary' in data else '❌'}")
            
            if records:
                print(f"\n   📄 Record structure (sample):")
                sample = records[0]
                for key, value in sample.items():
                    print(f"      {key}: {type(value).__name__} = {str(value)[:50]}...")
            
            if summary:
                print(f"\n   📈 Summary structure:")
                for key, value in summary.items():
                    print(f"      {key}: {type(value).__name__} = {value}")
            
            # Verify frontend mapping
            frontend_mapping = {
                'requestId': 'request_id',
                'assetName': 'asset', 
                'issueDescription': 'issue_description',
                'reportedDate': 'reported_date',
                'resolvedDate': 'resolved_date',
                'maintenanceCost': 'cost'
            }
            
            if records:
                sample = records[0]
                print(f"\n   🔄 Frontend mapping verification:")
                for frontend_field, backend_field in frontend_mapping.items():
                    exists = backend_field in sample
                    print(f"      {frontend_field} <- {backend_field}: {'✅' if exists else '❌'}")
            
            return True
        else:
            print(f"   ❌ Request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 FRONTEND-BACKEND INTEGRATION TEST")
    print("=" * 60)
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Backend URL: {BASE_URL}")
    print(f"📡 Endpoint: {MAINTENANCE_ENDPOINT}")
    
    # Run tests
    tests = [
        ("Backend Endpoint", test_backend_endpoint),
        ("Pagination", test_pagination),
        ("Filtering", test_filtering),
        ("Data Structure", test_data_structure),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 INTEGRATION TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:25} : {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Frontend-backend integration is working correctly!")
    else:
        print("⚠️  Some integration tests failed.")
    
    # Recommendations
    print("\n" + "=" * 60)
    print("💡 INTEGRATION RECOMMENDATIONS")
    print("=" * 60)
    
    if not results.get("Backend Endpoint", False):
        print("🔧 Fix backend authentication and endpoint configuration")
    
    if not results.get("Data Structure", False):
        print("📊 Ensure backend response matches frontend expectations")
    
    if not results.get("Pagination", False):
        print("📄 Optimize pagination for better performance")
    
    if not results.get("Filtering", False):
        print("🔍 Verify filtering functionality")

if __name__ == "__main__":
    main()
