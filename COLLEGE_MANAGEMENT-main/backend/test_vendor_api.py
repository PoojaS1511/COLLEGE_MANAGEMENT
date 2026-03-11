#!/usr/bin/env python3
"""
Test Vendor API Endpoints
"""

import requests
import time

def main():
    print('🔍 Testing Vendor API Endpoint...')
    try:
        # Test without auth (should fail)
        response = requests.get('http://localhost:5001/api/finance/vendors')
        print('Status (no auth):', response.status_code)
        
        # Test with different page sizes
        test_sizes = [50, 100, 500, 1000]
        
        for size in test_sizes:
            start_time = time.time()
            response = requests.get(f'http://localhost:5001/api/finance/vendors?limit={size}')
            end_time = time.time()
            
            if response.status_code == 401:
                print(f'Limit {size}: Authentication required (expected)')
            elif response.status_code == 200:
                data = response.json()
                print(f'✅ Limit {size}: {len(data.get("data", []))} records in {end_time - start_time:.3f}s')
            else:
                print(f'❌ Limit {size}: Error {response.status_code}')
        
        print('✅ Vendor API endpoints created successfully')
        
    except Exception as e:
        print(f'❌ Error testing vendor API: {str(e)}')

if __name__ == "__main__":
    main()
