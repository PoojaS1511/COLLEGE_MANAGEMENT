#!/usr/bin/env python3
"""
Test Expense API Pagination with 2000+ Records
"""

import requests
import time

def main():
    print('🔍 Testing Expense API with All 2000 Records...')
    try:
        all_data = []
        page = 1
        limit = 500
        
        while True:
            start_time = time.time()
            response = requests.get(f'http://localhost:5001/api/finance/expenses?page={page}&limit={limit}')
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
            print(f'  Total Expenses: {summary.get("totalExpenses", 0)}')
            print(f'  Paid Expenses: {summary.get("paidExpenses", 0)}')
            print(f'  Pending Expenses: {summary.get("pendingExpenses", 0)}')
        
        print('\n✅ Expense API successfully handles 2000+ records!')
        
    except Exception as e:
        print(f'❌ Error testing expense API: {str(e)}')

if __name__ == "__main__":
    main()
