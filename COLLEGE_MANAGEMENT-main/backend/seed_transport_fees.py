
import os
import sys
import random
import json
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from supabase_client import get_supabase

# Use admin client
supabase = get_supabase(admin=True)

def seed_fees():
    try:
        print("Fetching students and routes for reference...")
        students = supabase.table('transport_students').select('id, name, route_name').execute().data
        if not students:
            print("No students found. Please seed students first.")
            return

        print(f"Found {len(students)} students. Generating ~2000 fee records...")
        
        fees = []
        academic_years = ['2023-24', '2024-25']
        statuses = ['Paid', 'Pending', 'Overdue', 'Partial']
        
        for i in range(2000):
            student = random.choice(students)
            status = random.choice(statuses)
            fee_amount = 2500.00
            
            if status == 'Paid':
                paid_amount = fee_amount
            elif status == 'Partial':
                paid_amount = 1000.00
            else:
                paid_amount = 0.00
                
            fee = {
                'student_id': student['id'], # Use UUID id
                'route_name': student['route_name'] or 'Unknown Route',
                'bus_no': f"BUS-0{random.randint(1, 2)}",
                'fee_amount': fee_amount,
                'paid_amount': paid_amount,
                'payment_status': status,
                'payment_date': (datetime.now() - timedelta(days=random.randint(1, 100))).strftime('%Y-%m-%d') if status == 'Paid' else None,
                'academic_year': random.choice(academic_years)
            }
            fees.append(fee)
            
            # Batch insert every 500 records
            if len(fees) >= 500:
                supabase.table('transport_fee').insert(fees).execute()
                print(f"Inserted {i+1} records...")
                fees = []
        
        if fees:
            supabase.table('transport_fee').insert(fees).execute()
            
        print("Successfully seeded ~2000 fee records.")

    except Exception as e:
        print(f"Error seeding fees: {e}")

if __name__ == "__main__":
    seed_fees()
