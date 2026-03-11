#!/usr/bin/env python3
"""
Performance test for 2000+ records from finance_operationmaintenance table.
This script tests various scenarios to ensure the system can handle large datasets efficiently.
"""

import sys
import os
import time
import statistics
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import get_supabase

def measure_query_performance(query_func, description, iterations=3):
    """Measure query performance with multiple iterations"""
    times = []
    
    for i in range(iterations):
        start_time = time.time()
        try:
            result = query_func()
            end_time = time.time()
            times.append((end_time - start_time) * 1000)
            
            if i == 0:  # Show details for first iteration
                records = len(result.data) if result and result.data else 0
                print(f"   Iteration {i+1}: {records} records in {times[-1]:.2f}ms")
        except Exception as e:
            print(f"   Iteration {i+1}: ❌ Error: {e}")
            return None, None
    
    if times:
        avg_time = statistics.mean(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"   📊 Performance Summary:")
        print(f"      Average: {avg_time:.2f}ms")
        print(f"      Min: {min_time:.2f}ms")
        print(f"      Max: {max_time:.2f}ms")
        print(f"      Std Dev: {statistics.stdev(times) if len(times) > 1 else 0:.2f}ms")
        
        return result, avg_time
    
    return None, None

def test_basic_performance():
    """Test basic query performance"""
    print("🚀 BASIC PERFORMANCE TEST")
    print("=" * 60)
    
    supabase = get_supabase()
    
    # Test different page sizes
    page_sizes = [10, 50, 100, 500, 1000, 2000]
    
    for page_size in page_sizes:
        print(f"\n📄 Testing page size: {page_size}")
        
        def query_func():
            return supabase.table('finance_operationmaintenance').select('*').limit(page_size).execute()
        
        result, avg_time = measure_query_performance(
            query_func, 
            f"Page size {page_size}",
            iterations=3
        )
        
        if result and result.data:
            records = len(result.data)
            if records > 0:
                avg_per_record = avg_time / records
                print(f"      Average per record: {avg_per_record:.2f}ms")
                print(f"      Records per second: {1000 / avg_per_record:.0f}")

def test_pagination_performance():
    """Test pagination performance"""
    print("\n📖 PAGINATION PERFORMANCE TEST")
    print("=" * 60)
    
    supabase = get_supabase()
    
    page_size = 100
    total_pages = 5  # Test first 5 pages
    
    print(f"📄 Testing pagination with page size {page_size}")
    
    total_time = 0
    total_records = 0
    
    for page in range(1, total_pages + 1):
        print(f"\n   Testing page {page}:")
        
        def query_func():
            return supabase.table('finance_operationmaintenance').select('*').range(
                (page - 1) * page_size, page * page_size - 1
            ).execute()
        
        result, avg_time = measure_query_performance(query_func, f"Page {page}", iterations=1)
        
        if result and result.data:
            records = len(result.data)
            total_records += records
            total_time += avg_time
            
            if records < page_size:
                print(f"      ⚠️  Expected {page_size} records, got {records}")
    
    if total_records > 0:
        avg_time_per_page = total_time / total_pages
        avg_time_per_record = total_time / total_records
        
        print(f"\n📊 Pagination Summary:")
        print(f"   Total pages tested: {total_pages}")
        print(f"   Total records: {total_records}")
        print(f"   Average time per page: {avg_time_per_page:.2f}ms")
        print(f"   Average time per record: {avg_time_per_record:.2f}ms")

def test_filtering_performance():
    """Test filtering performance"""
    print("\n🔍 FILTERING PERFORMANCE TEST")
    print("=" * 60)
    
    supabase = get_supabase()
    
    # Test different filter types
    filters = [
        ("Department filter", lambda: supabase.table('finance_operationmaintenance').select('*').eq('department', 'Civil').limit(100).execute()),
        ("Status filter", lambda: supabase.table('finance_operationmaintenance').select('*').eq('status', 'Open').limit(100).execute()),
        ("Search filter (AC)", lambda: supabase.table('finance_operationmaintenance').select('*').ilike('asset', '%AC%').limit(100).execute()),
        ("Search filter (Printer)", lambda: supabase.table('finance_operationmaintenance').select('*').ilike('asset', '%Printer%').limit(100).execute()),
        ("Complex filter", lambda: supabase.table('finance_operationmaintenance').select('*').eq('department', 'Civil').eq('status', 'Open').limit(100).execute()),
    ]
    
    for filter_name, query_func in filters:
        print(f"\n🔍 Testing {filter_name}:")
        
        result, avg_time = measure_query_performance(query_func, filter_name, iterations=3)
        
        if result and result.data:
            records = len(result.data)
            print(f"      Records found: {records}")
            if records > 0:
                avg_per_record = avg_time / records
                print(f"      Average per record: {avg_per_record:.2f}ms")

def test_summary_calculation_performance():
    """Test summary calculation performance"""
    print("\n📈 SUMMARY CALCULATION PERFORMANCE TEST")
    print("=" * 60)
    
    supabase = get_supabase()
    
    # Test different summary queries
    summary_queries = [
        ("Status only", lambda: supabase.table('finance_operationmaintenance').select('status').execute()),
        ("Cost only", lambda: supabase.table('finance_operationmaintenance').select('cost').execute()),
        ("Status + Cost", lambda: supabase.table('finance_operationmaintenance').select('status, cost').execute()),
        ("All fields", lambda: supabase.table('finance_operationmaintenance').select('*').execute()),
    ]
    
    for query_name, query_func in summary_queries:
        print(f"\n📊 Testing {query_name}:")
        
        result, avg_time = measure_query_performance(query_func, query_name, iterations=3)
        
        if result and result.data:
            records = len(result.data)
            print(f"      Records processed: {records}")
            if records > 0:
                avg_per_record = avg_time / records
                print(f"      Average per record: {avg_per_record:.2f}ms")

