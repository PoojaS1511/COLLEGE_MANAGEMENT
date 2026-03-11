#!/usr/bin/env python3
"""
Script to check quality management tables data and populate if empty
"""

from supabase_client import get_supabase
import json
from datetime import datetime, timedelta
import random

def check_table_data(table_name):
    """Check if table has data"""
    try:
        supabase = get_supabase()
        result = supabase.table(table_name).select("*", count='exact').execute()
        count = result.count if hasattr(result, 'count') else 0
        print(f"📊 {table_name}: {count} records")
        return count, result.data
    except Exception as e:
        print(f"❌ Error checking {table_name}: {e}")
        return 0, []

def populate_quality_facultyperformance():
    """Populate quality_facultyperformance table"""
    try:
        supabase = get_supabase()

        faculty_data = [
            {
                'faculty_name': 'Dr. Rajesh Kumar',
                'department': 'Computer Science',
                'performance_rating': 92.5,
                'research_papers': 15,
                'feedback_score': 88.0
            },
            {
                'faculty_name': 'Dr. Priya Sharma',
                'department': 'Electronics',
                'performance_rating': 89.0,
                'research_papers': 12,
                'feedback_score': 91.0
            },
            {
                'faculty_name': 'Prof. Amit Singh',
                'department': 'Mechanical',
                'performance_rating': 87.5,
                'research_papers': 8,
                'feedback_score': 85.0
            },
            {
                'faculty_name': 'Dr. Sunita Patel',
                'department': 'Civil',
                'performance_rating': 94.0,
                'research_papers': 18,
                'feedback_score': 92.0
            },
            {
                'faculty_name': 'Prof. Vijay Gupta',
                'department': 'Computer Science',
                'performance_rating': 86.0,
                'research_papers': 10,
                'feedback_score': 87.0
            }
        ]

        for faculty in faculty_data:
            result = supabase.table('quality_facultyperformance').insert(faculty).execute()
            print(f"✅ Inserted faculty: {faculty['faculty_name']}")

        print("✅ Populated quality_facultyperformance table")
    except Exception as e:
        print(f"❌ Error populating quality_facultyperformance: {e}")

def populate_quality_audits():
    """Populate quality_audits table"""
    try:
        supabase = get_supabase()

        audit_data = [
            {
                'department': 'Computer Science',
                'auditor_name': 'External Auditor A',
                'audit_date': '2024-01-15',
                'compliance_score': 85.0,
                'remarks': 'Good compliance with minor improvements needed in documentation',
                'status': 'completed'
            },
            {
                'department': 'Electronics',
                'auditor_name': 'Internal Audit Team',
                'audit_date': '2024-02-20',
                'compliance_score': 92.0,
                'remarks': 'Excellent compliance standards maintained',
                'status': 'completed'
            },
            {
                'department': 'Mechanical',
                'auditor_name': 'External Auditor B',
                'audit_date': '2024-03-10',
                'compliance_score': 78.0,
                'remarks': 'Satisfactory with recommendations for equipment maintenance',
                'status': 'completed'
            },
            {
                'department': 'Civil',
                'auditor_name': 'Quality Assurance Team',
                'audit_date': '2024-01-25',
                'compliance_score': 88.0,
                'remarks': 'Good overall performance with focus on safety protocols',
                'status': 'in_progress'
            }
        ]

        for audit in audit_data:
            result = supabase.table('quality_audits').insert(audit).execute()
            print(f"✅ Inserted audit for: {audit['department']}")

        print("✅ Populated quality_audits table")
    except Exception as e:
        print(f"❌ Error populating quality_audits: {e}")

