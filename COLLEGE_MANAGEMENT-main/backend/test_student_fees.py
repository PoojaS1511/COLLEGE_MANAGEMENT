#!/usr/bin/env python3
"""
Test script to verify Supabase connection and finance_studentfees table access.
This script will test:
1. Supabase connection
2. finance_studentfees table existence and schema
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

def test_student_fees_table():
    """Test finance_studentfees table existence and schema"""
    print("\n" + "="*60)
    print("📋 TESTING finance_studentfees TABLE")
    print("="*60)
    
    expected_schema = {
        'student_id': 'text',
        'student_name': 'text', 
        'department': 'text',
        'year': 'bigint',
        'total_fee': 'bigint',
        'paid_amount': 'bigint',
        'pending_amount': 'bigint',
        'payment_status': 'text',
        'payment_date': 'text'
    }
    
    try:
        supabase = get_supabase()
        
        # Test table existence by trying to select a small sample
        start_time = time.time()
        result = supabase.table('finance_studentfees').select('*').limit(1).execute()
        end_time = time.time()
        
        if result.data is None:
            print("❌ Table 'finance_studentfees' does not exist or is not accessible")
            return False
            
        print("✅ Table 'finance_studentfees' exists and is accessible")
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

def test_student_fees_record_count():
    """Test record count (should be ~2000)"""
    print("\n" + "="*60)
    print("🔢 TESTING STUDENT FEES RECORD COUNT")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Get exact count
        start_time = time.time()
        count_result = supabase.table('finance_studentfees').select('student_id', count='exact').execute()
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

def test_student_fees_data_structure():
    """Test data structure and sample records"""
    print("\n" + "="*60)
    print("📊 TESTING STUDENT FEES DATA STRUCTURE")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Get sample records
        start_time = time.time()
        result = supabase.table('finance_studentfees').select('*').limit(5).execute()
        end_time = time.time()
        
        if result.data and len(result.data) > 0:
            print(f"✅ Retrieved {len(result.data)} sample records")
            print(f"⏱️  Query time: {(end_time - start_time)*1000:.2f}ms")
            
            # Show sample records
            for i, record in enumerate(result.data[:3], 1):
                print(f"\n📄 Sample Record {i}:")
                for key, value in record.items():
                    display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                    print(f"   {key}: {display_value}")
            
            # Test fee calculations
            print(f"\n💰 Testing fee calculations:")
            for i, record in enumerate(result.data[:3], 1):
                total_fee = record.get('total_fee', 0)
                paid_amount = record.get('paid_amount', 0)
                pending_amount = record.get('pending_amount', 0)
                calculated_pending = total_fee - paid_amount
                
                print(f"   Record {i}: Total={total_fee}, Paid={paid_amount}, Pending={pending_amount}")
                print(f"   Pending Amount: Stored={pending_amount}, Calculated={calculated_pending}")
                print(f"   Match: {'✅' if pending_amount == calculated_pending else '❌'}")
            
            return True
        else:
            print("❌ No sample records found")
            return False
            
    except Exception as e:
        print(f"❌ Data structure test failed: {e}")
        return False

def test_student_fees_performance():
    """Test performance with different page sizes"""
    print("\n" + "="*60)
    print("⚡ TESTING STUDENT FEES PERFORMANCE")
    print("="*60)
    
    page_sizes = [10, 50, 100, 500, 1000]
    
    try:
        supabase = get_supabase()
        
        for page_size in page_sizes:
            start_time = time.time()
            result = supabase.table('finance_studentfees').select('*').limit(page_size).execute()
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

def test_student_fees_rls():
    """Test Row Level Security policies"""
    print("\n" + "="*60)
    print("🔒 TESTING STUDENT FEES RLS POLICIES")
    print("="*60)
    
    try:
        # Test with anon client (should have limited access)
        supabase_anon = get_supabase(admin=False)
        
        start_time = time.time()
        try:
            result = supabase_anon.table('finance_studentfees').select('count').execute()
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
        result = supabase_admin_client.table('finance_studentfees').select('count').execute()
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

def test_student_fees_filtering():
    """Test filtering capabilities"""
    print("\n" + "="*60)
    print("🔍 TESTING STUDENT FEES FILTERING")
    print("="*60)
    
    try:
        supabase = get_supabase()
        
        # Test department filter
        print("🏢 Testing department filter...")
        start_time = time.time()
        dept_result = supabase.table('finance_studentfees').select('*').eq('department', 'CSE').limit(10).execute()
        end_time = time.time()
        print(f"   CSE department: {len(dept_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test year filter
        print("📅 Testing year filter...")
        start_time = time.time()
        year_result = supabase.table('finance_studentfees').select('*').eq('year', 2023).limit(10).execute()
        end_time = time.time()
        print(f"   Year 2023: {len(year_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test payment status filter
        print("💳 Testing payment status filter...")
        start_time = time.time()
        status_result = supabase.table('finance_studentfees').select('*').eq('payment_status', 'paid').limit(10).execute()
        end_time = time.time()
        print(f"   Paid status: {len(status_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test fee range filter
        print("💰 Testing fee range filter...")
        start_time = time.time()
        fee_result = supabase.table('finance_studentfees').select('*').gte('total_fee', 50000).limit(10).execute()
        end_time = time.time()
        print(f"   Total fee >= 50000: {len(fee_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test search filter
        print("🔍 Testing search filter...")
        start_time = time.time()
        search_result = supabase.table('finance_studentfees').select('*').ilike('student_name', '%John%').limit(10).execute()
        end_time = time.time()
        print(f"   Name contains 'John': {len(search_result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        return True
        
    except Exception as e:
        print(f"❌ Filtering test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 SUPABASE & finance_studentfees VERIFICATION")
    print("=" * 60)
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    tests = [
        ("Table Schema Test", test_student_fees_table),
        ("Record Count Test", test_student_fees_record_count),
        ("Data Structure Test", test_student_fees_data_structure),
        ("Performance Test", test_student_fees_performance),
        ("RLS Test", test_student_fees_rls),
        ("Filtering Test", test_student_fees_filtering),
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
        print("🎉 All tests passed! finance_studentfees integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    # Recommendations
    print("\n" + "="*60)
    print("💡 RECOMMENDATIONS")
    print("="*60)
    
    if not results.get("Record Count Test", 0):
        print("📝 Table appears to be empty. Consider adding sample data.")
    
    if not results.get("Performance Test", False):
        print("⚡ Consider adding indexes to improve query performance.")
    
    if not results.get("RLS Test", False):
        print("🔒 Review RLS policies to ensure proper access control.")

if __name__ == "__main__":
    main()
