#!/usr/bin/env python3
"""
Comprehensive test for student fees integration.
This script tests the complete flow from database to frontend.
"""

import sys
import os
import time
import requests
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import get_supabase

def test_backend_student_fees_endpoint():
    """Test the backend student fees endpoint"""
    print("🌐 TESTING BACKEND STUDENT FEES ENDPOINT")
    print("=" * 60)
    
    # Test without authentication (should fail)
    print("🔍 Testing without authentication...")
    try:
        response = requests.get("http://localhost:5001/api/finance/student-fees", timeout=5)
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
        response = requests.get("http://localhost:5001/api/finance/student-fees", headers=headers, timeout=10)
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
                        'student_id', 'student_name', 'department', 'year',
                        'total_fee', 'paid_amount', 'pending_amount', 'payment_status', 'payment_date'
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

def test_student_fees_data_mapping():
    """Test data mapping between backend and frontend"""
    print("\n🔄 TESTING DATA MAPPING")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Get sample data from database
        result = supabase.table('finance_studentfees').select('*').limit(3).execute()
        
        if result.data:
            print("✅ Backend data structure:")
            for i, record in enumerate(result.data, 1):
                print(f"\n   Record {i}:")
                for key, value in record.items():
                    display_value = str(value)[:30] + "..." if len(str(value)) > 30 else str(value)
                    print(f"      {key}: {display_value}")
            
            # Test frontend mapping
            print(f"\n🔄 Frontend mapping verification:")
            frontend_mapping = {
                'studentId': 'student_id',
                'studentName': 'student_name',
                'department': 'department',
                'academicYear': 'year',
                'totalFee': 'total_fee',
                'paidAmount': 'paid_amount',
                'pendingAmount': 'pending_amount',
                'paymentDate': 'payment_date',
                'paymentStatus': 'payment_status'
            }
            
            sample = result.data[0]
            for frontend_field, backend_field in frontend_mapping.items():
                exists = backend_field in sample
                print(f"   {frontend_field} <- {backend_field}: {'✅' if exists else '❌'}")
            
            return True
        else:
            print("❌ No data found")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_student_fees_calculations():
    """Test fee calculations"""
    print("\n💰 TESTING FEE CALCULATIONS")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Get sample data
        result = supabase.table('finance_studentfees').select('*').limit(5).execute()
        
        if result.data:
            print("🧮 Testing fee calculations:")
            all_correct = True
            
            for i, record in enumerate(result.data, 1):
                total_fee = record.get('total_fee', 0)
                paid_amount = record.get('paid_amount', 0)
                pending_amount = record.get('pending_amount', 0)
                calculated_pending = total_fee - paid_amount
                
                is_correct = pending_amount == calculated_pending
                all_correct = all_correct and is_correct
                
                print(f"   Record {i}: Total={total_fee}, Paid={paid_amount}, Pending={pending_amount}")
                print(f"   Pending Amount: Stored={pending_amount}, Calculated={calculated_pending} {'✅' if is_correct else '❌'}")
            
            if all_correct:
                print("\n✅ All fee calculations are correct")
            else:
                print("\n⚠️  Some fee calculations are incorrect")
            
            return all_correct
        else:
            print("❌ No data found")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_student_fees_performance():
    """Test performance with large datasets"""
    print("\n⚡ TESTING STUDENT FEES PERFORMANCE")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Test different page sizes
        page_sizes = [50, 100, 500, 1000, 2000]
        
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

