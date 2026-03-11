#!/usr/bin/env python3
"""
Performance Test for 2000+ records in transport_students table
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import time
import requests
import json
from supabase_client import get_supabase
import os
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:5001/api')

def test_current_record_count():
    """Check current record count in transport_students"""
    print("🔍 Checking Current Record Count...")
    
    try:
        supabase = get_supabase()
        
        # Get total count
        start_time = time.time()
        count_result = supabase.table('transport_students').select('id', count='exact').execute()
        end_time = time.time()
        
        if count_result.data:
            total_count = len(count_result.data)
            query_time = end_time - start_time
            
            print(f"📊 Current record count: {total_count}")
            print(f"⏱️  Count query time: {query_time:.3f} seconds")
            
            return total_count, query_time
        else:
            print("❌ Could not fetch record count")
            return 0, 0
            
    except Exception as e:
        print(f"❌ Error checking record count: {str(e)}")
        return 0, 0

def test_backend_api_performance():
    """Test backend API performance with current data"""
    print("\n🔍 Testing Backend API Performance...")
    
    try:
        # Test API response time
        start_time = time.time()
        response = requests.get(f'{API_BASE}/transport/students', timeout=30)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            api_time = end_time - start_time
            
            if data.get('success') and data.get('data'):
                record_count = len(data['data'])
                
                print(f"✅ API returned {record_count} records")
                print(f"⏱️  API response time: {api_time:.3f} seconds")
                print(f"📈 Records per second: {record_count/api_time:.1f}")
                
                # Test with filters
                print("\n🔍 Testing API with filters...")
                
                # Test status filter
                start_time = time.time()
                filtered_response = requests.get(f'{API_BASE}/transport/students?status=active', timeout=30)
                end_time = time.time()
                
                if filtered_response.status_code == 200:
                    filtered_data = filtered_response.json()
                    filtered_time = end_time - start_time
                    filtered_count = len(filtered_data.get('data', []))
                    
                    print(f"✅ Filtered API returned {filtered_count} active records")
                    print(f"⏱️  Filtered API response time: {filtered_time:.3f} seconds")
                
                return record_count, api_time
            else:
                print(f"❌ API returned error: {data.get('error', 'Unknown error')}")
                return 0, 0
        else:
            print(f"❌ API returned status: {response.status_code}")
            return 0, 0
            
    except Exception as e:
        print(f"❌ Error testing API performance: {str(e)}")
        return 0, 0

def test_pagination_performance():
    """Test pagination performance"""
    print("\n🔍 Testing Pagination Performance...")
    
    try:
        # Test different page sizes
        page_sizes = [10, 25, 50, 100, 200]
        
        for page_size in page_sizes:
            start_time = time.time()
            response = requests.get(f'{API_BASE}/transport/students?limit={page_size}', timeout=30)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                api_time = end_time - start_time
                
                if data.get('success') and data.get('data'):
                    record_count = len(data['data'])
                    print(f"✅ Page size {page_size}: {record_count} records in {api_time:.3f}s")
                else:
                    print(f"❌ Page size {page_size}: API error")
            else:
                print(f"❌ Page size {page_size}: HTTP {response.status_code}")
        
        return True
    except Exception as e:
        print(f"❌ Error testing pagination: {str(e)}")
        return False

def test_search_performance():
    """Test search performance"""
    print("\n🔍 Testing Search Performance...")
    
    try:
        # Test different search terms
        search_terms = ['active', '2025', 'gmail', 'radh']
        
        for term in search_terms:
            start_time = time.time()
            response = requests.get(f'{API_BASE}/transport/students?search={term}', timeout=30)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                search_time = end_time - start_time
                
                if data.get('success') and data.get('data'):
                    record_count = len(data['data'])
                    print(f"✅ Search '{term}': {record_count} results in {search_time:.3f}s")
                else:
                    print(f"❌ Search '{term}': API error")
            else:
                print(f"❌ Search '{term}': HTTP {response.status_code}")
        
        return True
    except Exception as e:
        print(f"❌ Error testing search: {str(e)}")
        return False

def test_memory_usage():
    """Test memory usage with large datasets"""
    print("\n🔍 Testing Memory Usage...")
    
    try:
        import psutil
        import gc
        
        # Get baseline memory
        process = psutil.Process()
        baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        print(f"📊 Baseline memory: {baseline_memory:.1f} MB")
        
        # Fetch all data
        response = requests.get(f'{API_BASE}/transport/students', timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('data'):
                records = data['data']
                peak_memory = process.memory_info().rss / 1024 / 1024  # MB
                
                print(f"📊 Peak memory after loading {len(records)} records: {peak_memory:.1f} MB")
                print(f"📈 Memory increase: {peak_memory - baseline_memory:.1f} MB")
                print(f"📊 Memory per record: {(peak_memory - baseline_memory) / len(records) * 1024:.1f} KB")
                
                # Clear memory
                del records
                gc.collect()
                
                final_memory = process.memory_info().rss / 1024 / 1024  # MB
                print(f"📊 Memory after cleanup: {final_memory:.1f} MB")
                
                return True
        
        return False
    except ImportError:
        print("⚠️  psutil not available for memory testing")
        return True
    except Exception as e:
        print(f"❌ Error testing memory usage: {str(e)}")
        return False

def generate_performance_report(current_count, api_time):
    """Generate performance recommendations"""
    print("\n📋 Performance Report & Recommendations")
    print("=" * 50)
    
    # Calculate expected performance for 2000 records
    if current_count > 0 and api_time > 0:
        records_per_second = current_count / api_time
        estimated_2000_time = 2000 / records_per_second
        
        print(f"📊 Current Performance:")
        print(f"   - Records: {current_count}")
        print(f"   - Response Time: {api_time:.3f}s")
        print(f"   - Records/sec: {records_per_second:.1f}")
        
        print(f"\n📈 Estimated Performance for 2000 records:")
        print(f"   - Estimated Response Time: {estimated_2000_time:.3f}s")
        
        # Recommendations
        print(f"\n💡 Recommendations:")
        
        if estimated_2000_time > 2.0:
            print("   ⚠️  Response time may be slow for 2000 records")
            print("   ✅ Implement pagination (limit to 50-100 records per page)")
            print("   ✅ Add indexing on frequently searched columns")
            print("   ✅ Consider server-side filtering")
        elif estimated_2000_time > 1.0:
            print("   ⚠️  Response time is acceptable but could be improved")
            print("   ✅ Consider pagination for better user experience")
            print("   ✅ Add loading indicators for large datasets")
        else:
            print("   ✅ Performance is good for current dataset size")
            print("   ✅ Still recommend pagination for scalability")
        
        # Memory recommendations
        print(f"\n🧠 Memory Recommendations:")
        print("   ✅ Use virtual scrolling for large tables")
        print("   ✅ Implement lazy loading for images")
        print("   ✅ Clear unused data from frontend state")

if __name__ == "__main__":
    print("🚀 Starting Performance Test for transport_students")
    print("=" * 60)
    
    # Run performance tests
    current_count, count_time = test_current_record_count()
    record_count, api_time = test_backend_api_performance()
    
    if record_count > 0:
        test_pagination_performance()
        test_search_performance()
        test_memory_usage()
        
        # Generate report
        generate_performance_report(record_count, api_time)
    else:
        print("❌ Cannot run performance tests - no data available")
    
    print("\n" + "=" * 60)
    print("🎯 Performance testing completed!")
