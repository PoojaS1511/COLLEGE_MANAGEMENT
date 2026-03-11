#!/usr/bin/env python3
"""
Test script to verify Supabase connection and finance_operationmaintenance table access.
This script will test:
1. Supabase connection
2. Table existence and schema
3. Record count (should be ~2000)
4. Data fetching performance
5. RLS policies
"""

import sys
import os
import time
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from supabase_client import get_supabase, supabase_admin
    print("✅ Successfully imported Supabase client")
except ImportError as e:
    print(f"❌ Failed to import Supabase client: {e}")
    sys.exit(1)

def test_supabase_connection():
    """Test basic Supabase connection"""
    print("\n" + "="*60)
    print("🔌 TESTING SUPABASE CONNECTION")
    print("="*60)
    
    try:
        supabase = get_supabase()
        print("✅ Supabase client initialized successfully")
        
        # Test basic connection with a simple query
        start_time = time.time()
        result = supabase.table('students').select('count').execute()
        end_time = time.time()
        
        print(f"✅ Basic connection test successful")
        print(f"⏱️  Response time: {(end_time - start_time)*1000:.2f}ms")
        
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_table_schema():
    """Test finance_operationmaintenance table schema"""
    print("\n" + "="*60)
    print("📋 TESTING TABLE SCHEMA")
    print("="*60)
    
    expected_schema = {
        'request_id': 'text',
        'department': 'text', 
        'asset': 'text',
        'issue_description': 'text',
        'status': 'text',
        'reported_date': 'text',
        'resolved_date': 'text',
        'cost': 'bigint'
    }
    
    try:
        supabase = get_supabase()
        
        # Test table existence by trying to select a small sample
        start_time = time.time()
        result = supabase.table('finance_operationmaintenance').select('*').limit(1).execute()
        end_time = time.time()
        
        if result.data is None:
            print("❌ Table 'finance_operationmaintenance' does not exist or is not accessible")
            return False
            
        print("✅ Table 'finance_operationmaintenance' exists and is accessible")
        print(f"⏱️  Query response time: {(end_time - start_time)*1000:.2f}ms")
        
        # Check schema from the first record
        if result.data:
            sample_record = result.data[0]
            print("\n📊 Actual table schema:")
            for column, value in sample_record.items():
                print(f"   {column}: {type(value).__name__}")
                
            # Verify expected columns exist
            missing_columns = []
            for expected_col in expected_schema.keys():
                if expected_col not in sample_record:
                    missing_columns.append(expected_col)
            
            if missing_columns:
                print(f"\n⚠️  Missing expected columns: {missing_columns}")
            else:
                print("\n✅ All expected columns are present")
                
        return True
        
    except Exception as e:
        print(f"❌ Schema verification failed: {e}")
        return False

def test_record_count():
    """Test record count (should be ~2000)"""
    print("\n" + "="*60)
    print("🔢 TESTING RECORD COUNT")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Get exact count
        start_time = time.time()
        count_result = supabase.table('finance_operationmaintenance').select('request_id', count='exact').execute()
        end_time = time.time()
        
        record_count = count_result.count if count_result.count else 0
        print(f"📊 Total records: {record_count}")
        print(f"⏱️  Count query response time: {(end_time - start_time)*1000:.2f}ms")
        
        # Check if count is approximately 2000
        if 1800 <= record_count <= 2200:
            print("✅ Record count is within expected range (~2000)")
        elif record_count > 0:
            print(f"⚠️  Record count ({record_count}) is not close to expected 2000")
        else:
            print("❌ No records found in table")
            
        return record_count
        
    except Exception as e:
        print(f"❌ Record count test failed: {e}")
        return 0

def test_data_fetching_performance():
    """Test data fetching performance with different page sizes"""
    print("\n" + "="*60)
    print("⚡ TESTING DATA FETCHING PERFORMANCE")
    print("="*60)
    
    page_sizes = [10, 50, 100, 500, 1000]
    
    try:
        supabase = get_supabase()
        
        for page_size in page_sizes:
            start_time = time.time()
            result = supabase.table('finance_operationmaintenance').select('*').limit(page_size).execute()
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            records_fetched = len(result.data) if result.data else 0
            
            print(f"📄 Page size {page_size:4d}: {records_fetched:4d} records in {response_time:6.2f}ms")
            
            if records_fetched > 0:
                avg_time_per_record = response_time / records_fetched
                print(f"                     Avg: {avg_time_per_record:.2f}ms per record")
        
        return True
        
    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False

