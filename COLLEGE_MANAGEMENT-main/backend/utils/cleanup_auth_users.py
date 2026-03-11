"""
Utility script to clean up orphaned auth users in Supabase.

Orphaned auth users are users that exist in auth.users but don't have
a corresponding record in the students table.

Usage:
    python -m backend.utils.cleanup_auth_users
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def list_orphaned_auth_users():
    """
    Find all auth users that don't have a corresponding student record.
    Returns a list of orphaned users.
    """
    try:
        print("Fetching all auth users...")
        # Get all auth users
        auth_response = supabase.auth.admin.list_users()
        
        if not hasattr(auth_response, 'users') or not auth_response.users:
            print("No auth users found.")
            return []
        
        print(f"Found {len(auth_response.users)} auth users")
        
        # Get all students
        print("Fetching all students...")
        students_response = supabase.table('students').select('id, email, full_name').execute()
        student_emails = {student['email'].lower() for student in students_response.data}
        student_ids = {student['id'] for student in students_response.data if student.get('id')}
        
        print(f"Found {len(students_response.data)} students")
        
        # Find orphaned users
        orphaned_users = []
        for user in auth_response.users:
            user_email = user.email.lower() if user.email else None
            user_role = user.user_metadata.get('role') if user.user_metadata else None
            
            # Only check student users
            if user_role == 'student':
                # Check if user exists in students table by email or id
                if user_email not in student_emails and user.id not in student_ids:
                    orphaned_users.append({
                        'id': user.id,
                        'email': user.email,
                        'created_at': user.created_at,
                        'role': user_role
                    })
        
        return orphaned_users
        
    except Exception as e:
        print(f"Error listing orphaned users: {e}")
        return []


def delete_auth_user(user_id):
    """Delete a specific auth user by ID."""
    try:
        print(f"Deleting auth user: {user_id}")
        supabase.auth.admin.delete_user(user_id)
        print(f"Successfully deleted auth user: {user_id}")
        return True
    except Exception as e:
        print(f"Error deleting auth user {user_id}: {e}")
        return False


def delete_auth_user_by_email(email):
    """Delete an auth user by email."""
    try:
        print(f"Finding auth user with email: {email}")
        # Get all auth users and find the one with matching email
        auth_response = supabase.auth.admin.list_users()
        
        if not hasattr(auth_response, 'users') or not auth_response.users:
            print("No auth users found.")
            return False
        
        user_to_delete = None
        for user in auth_response.users:
            if user.email and user.email.lower() == email.lower():
                user_to_delete = user
                break
        
        if not user_to_delete:
            print(f"No auth user found with email: {email}")
            return False
        
        print(f"Found auth user: {user_to_delete.id} ({user_to_delete.email})")
        return delete_auth_user(user_to_delete.id)
        
    except Exception as e:
        print(f"Error deleting auth user by email {email}: {e}")
        return False


def cleanup_all_orphaned_users(dry_run=True):
    """
    Clean up all orphaned auth users.
    
    Args:
        dry_run: If True, only list orphaned users without deleting them.
    """
    orphaned_users = list_orphaned_auth_users()
    
    if not orphaned_users:
        print("\n✅ No orphaned auth users found!")
        return
    
    print(f"\n⚠️  Found {len(orphaned_users)} orphaned auth users:")
    print("-" * 80)
    for user in orphaned_users:
        print(f"  ID: {user['id']}")
        print(f"  Email: {user['email']}")
        print(f"  Created: {user['created_at']}")
        print(f"  Role: {user['role']}")
        print("-" * 80)
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No users were deleted.")
        print("To actually delete these users, run with --delete flag")
        return
    
    # Ask for confirmation
    print("\n⚠️  WARNING: This will permanently delete these auth users!")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Cancelled.")
        return
    
    # Delete orphaned users
    deleted_count = 0
    failed_count = 0
    
    for user in orphaned_users:
        if delete_auth_user(user['id']):
            deleted_count += 1
        else:
            failed_count += 1
    
    print(f"\n✅ Cleanup complete!")
    print(f"   Deleted: {deleted_count}")
    print(f"   Failed: {failed_count}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Clean up orphaned Supabase auth users')
    parser.add_argument('--delete', action='store_true', help='Actually delete orphaned users (default is dry-run)')
    parser.add_argument('--email', type=str, help='Delete a specific user by email')
    parser.add_argument('--user-id', type=str, help='Delete a specific user by ID')
    
    args = parser.parse_args()
    
    if args.email:
        # Delete specific user by email
        delete_auth_user_by_email(args.email)
    elif args.user_id:
        # Delete specific user by ID
        delete_auth_user(args.user_id)
    else:
        # Clean up all orphaned users
        cleanup_all_orphaned_users(dry_run=not args.delete)