def populate_quality_policy():
    """Populate quality_policy table"""
    try:
        supabase = get_supabase()

        policy_data = [
            {
                'policy_name': 'Academic Integrity Policy',
                'responsible_department': 'Academic Affairs',
                'compliance_status': 'compliant',
                'last_review_date': '2024-01-10',
                'next_due_date': '2025-01-10'
            },
            {
                'policy_name': 'Student Grievance Redressal Policy',
                'responsible_department': 'Student Affairs',
                'compliance_status': 'compliant',
                'last_review_date': '2024-02-15',
                'next_due_date': '2025-02-15'
            },
            {
                'policy_name': 'Faculty Development Policy',
                'responsible_department': 'HR Department',
                'compliance_status': 'partially_compliant',
                'last_review_date': '2024-03-01',
                'next_due_date': '2025-03-01'
            },
            {
                'policy_name': 'Infrastructure Maintenance Policy',
                'responsible_department': 'Facilities',
                'compliance_status': 'compliant',
                'last_review_date': '2024-01-20',
                'next_due_date': '2025-01-20'
            },
            {
                'policy_name': 'Research Ethics Policy',
                'responsible_department': 'Research Office',
                'compliance_status': 'compliant',
                'last_review_date': '2024-02-28',
                'next_due_date': '2025-02-28'
            }
        ]

        for policy in policy_data:
            result = supabase.table('quality_policy').insert(policy).execute()
            print(f"✅ Inserted policy: {policy['policy_name']}")

        print("✅ Populated quality_policy table")
    except Exception as e:
        print(f"❌ Error populating quality_policy: {e}")

def populate_quality_accreditation():
    """Populate quality_accreditation table"""
    try:
        supabase = get_supabase()

        accreditation_data = [
            {
                'report_id': 'NAAC_2024_001',
                'report_type': 'NAAC',
                'department': 'Institutional',
                'report_date': '2024-01-15',
                'score': 85.5,
                'recommendations': ['Improve research output', 'Enhance industry collaboration']
            },
            {
                'report_id': 'NBA_CS_2024_001',
                'report_type': 'NBA',
                'department': 'Computer Science',
                'report_date': '2024-02-20',
                'score': 92.0,
                'recommendations': ['Update curriculum', 'Add more practical sessions']
            },
            {
                'report_id': 'NBA_MECH_2024_001',
                'report_type': 'NBA',
                'department': 'Mechanical',
                'report_date': '2024-03-10',
                'score': 88.5,
                'recommendations': ['Upgrade laboratory equipment', 'Increase industry visits']
            }
        ]

        for accreditation in accreditation_data:
            result = supabase.table('quality_accreditation').insert(accreditation).execute()
            print(f"✅ Inserted accreditation: {accreditation['report_id']}")

        print("✅ Populated quality_accreditation table")
    except Exception as e:
        print(f"❌ Error populating quality_accreditation: {e}")

def populate_grievances():
    """Populate grievances table"""
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
            }
        ]

        for grievance in grievance_data:
            result = supabase.table('grievances').insert(grievance).execute()
            print(f"✅ Inserted grievance: {grievance['title']}")

        print("✅ Populated grievances table")
    except Exception as e:
        print(f"❌ Error populating grievances: {e}")

def main():
    print("🔍 CHECKING QUALITY MANAGEMENT TABLES")
    print("=" * 50)

    tables_to_check = [
        'quality_facultyperformance',
        'quality_audits',
        'quality_policy',
        'quality_accreditation',
        'grievances'
    ]

    empty_tables = []

    for table in tables_to_check:
        count, data = check_table_data(table)
        if count == 0:
            empty_tables.append(table)

    print(f"\n📋 Empty tables found: {empty_tables}")

    if empty_tables:
        print("\n🔄 POPULATING EMPTY TABLES...")
        print("=" * 50)

        if 'quality_facultyperformance' in empty_tables:
            populate_quality_facultyperformance()

        if 'quality_audits' in empty_tables:
            populate_quality_audits()

        if 'quality_policy' in empty_tables:
            populate_quality_policy()

        if 'quality_accreditation' in empty_tables:
            populate_quality_accreditation()

        if 'grievances' in empty_tables:
            populate_grievances()

        print("\n✅ DATA POPULATION COMPLETED")
        print("=" * 50)

        # Verify data was inserted
        print("\n🔍 VERIFYING DATA INSERTION...")
        for table in empty_tables:
            count, data = check_table_data(table)
            if count > 0:
                print(f"✅ {table}: Successfully populated with {count} records")
            else:
                print(f"❌ {table}: Still empty after population attempt")

    else:
        print("✅ All tables already have data!")

    print("\n🎯 QUALITY MANAGEMENT DATA CHECK COMPLETE")

if __name__ == "__main__":
    main()