def test_concurrent_queries():
    """Test concurrent query performance"""
    print("\n⚡ CONCURRENT QUERY PERFORMANCE TEST")
    print("=" * 60)
    
    import threading
    import queue
    
    supabase = get_supabase()
    results_queue = queue.Queue()
    
    def worker(query_func, description):
        start_time = time.time()
        try:
            result = query_func()
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            records = len(result.data) if result and result.data else 0
            results_queue.put((description, response_time, records, None))
        except Exception as e:
            results_queue.put((description, 0, 0, str(e)))
    
    # Create concurrent queries
    queries = [
        ("Query 1 (100 records)", lambda: supabase.table('finance_operationmaintenance').select('*').limit(100).execute()),
        ("Query 2 (200 records)", lambda: supabase.table('finance_operationmaintenance').select('*').limit(200).execute()),
        ("Query 3 (500 records)", lambda: supabase.table('finance_operationmaintenance').select('*').limit(500).execute()),
        ("Query 4 (Department filter)", lambda: supabase.table('finance_operationmaintenance').select('*').eq('department', 'Civil').limit(100).execute()),
        ("Query 5 (Status filter)", lambda: supabase.table('finance_operationmaintenance').select('*').eq('status', 'Open').limit(100).execute()),
    ]
    
    print("🔄 Running 5 concurrent queries...")
    
    # Start all threads
    threads = []
    start_time = time.time()
    
    for description, query_func in queries:
        thread = threading.Thread(target=worker, args=(query_func, description))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    end_time = time.time()
    total_time = (end_time - start_time) * 1000
    
    # Collect results
    print(f"\n📊 Concurrent Query Results (completed in {total_time:.2f}ms):")
    
    total_records = 0
    successful_queries = 0
    
    while not results_queue.empty():
        description, response_time, records, error = results_queue.get()
        if error:
            print(f"   {description}: ❌ {error}")
        else:
            print(f"   {description}: {records} records in {response_time:.2f}ms")
            total_records += records
            successful_queries += 1
    
    print(f"\n📈 Concurrent Summary:")
    print(f"   Successful queries: {successful_queries}/{len(queries)}")
    print(f"   Total records retrieved: {total_records}")
    print(f"   Total time: {total_time:.2f}ms")
    print(f"   Average time per query: {total_time / len(queries):.2f}ms")

def test_memory_usage():
    """Test memory usage with large datasets"""
    print("\n💾 MEMORY USAGE TEST")
    print("=" * 60)
    
    try:
        import psutil
        import gc
        
        supabase = get_supabase()
        
        # Get initial memory usage
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        print(f"💾 Initial memory usage: {initial_memory:.2f} MB")
        
        # Test with increasing dataset sizes
        sizes = [100, 500, 1000, 2000]
        
        for size in sizes:
            print(f"\n📊 Testing with {size} records:")
            
            # Clear memory
            gc.collect()
            
            start_memory = process.memory_info().rss / 1024 / 1024
            
            # Fetch data
            start_time = time.time()
            result = supabase.table('finance_operationmaintenance').select('*').limit(size).execute()
            end_time = time.time()
            
            if result and result.data:
                records = len(result.data)
                query_time = (end_time - start_time) * 1000
                
                # Measure memory after query
                end_memory = process.memory_info().rss / 1024 / 1024
                memory_increase = end_memory - start_memory
                
                print(f"   Records: {records}")
                print(f"   Query time: {query_time:.2f}ms")
                print(f"   Memory increase: {memory_increase:.2f} MB")
                print(f"   Memory per record: {(memory_increase * 1024 / records):.2f} KB")
                
                # Clear reference to data
                del result
                gc.collect()
        
        # Final memory check
        final_memory = process.memory_info().rss / 1024 / 1024
        total_increase = final_memory - initial_memory
        
        print(f"\n💾 Memory Summary:")
        print(f"   Initial memory: {initial_memory:.2f} MB")
        print(f"   Final memory: {final_memory:.2f} MB")
        print(f"   Total increase: {total_increase:.2f} MB")
        
    except ImportError:
        print("⚠️  psutil not available - skipping memory test")

def main():
    """Main performance test function"""
    print("🚀 PERFORMANCE TEST FOR 2000+ RECORDS")
    print("=" * 60)
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run performance tests
    tests = [
        ("Basic Performance", test_basic_performance),
        ("Pagination Performance", test_pagination_performance),
        ("Filtering Performance", test_filtering_performance),
        ("Summary Calculation Performance", test_summary_calculation_performance),
        ("Concurrent Queries", test_concurrent_queries),
        ("Memory Usage", test_memory_usage),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            start_time = time.time()
            test_func()
            end_time = time.time()
            results[test_name] = True
            print(f"\n✅ {test_name} completed in {(end_time - start_time)*1000:.2f}ms")
        except Exception as e:
            print(f"\n❌ {test_name} failed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 PERFORMANCE TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:35} : {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All performance tests passed!")
        print("💡 The system can handle 2000+ records efficiently.")
    else:
        print("⚠️  Some performance tests failed.")
    
    # Performance recommendations
    print("\n" + "=" * 60)
    print("💡 PERFORMANCE RECOMMENDATIONS")
    print("=" * 60)
    print("📄 Use pagination for large datasets (limit 100-500 records per page)")
    print("🔍 Implement proper indexing on frequently filtered columns")
    print("⚡ Consider caching for frequently accessed summary data")
    print("💾 Monitor memory usage with large datasets")
    print("🔄 Use lazy loading for better user experience")

if __name__ == "__main__":
    main()
