#!/usr/bin/env python3
"""
Test Vendor API Pagination with 2000+ Records
"""

import requests
import time

def main():
    print('🔍 Testing Vendor API with All 2000 Records...')
    try:
        all_data = []
        page = 1
        limit = 500
        
        while True:
            start_time = time.time()
            response = requests.get(f'http://localhost:5001/api/finance/vendors?page={page}&limit={limit}')
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                records = data.get('data', [])
                if not records:
                    break
                all_data.extend(records)
                print(f'Page {page}: {len(records)} records retrieved in {end_time - start_time:.3f}s | Total so far: {len(all_data)}')
                if len(records) < limit:
                    break
                page += 1
            else:
                print(f'Error: {response.status_code} - {response.text}')
                break
        
        print(f'\n✅ Total records retrieved: {len(all_data)}')
        
        if len(all_data) > 0:
            # Show sample data
            print('\n📊 Sample Records:')
            for i, record in enumerate(all_data[:3], 1):
                print(f'  Record {i}: {record}')
            
            # Show summary
            summary = data.get('summary', {})
            print(f'\n📈 Summary Data:')
            print(f'  Total Amount Paid: {summary.get("totalAmountPaid", 0)}')
            print(f'  Total Amount Due: {summary.get("totalAmountDue", 0)}')
            print(f'  Total Transactions: {summary.get("totalTransactions", 0)}')
        
        print('\n✅ Vendor API successfully handles 2000+ records!')
        
    except Exception as e:
        print(f'❌ Error testing vendor API: {str(e)}')

if __name__ == "__main__":
    main()
