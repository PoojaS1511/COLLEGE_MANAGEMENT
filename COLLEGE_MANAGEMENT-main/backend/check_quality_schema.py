#!/usr/bin/env python3
import sys
import os
from supabase_client import get_supabase

def check_table_schema(table_name):
    print(f"--- Checking {table_name} ---")
    try:
        supabase = get_supabase()
        result = supabase.table(table_name).select('*').limit(1).execute()
        if result.data:
            sample = result.data[0]
            print("Schema:")
            for key in sample.keys():
                print(f"  - {key}")
        else:
            print("No data found to determine schema.")
            # Try to select common columns to see which ones work
            for col in ['id', 'faculty_id', 'audit_id', 'policy_id', 'report_id']:
                try:
                    supabase.table(table_name).select(col).limit(1).execute()
                    print(f"  - {col} (Exists)")
                except:
                    pass
    except Exception as e:
        print(f"Error: {e}")
    print()

def main():
    tables = [
        'quality_facultyperformance',
        'quality_audits',
        'quality_policy',
        'quality_accreditation',
        'grievances'
    ]
    for table in tables:
        check_table_schema(table)

if __name__ == "__main__":
    main()