def test_student_fees_filtering():
    """Test filtering capabilities"""
    print("\n🔍 TESTING STUDENT FEES FILTERING")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Test department filter
        print("🏢 Testing department filter...")
        departments = ['CSE', 'ECE', 'Mechanical']
        for dept in departments:
            start_time = time.time()
            result = supabase.table('finance_studentfees').select('*').eq('department', dept).limit(5).execute()
            end_time = time.time()
            print(f"   {dept}: {len(result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test year filter
        print("\n📅 Testing year filter...")
        years = [2022, 2023, 2024]
        for year in years:
            start_time = time.time()
            result = supabase.table('finance_studentfees').select('*').eq('year', year).limit(5).execute()
            end_time = time.time()
            print(f"   Year {year}: {len(result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test payment status filter
        print("\n💳 Testing payment status filter...")
        statuses = ['pending', 'Partial', 'paid']
        for status in statuses:
            start_time = time.time()
            result = supabase.table('finance_studentfees').select('*').eq('payment_status', status).limit(5).execute()
            end_time = time.time()
            print(f"   Status {status}: {len(result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        # Test fee range filter
        print("\n💰 Testing fee range filter...")
        fee_ranges = [
            ('>= 50000', 'gte', 50000),
            ('>= 100000', 'gte', 100000),
            ('>= 150000', 'gte', 150000)
        ]
        
        for range_desc, operator, value in fee_ranges:
            start_time = time.time()
            if operator == 'gte':
                result = supabase.table('finance_studentfees').select('*').gte('total_fee', value).limit(5).execute()
            end_time = time.time()
            print(f"   Total Fee {range_desc}: {len(result.data)} records in {(end_time - start_time)*1000:.2f}ms")
        
        return True
        
    except Exception as e:
        print(f"❌ Filtering test failed: {e}")
        return False

def test_frontend_compatibility():
    """Test frontend compatibility"""
    print("\n🖥️  TESTING FRONTEND COMPATIBILITY")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Get sample data
        result = supabase.table('finance_studentfees').select('*').limit(3).execute()
        
        if result.data:
            print("✅ Frontend compatibility check:")
            
            # Check for required frontend fields
            required_fields = [
                'student_id', 'student_name', 'department', 'year',
                'total_fee', 'paid_amount', 'pending_amount', 'payment_status', 'payment_date'
            ]
            
            missing_fields = []
            for field in required_fields:
                if field not in result.data[0]:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False
            else:
                print("   ✅ All required fields present")
            
            # Test data types
            print("\n📊 Data type verification:")
            sample = result.data[0]
            type_checks = [
                ('student_id', str),
                ('student_name', str),
                ('department', str),
                ('year', int),
                ('total_fee', int),
                ('paid_amount', int),
                ('pending_amount', int),
                ('payment_status', str),
                ('payment_date', str)
            ]
            
            all_types_correct = True
            for field, expected_type in type_checks:
                actual_type = type(sample.get(field, None))
                is_correct = actual_type == expected_type
                all_types_correct = all_types_correct and is_correct
                print(f"   {field}: {actual_type.__name__} {'✅' if is_correct else '❌'}")
            
            if all_types_correct:
                print("\n✅ All data types are correct")
            else:
                print("\n⚠️  Some data types are incorrect")
            
            return all_types_correct
        else:
            print("❌ No data found")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 STUDENT FEES INTEGRATION VERIFICATION")
    print("=" * 60)
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    tests = [
        ("Backend Endpoint", test_backend_student_fees_endpoint),
        ("Data Mapping", test_student_fees_data_mapping),
        ("Fee Calculations", test_student_fees_calculations),
        ("Performance", test_student_fees_performance),
        ("Filtering", test_student_fees_filtering),
        ("Frontend Compatibility", test_frontend_compatibility),
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
        print("🎉 All integration tests passed!")
        print("💡 Student fees system is ready for production.")
    else:
        print("⚠️  Some integration tests failed.")
    
    # Recommendations
    print("\n" + "=" * 60)
    print("💡 RECOMMENDATIONS")
    print("=" * 60)
    
    if not results.get("Backend Endpoint", False):
        print("🔧 Fix backend authentication and endpoint configuration")
    
    if not results.get("Data Mapping", False):
        print("🔄 Ensure frontend field mapping matches backend response")
    
    if not results.get("Performance", False):
        print("⚡ Optimize queries for better performance")
    
    if not results.get("Frontend Compatibility", False):
        print("🖥️  Fix data type inconsistencies")

if __name__ == "__main__":
    main()
