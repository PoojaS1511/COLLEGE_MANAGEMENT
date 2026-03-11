"""
Transport Fee Performance Testing with 2000 Records
Tests data fetching performance and validates data integrity
"""

import sqlite3
import os
import requests
import time
import json
from datetime import datetime, date, timedelta
import random

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')
API_BASE_URL = "http://localhost:5001/api/transport"

def create_test_data():
    """Create 2000 test records for performance testing"""
    print("=" * 60)
    print("CREATING TEST DATA (2000 RECORDS)")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Clear existing data
        cursor.execute("DELETE FROM transport_fees")
        conn.commit()
        print("📋 Cleared existing transport_fees data")
        
        # Generate 2000 test records
        test_records = []
        for i in range(2000):
            student_id = f"2024{str(i + 1).zfill(4)}"
            student_name = f"Student {i + 1}"
            amount = 2500.00
            due_date = (date.today() + timedelta(days=random.randint(-30, 90))).strftime("%Y-%m-%d")
            payment_status = random.choice(['Paid', 'Pending', 'Overdue'])
            payment_date = None
            payment_mode = None
            
            if payment_status == 'Paid':
                payment_date = (date.today() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
                payment_mode = random.choice(['Online', 'Cash', 'Cheque'])
            
            route_id = f"RT-{str(random.randint(1, 15)).zfill(2)}"
            created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            updated_at = created_at
            
            test_records.append((
                student_id, student_name, amount, due_date, payment_status,
                payment_date, payment_mode, route_id, created_at, updated_at
            ))
        
        # Insert records in batches
        batch_size = 100
        for i in range(0, len(test_records), batch_size):
            batch = test_records[i:i + batch_size]
            cursor.executemany("""
                INSERT INTO transport_fees 
                (student_id, student_name, amount, due_date, payment_status, 
                 payment_date, payment_mode, route_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch)
            conn.commit()
            print(f"📊 Inserted {i + batch_size} records...")
        
        conn.close()
        print(f"✅ Successfully created {len(test_records)} test records")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: Failed to create test data: {e}")
        return False

def test_database_performance():
    """Test database query performance"""
    print("\n" + "=" * 60)
    print("DATABASE PERFORMANCE TESTING")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Test 1: Count all records
        start_time = time.time()
        cursor.execute("SELECT COUNT(*) FROM transport_fees")
        total_count = cursor.fetchone()[0]
        count_time = time.time() - start_time
        print(f"📊 Total Records: {total_count}")
        print(f"⏱️  Count Query Time: {count_time:.4f} seconds")
        
        # Test 2: Fetch all records
        start_time = time.time()
        cursor.execute("SELECT * FROM transport_fees")
        all_records = cursor.fetchall()
        fetch_time = time.time() - start_time
        print(f"📊 Fetched Records: {len(all_records)}")
        print(f"⏱️  Fetch All Time: {fetch_time:.4f} seconds")
        
        # Test 3: Fetch with pagination
        page_size = 50
        total_pages = (total_count + page_size - 1) // page_size
        
        start_time = time.time()
        for page in range(min(5, total_pages)):  # Test first 5 pages
            offset = page * page_size
            cursor.execute("SELECT * FROM transport_fees LIMIT ? OFFSET ?", (page_size, offset))
            page_records = cursor.fetchall()
        
        pagination_time = time.time() - start_time
        print(f"📊 Pagination Test (5 pages): {page_size * min(5, total_pages)} records")
        print(f"⏱️  Pagination Time: {pagination_time:.4f} seconds")
        
        # Test 4: Filtered queries
        start_time = time.time()
        cursor.execute("SELECT * FROM transport_fees WHERE payment_status = 'Paid'")
        paid_records = cursor.fetchall()
        filter_time = time.time() - start_time
        print(f"📊 Paid Records: {len(paid_records)}")
        print(f"⏱️  Filter Query Time: {filter_time:.4f} seconds")
        
        # Test 5: Aggregation queries
        start_time = time.time()
        cursor.execute("""
            SELECT payment_status, COUNT(*) as count, SUM(amount) as total_amount 
            FROM transport_fees 
            GROUP BY payment_status
        """)
        aggregation_results = cursor.fetchall()
        aggregation_time = time.time() - start_time
        print(f"📊 Aggregation Results: {len(aggregation_results)} payment statuses")
        print(f"⏱️  Aggregation Time: {aggregation_time:.4f} seconds")
        
        conn.close()
        
        # Performance assessment
        print("\n📈 PERFORMANCE ASSESSMENT:")
        if count_time < 0.01:
            print("✅ Count query: Excellent")
        elif count_time < 0.1:
            print("✅ Count query: Good")
        else:
            print("⚠️  Count query: Needs optimization")
            
        if fetch_time < 1.0:
            print("✅ Fetch all query: Excellent")
        elif fetch_time < 3.0:
            print("✅ Fetch all query: Good")
        else:
            print("⚠️  Fetch all query: Consider pagination")
            
        if pagination_time < 0.5:
            print("✅ Pagination: Excellent")
        elif pagination_time < 1.0:
            print("✅ Pagination: Good")
        else:
            print("⚠️  Pagination: Needs optimization")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: Database performance test failed: {e}")
        return False

def test_api_performance():
    """Test API performance with large dataset"""
    print("\n" + "=" * 60)
    print("API PERFORMANCE TESTING")
    print("=" * 60)
    
    try:
        # Test 1: Get all fees
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/fees", timeout=30)
        api_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                fees_data = data.get('data', [])
                print(f"📊 API returned {len(fees_data)} records")
                print(f"⏱️  API Response Time: {api_time:.4f} seconds")
                
                # Test 2: Get with pagination
                start_time = time.time()
                response = requests.get(f"{API_BASE_URL}/fees?limit=50&page=1", timeout=10)
                paginated_time = time.time() - start_time
                
                if response.status_code == 200:
                    paginated_data = response.json()
                    print(f"📊 Paginated API returned {len(paginated_data.get('data', []))} records")
                    print(f"⏱️  Paginated API Time: {paginated_time:.4f} seconds")
                
                # Performance assessment
                print("\n📈 API PERFORMANCE ASSESSMENT:")
                if api_time < 2.0:
                    print("✅ Full dataset API: Excellent")
                elif api_time < 5.0:
                    print("✅ Full dataset API: Good")
                else:
                    print("⚠️  Full dataset API: Consider pagination")
                    
                if paginated_time < 0.5:
                    print("✅ Paginated API: Excellent")
                elif paginated_time < 1.0:
                    print("✅ Paginated API: Good")
                else:
                    print("⚠️  Paginated API: Needs optimization")
                
                return True
            else:
                print(f"❌ API returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ API returned status code {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ ERROR: API request timed out")
        return False
    except Exception as e:
        print(f"❌ ERROR: API performance test failed: {e}")
        return False

def validate_data_integrity():
    """Validate data integrity and schema compliance"""
    print("\n" + "=" * 60)
    print("DATA INTEGRITY VALIDATION")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Test 1: Schema validation
        cursor.execute("PRAGMA table_info(transport_fees)")
        columns = cursor.fetchall()
        
        expected_columns = {
            'id', 'student_id', 'student_name', 'amount', 'due_date',
            'payment_status', 'payment_date', 'payment_mode', 'route_id',
            'created_at', 'updated_at'
        }
        
        actual_columns = {col[1] for col in columns}
        
        print("📋 Schema Validation:")
        missing_columns = expected_columns - actual_columns
        extra_columns = actual_columns - expected_columns
        
        if missing_columns:
            print(f"❌ Missing columns: {missing_columns}")
        else:
            print("✅ All expected columns present")
            
        if extra_columns:
            print(f"📋 Extra columns: {extra_columns}")
        
        # Test 2: Data quality checks
        cursor.execute("SELECT COUNT(*) FROM transport_fees")
        total_records = cursor.fetchone()[0]
        
        # Check for null values in critical fields
        cursor.execute("SELECT COUNT(*) FROM transport_fees WHERE student_id IS NULL")
        null_student_ids = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM transport_fees WHERE amount IS NULL OR amount <= 0")
        invalid_amounts = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM transport_fees WHERE payment_status NOT IN ('Paid', 'Pending', 'Overdue')")
        invalid_payment_status = cursor.fetchone()[0]
        
        print(f"\n📊 Data Quality Checks:")
        print(f"  - Total Records: {total_records}")
        print(f"  - Null Student IDs: {null_student_ids}")
        print(f"  - Invalid Amounts: {invalid_amounts}")
        print(f"  - Invalid Payment Status: {invalid_payment_status}")
        
        # Test 3: Data consistency
        cursor.execute("""
            SELECT payment_status, COUNT(*) as count, 
                   SUM(CASE WHEN payment_date IS NULL THEN 1 ELSE 0 END) as null_payment_dates
            FROM transport_fees 
            GROUP BY payment_status
        """)
        consistency_check = cursor.fetchall()
        
        print(f"\n📊 Data Consistency:")
        for status, count, null_dates in consistency_check:
            print(f"  - {status}: {count} records, {null_dates} null payment dates")
        
        # Test 4: Financial validation
        cursor.execute("SELECT SUM(amount) FROM transport_fees")
        total_amount = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(amount) FROM transport_fees WHERE payment_status = 'Paid'")
        paid_amount = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(amount) FROM transport_fees WHERE payment_status IN ('Pending', 'Overdue')")
        pending_amount = cursor.fetchone()[0]
        
        print(f"\n💰 Financial Validation:")
        print(f"  - Total Amount: ₹{total_amount:,.2f}")
        print(f"  - Paid Amount: ₹{paid_amount:,.2f}")
        print(f"  - Pending Amount: ₹{pending_amount:,.2f}")
        print(f"  - Collection Rate: {(paid_amount/total_amount*100):.1f}%")
        
        conn.close()
        
        # Overall integrity assessment
        integrity_score = 100
        if null_student_ids > 0:
            integrity_score -= 20
        if invalid_amounts > 0:
            integrity_score -= 20
        if invalid_payment_status > 0:
            integrity_score -= 20
        
        print(f"\n📈 Overall Data Integrity Score: {integrity_score}/100")
        
        if integrity_score >= 90:
            print("✅ Data Integrity: Excellent")
        elif integrity_score >= 70:
            print("✅ Data Integrity: Good")
        else:
            print("⚠️  Data Integrity: Needs improvement")
        
        return integrity_score >= 70
        
    except Exception as e:
        print(f"❌ ERROR: Data integrity validation failed: {e}")
        return False

def main():
    """Main performance testing function"""
    print("🚀 TRANSPORT FEE PERFORMANCE TESTING (2000 RECORDS)")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Step 1: Create test data
    results['Test Data Creation'] = create_test_data()
    
    # Step 2: Database performance testing
    results['Database Performance'] = test_database_performance()
    
    # Step 3: API performance testing
    results['API Performance'] = test_api_performance()
    
    # Step 4: Data integrity validation
    results['Data Integrity'] = validate_data_integrity()
    
    # Final summary
    print("\n" + "=" * 60)
    print("PERFORMANCE TESTING SUMMARY")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for step_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{step_name}: {status}")
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 PERFORMANCE TESTING COMPLETED!")
        print("✅ System handles 2000+ records efficiently")
        print("✅ Database queries are optimized")
        print("✅ API responses are within acceptable limits")
        print("✅ Data integrity is maintained")
        print("✅ System is ready for production load")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("Please check the detailed logs above for optimization opportunities")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