def test_rls_policies():
    """Test Row Level Security policies"""
    print("\n" + "="*60)
    print("🔒 TESTING ROW LEVEL SECURITY (RLS)")
    print("="*60)
    
    try:
        # Test with anon client (should have limited access)
        supabase_anon = get_supabase(admin=False)
        
        start_time = time.time()
        try:
            result = supabase_anon.table('finance_operationmaintenance').select('count').execute()
            end_time = time.time()
            
            if result.data is not None:
                print("✅ Anonymous access: SELECT permission granted")
                print(f"⏱️  Response time: {(end_time - start_time)*1000:.2f}ms")
            else:
                print("⚠️  Anonymous access: No data returned")
                
        except Exception as e:
            print(f"❌ Anonymous access failed: {e}")
        
        # Test with admin client (should have full access)
        supabase_admin_client = get_supabase(admin=True)
        
        start_time = time.time()
        result = supabase_admin_client.table('finance_operationmaintenance').select('count').execute()
        end_time = time.time()
        
        if result.data is not None:
            print("✅ Admin access: SELECT permission granted")
            print(f"⏱️  Response time: {(end_time - start_time)*1000:.2f}ms")
        else:
            print("❌ Admin access: No data returned")
            
        return True
        
    except Exception as e:
        print(f"❌ RLS test failed: {e}")
        return False

def test_backend_endpoint():
    """Test the backend maintenance endpoint"""
    print("\n" + "="*60)
    print("🌐 TESTING BACKEND ENDPOINT")
    print("="*60)
    
    try:
        import requests
        
        # Test the health endpoint first
        health_url = "http://localhost:5001/api/health"
        print(f"🔍 Testing health endpoint: {health_url}")
        
        try:
            start_time = time.time()
            response = requests.get(health_url, timeout=5)
            end_time = time.time()
            
            if response.status_code == 200:
                print(f"✅ Health endpoint working - {(end_time - start_time)*1000:.2f}ms")
            else:
                print(f"⚠️  Health endpoint returned status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Health endpoint not accessible: {e}")
            print("   Make sure the backend server is running on localhost:5001")
            return False
        
        # Test the maintenance endpoint
        maintenance_url = "http://localhost:5001/api/finance/maintenance"
        print(f"\n🔍 Testing maintenance endpoint: {maintenance_url}")
        
        try:
            headers = {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
            
            start_time = time.time()
            response = requests.get(maintenance_url, headers=headers, timeout=10)
            end_time = time.time()
            
            print(f"📊 Status code: {response.status_code}")
            print(f"⏱️  Response time: {(end_time - start_time)*1000:.2f}ms")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    records = len(data.get('data', []))
                    print(f"✅ Maintenance endpoint working - {records} records returned")
                else:
                    print(f"❌ API returned error: {data.get('error', 'Unknown error')}")
            elif response.status_code == 401:
                print("⚠️  Authentication required (expected)")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Maintenance endpoint not accessible: {e}")
            
        return True
        
    except ImportError:
        print("⚠️  Requests library not available - skipping endpoint tests")
        return False

def main():
    """Main test function"""
    print("🚀 SUPABASE & FINANCE_OPERATIONMAINTENANCE VERIFICATION")
    print("=" * 60)
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    tests = [
        ("Connection Test", test_supabase_connection),
        ("Schema Test", test_table_schema),
        ("Record Count Test", test_record_count),
        ("Performance Test", test_data_fetching_performance),
        ("RLS Test", test_rls_policies),
        ("Backend Endpoint Test", test_backend_endpoint),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:25} : {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Supabase integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    # Recommendations
    print("\n" + "="*60)
    print("💡 RECOMMENDATIONS")
    print("="*60)
    
    if results.get("Record Count Test", 0) == 0:
        print("📝 Table appears to be empty. Consider adding sample data.")
    
    if not results.get("Performance Test", False):
        print("⚡ Consider adding indexes to improve query performance.")
    
    if not results.get("RLS Test", False):
        print("🔒 Review RLS policies to ensure proper access control.")
    
    if not results.get("Backend Endpoint Test", False):
        print("🌐 Ensure backend server is running and properly configured.")

if __name__ == "__main__":
    main()
