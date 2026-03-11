#!/usr/bin/env python3
"""
Direct test of maintenance endpoint without authentication to verify data structure.
This creates a temporary route to test the data flow.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import get_supabase
import json
import time

def test_direct_data_access():
    """Test direct data access to verify structure"""
    print("🔍 TESTING DIRECT DATA ACCESS")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Test basic query
        print("📄 Testing basic data query...")
        start_time = time.time()
        result = supabase.table('finance_operationmaintenance').select('*').limit(5).execute()
        end_time = time.time()
        
        if result.data:
            print(f"✅ Retrieved {len(result.data)} records")
            print(f"⏱️  Query time: {(end_time - start_time)*1000:.2f}ms")
            
            # Show sample record structure
            sample = result.data[0]
            print(f"\n📊 Sample record structure:")
            for key, value in sample.items():
                print(f"   {key}: {type(value).__name__} = {str(value)[:50]}...")
            
            # Test summary calculation
            print(f"\n📈 Testing summary calculation...")
            start_time = time.time()
            summary_result = supabase.table('finance_operationmaintenance').select('status, cost').execute()
            end_time = time.time()
            
            if summary_result.data:
                total_requests = len(summary_result.data)
                total_cost = sum(item.get('cost', 0) for item in summary_result.data)
                
                pending = sum(1 for item in summary_result.data if item.get('status', '').lower() == 'pending')
                in_progress = sum(1 for item in summary_result.data if item.get('status', '').lower() == 'in progress')
                resolved = sum(1 for item in summary_result.data if item.get('status', '').lower() == 'resolved')
                
                summary = {
                    'totalRequests': total_requests,
                    'pendingRequests': pending,
                    'inProgressRequests': in_progress,
                    'resolvedRequests': resolved,
                    'totalCost': total_cost
                }
                
                print(f"✅ Summary calculated in {(end_time - start_time)*1000:.2f}ms")
                print(f"📊 Summary data:")
                for key, value in summary.items():
                    print(f"   {key}: {value}")
                
                # Test pagination
                print(f"\n📄 Testing pagination...")
                for page_size in [50, 100, 500]:
                    start_time = time.time()
                    paginated_result = supabase.table('finance_operationmaintenance').select('*').limit(page_size).execute()
                    end_time = time.time()
                    
                    records = len(paginated_result.data) if paginated_result.data else 0
                    response_time = (end_time - start_time) * 1000
                    avg_time = response_time / records if records > 0 else 0
                    
                    print(f"   Page size {page_size:3d}: {records:4d} records in {response_time:6.2f}ms (avg: {avg_time:.2f}ms/record)")
                
                # Test filtering
                print(f"\n🔍 Testing filtering...")
                
                # Department filter
                start_time = time.time()
                dept_result = supabase.table('finance_operationmaintenance').select('*').eq('department', 'CSE').limit(10).execute()
                end_time = time.time()
                print(f"   Department filter (CSE): {len(dept_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
                
                # Status filter
                start_time = time.time()
                status_result = supabase.table('finance_operationmaintenance').select('*').eq('status', 'pending').limit(10).execute()
                end_time = time.time()
                print(f"   Status filter (pending): {len(status_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
                
                # Search filter
                start_time = time.time()
                search_result = supabase.table('finance_operationmaintenance').select('*').or_('asset.ilike.%AC%,request_id.ilike.%MNT%').limit(10).execute()
                end_time = time.time()
                print(f"   Search filter (AC/MNT): {len(search_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
                
                return True
            else:
                print("❌ No summary data returned")
                return False
        else:
            print("❌ No data returned")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def simulate_backend_response():
    """Simulate the exact backend response structure"""
    print("\n🌐 SIMULATING BACKEND RESPONSE")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Simulate the get_maintenance function
        page = 1
        limit = 50
        
        # Build query (same as backend)
        query = supabase.table('finance_operationmaintenance').select('*')
        response = query.range((page - 1) * limit, page * limit - 1).execute()
        
        # Get summary data (same as backend)
        summary_response = supabase.table('finance_operationmaintenance').select('status, cost').execute()
        
        # Calculate summary (same as backend)
        total_requests = 0
        pending_requests = 0
        in_progress_requests = 0
        resolved_requests = 0
        total_cost = 0
        
        if summary_response.data:
            for maintenance in summary_response.data:
                total_requests += 1
                total_cost += maintenance.get('cost', 0)
                status = maintenance.get('status', '').lower()
                if status == 'pending':
                    pending_requests += 1
                elif status == 'in progress':
                    in_progress_requests += 1
                elif status == 'resolved':
                    resolved_requests += 1
        
        # Create response structure (same as backend)
        backend_response = {
            'success': True,
            'data': response.data if response.data else [],
            'summary': {
                'totalRequests': total_requests,
                'pendingRequests': pending_requests,
                'inProgressRequests': in_progress_requests,
                'resolvedRequests': resolved_requests,
                'totalCost': total_cost
            }
        }
        
        print("✅ Backend response structure created successfully")
        print(f"📊 Data records: {len(backend_response['data'])}")
        print(f"📈 Summary: {backend_response['summary']}")
        
        # Test frontend mapping
        if backend_response['data']:
            sample = backend_response['data'][0]
            frontend_mapping = {
                'id': 'id',  # Assuming there's an id field
                'requestId': 'request_id',
                'assetName': 'asset',
                'department': 'department',
                'issueDescription': 'issue_description',
                'reportedDate': 'reported_date',
                'resolvedDate': 'resolved_date',
                'maintenanceCost': 'cost',
                'status': 'status'
            }
            
            print(f"\n🔄 Frontend mapping verification:")
            for frontend_field, backend_field in frontend_mapping.items():
                exists = backend_field in sample
                print(f"   {frontend_field} <- {backend_field}: {'✅' if exists else '❌'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 DIRECT DATA ACCESS TEST")
    print("=" * 60)
    print(f"📅 Test started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    tests = [
        ("Direct Data Access", test_direct_data_access),
        ("Backend Response Simulation", simulate_backend_response),
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
    print("📋 DIRECT ACCESS TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:30} : {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Direct data access is working correctly!")
        print("💡 The backend logic should work when authentication is properly handled.")
    else:
        print("⚠️  Some tests failed.")

if __name__ == "__main__":
    main()
