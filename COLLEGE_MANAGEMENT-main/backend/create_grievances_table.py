#!/usr/bin/env python3
"""
Script to create the grievances table in Supabase
"""

from supabase_client import get_supabase

def create_grievances_table():
    """Create the grievances table with proper schema"""
    try:
        supabase = get_supabase()

        # SQL to create grievances table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS public.grievances (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            priority VARCHAR(20) DEFAULT 'medium',
            status VARCHAR(20) DEFAULT 'pending',
            user_type VARCHAR(20) DEFAULT 'student',
            submitted_date DATE DEFAULT CURRENT_DATE,
            ai_classification VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
        CREATE INDEX IF NOT EXISTS idx_grievances_category ON public.grievances(category);
        CREATE INDEX IF NOT EXISTS idx_grievances_priority ON public.grievances(priority);
        CREATE INDEX IF NOT EXISTS idx_grievances_submitted_date ON public.grievances(submitted_date);

        -- Enable Row Level Security (RLS)
        ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

        -- Create policies for RLS (adjust based on your auth requirements)
        -- Allow authenticated users to read grievances
        CREATE POLICY "Enable read access for authenticated users" ON public.grievances
            FOR SELECT USING (auth.role() = 'authenticated');

        -- Allow authenticated users to insert grievances
        CREATE POLICY "Enable insert for authenticated users" ON public.grievances
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        -- Allow authenticated users to update their own grievances (if user_id column exists)
        -- For now, allow all authenticated users to update
        CREATE POLICY "Enable update for authenticated users" ON public.grievances
            FOR UPDATE USING (auth.role() = 'authenticated');
        """

        # Execute the SQL using Supabase's rpc function
        result = supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()

        print("✅ Grievances table created successfully")
        return True

    except Exception as e:
        print(f"❌ Error creating grievances table: {e}")
        return False

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

        for grievance in grievance_data:
            result = supabase.table('grievances').insert(grievance).execute()
            print(f"✅ Inserted grievance: {grievance['title']}")

        print("✅ Populated grievances table")
        return True

    except Exception as e:
        print(f"❌ Error populating grievances: {e}")
        return False

def main():
    print("🔧 CREATING GRIEVANCES TABLE")
    print("=" * 40)

    # Create the table
    if create_grievances_table():
        print("\n📝 POPULATING GRIEVANCES DATA")
        print("=" * 40)

        # Populate with sample data
        if populate_grievances():
            print("\n✅ GRIEVANCES TABLE SETUP COMPLETE")
            print("=" * 40)
            print("The grievances table has been created and populated with sample data.")
            print("The quality management dashboard should now display data properly.")
        else:
            print("\n❌ Failed to populate grievances data")
    else:
        print("\n❌ Failed to create grievances table")

if __name__ == "__main__":
    main()
