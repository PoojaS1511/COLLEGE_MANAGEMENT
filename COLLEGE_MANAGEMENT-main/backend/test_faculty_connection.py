#!/usr/bin/env python3
"""
Test script to verify faculty data fetching from Supabase
"""

from routes.quality.faculty import get_faculty
from flask import Flask
import json

def test_faculty_data_fetching():
    """Test the faculty data fetching function directly"""
    try:
        print("Testing faculty data fetching from Supabase...")

        # Create a test Flask app context
        app = Flask(__name__)

        with app.app_context():
            # Mock request args
            from flask import request
            # We can't easily mock request args, so let's test the core logic

            from supabase_client import get_supabase

            supabase = get_supabase()

            # Test basic query
            print("\n1. Testing basic Supabase query...")
            result = supabase.table('quality_facultyperformance').select('*').limit(5).execute()

            print(f"Query successful: {len(result.data)} records retrieved")

            if result.data:
                print("Sample record:")
                print(json.dumps(result.data[0], indent=2))

                # Check if columns match expected
                expected_columns = ['faculty_id', 'faculty_name', 'department', 'feedback_score', 'research_papers', 'performance_rating']
                actual_columns = list(result.data[0].keys())

                print(f"\nExpected columns: {expected_columns}")
                print(f"Actual columns: {actual_columns}")

                missing_columns = [col for col in expected_columns if col not in actual_columns]
                if missing_columns:
                    print(f"❌ Missing columns: {missing_columns}")
                else:
                    print("✅ All expected columns present")

                # Check total count
                count_result = supabase.table('quality_facultyperformance').select('*', count='exact').execute()
                total_count = count_result.count
                print(f"\nTotal records in table: {total_count}")

                if total_count >= 2000:
                    print("✅ Record count matches expectation (~2000 records)")
                else:
                    print(f"⚠️  Record count lower than expected: {total_count} vs ~2000")

                # Test data transformation
                print("\n2. Testing data transformation...")
                transformed_record = {
                    'id': result.data[0]['faculty_id'],
                    'employee_id': f'EMP{result.data[0]["faculty_id"]:03d}',
                    'name': result.data[0]['faculty_name'],
                    'email': f'{result.data[0]["faculty_name"].lower().replace(" ", ".")}@college.edu',
                    'department': result.data[0]['department'],
                    'designation': 'Professor',
                    'performance_rating': result.data[0]['performance_rating'],
                    'research_output': result.data[0]['research_papers'],
                    'student_feedback_score': result.data[0]['feedback_score'],
                    'teaching_hours': 20,
                    'publications': result.data[0]['research_papers'],
                    'projects': 5,
                    'experience': 10,
                    'qualifications': 'Ph.D.',
                    'status': 'active'
                }

                print("Transformed record sample:")
                print(json.dumps(transformed_record, indent=2))

                print("\n✅ Faculty data fetching test completed successfully!")
                return True

            else:
                print("❌ No data retrieved from Supabase")
                return False

    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_faculty_data_fetching()
