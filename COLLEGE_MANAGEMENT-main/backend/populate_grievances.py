#!/usr/bin/env python3
"""
Script to populate the grievances table with sample data
"""

from supabase_client import get_supabase

def populate_grievances():
    """Populate grievances table with sample data"""
    try:
        supabase = get_supabase()

        grievance_data = [
            {
                'title': 'Classroom Maintenance Issue',
                'description': 'AC not working in Room 201 for the past week',
                'category': 'Infrastructure',
                'priority': 'medium',
                'status': 'resolved',
                'user_type': 'student',
                'submitted_date': '2024-01-10',
                'ai_classification': 'Infrastructure'
            },
            {
                'title': 'Course Material Delay',
                'description': 'Data Structures course material not available on time',
                'category': 'Academic',
                'priority': 'high',
                'status': 'in_progress',
                'user_type': 'student',
                'submitted_date': '2024-01-15',
                'ai_classification': 'Academic'
            },
            {
                'title': 'Library Hours Extension',
                'description': 'Request to extend library hours during exam period',
                'category': 'Administrative',
                'priority': 'low',
                'status': 'pending',
                'user_type': 'student',
                'submitted_date': '2024-01-20',
                'ai_classification': 'Administrative'
            },
            {
                'title': 'Faculty Feedback System',
                'description': 'Online feedback system not working properly',
                'category': 'Academic',
                'priority': 'medium',
                'status': 'resolved',
                'user_type': 'student',
                'submitted_date': '2024-01-25',
                'ai_classification': 'Academic'
            },
            {
                'title': 'Transportation Service',
                'description': 'Bus route timing needs adjustment for morning classes',
                'category': 'Transportation',
                'priority': 'medium',
                'status': 'pending',
                'user_type': 'student',
                'submitted_date': '2024-02-01',
                'ai_classification': 'Transportation'
            },
            {
                'title': 'Canteen Food Quality',
                'description': 'Food quality in college canteen needs improvement',
                'category': 'Facilities',
                'priority': 'low',
                'status': 'in_progress',
                'user_type': 'student',
                'submitted_date': '2024-02-05',
                'ai_classification': 'Facilities'
            },
            {
                'title': 'WiFi Connectivity Issues',
                'description': 'Poor WiFi signal in certain areas of the campus',
                'category': 'Infrastructure',
                'priority': 'high',
                'status': 'pending',
                'user_type': 'student',
                'submitted_date': '2024-02-10',
                'ai_classification': 'Infrastructure'
            },
            {
                'title': 'Examination Schedule Conflict',
                'description': 'Two major exams scheduled on the same day',
                'category': 'Academic',
                'priority': 'high',
                'status': 'resolved',
                'user_type': 'student',
                'submitted_date': '2024-02-15',
                'ai_classification': 'Academic'
            }
        ]

        inserted_count = 0
        for grievance in grievance_data:
            try:
                result = supabase.table('grievances').insert(grievance).execute()
                print(f"✅ Inserted grievance: {grievance['title']}")
                inserted_count += 1
            except Exception as insert_error:
                print(f"⚠️  Failed to insert: {grievance['title']} - {insert_error}")

        print(f"\n✅ Successfully inserted {inserted_count} grievances")
        return inserted_count > 0

    except Exception as e:
        print(f"❌ Error populating grievances: {e}")
        return False

def check_grievances_table():
    """Check if grievances table exists and has data"""
    try:
        supabase = get_supabase()
        result = supabase.table('grievances').select("*", count='exact').execute()
        count = result.count if hasattr(result, 'count') else 0
        print(f"📊 Grievances table: {count} records")
        return count
    except Exception as e:
        print(f"❌ Error checking grievances table: {e}")
        return -1

def main():
    print("📝 POPULATING GRIEVANCES DATA")
    print("=" * 40)

    # First check if table exists
    print("Checking grievances table...")
    count = check_grievances_table()

    if count == -1:
        print("❌ Grievances table does not exist!")
        print("Please create the grievances table in Supabase first.")
        print("Required columns: id, title, description, category, priority, status, user_type, submitted_date, ai_classification")
        return

    if count > 0:
        print(f"✅ Grievances table already has {count} records")
        print("No need to populate.")
        return

    # Populate the table
    print("\nPopulating grievances table...")
    if populate_grievances():
        print("\n✅ GRIEVANCES POPULATION COMPLETE")
        print("=" * 40)
        print("The grievances table has been populated with sample data.")
        print("The quality management dashboard should now display data properly.")
    else:
        print("\n❌ Failed to populate grievances data")

if __name__ == "__main__":
    main()
