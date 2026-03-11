import os
import sys
import json

# Get the project root directory (two levels up from this script)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Add the project root to the Python path
sys.path.append(project_root)

# Import the supabase client from the project's supabase_client module
from supabase_client import get_supabase

def create_admin_user():
    """
    Create an admin user using Supabase Admin API
    """
    try:
        # Get the admin Supabase client
        supabase = get_supabase(admin=True)
        
        # Admin user details
        admin_email = "Admin@college.edu"
        admin_password = "admin@123"  # Strong password that will be changed after first login
        
        print(f"🔄 Creating admin user: {admin_email}")
        
        # Create the admin user
        auth_response = supabase.auth.admin.create_user({
            "email": admin_email,
            "password": admin_password,
            "email_confirm": True,  # Skip email confirmation
            "user_metadata": {
                "role": "admin",
                "full_name": "System Administrator"
            }
        })
        
        if hasattr(auth_response, 'user') and auth_response.user:
            print("✅ Admin user created successfully!")
            print(f"📧 Email: {admin_email}")
            print(f"🔑 Password: {admin_password}")
            print("\n⚠️  IMPORTANT: Please change this password after first login!")
            
            # Optionally, add to a custom profiles table if you have one
            try:
                profile_data = {
                    "id": auth_response.user.id,
                    "email": admin_email,
                    "full_name": "System Administrator",
                    "role": "admin",
                    "created_at": "now()"
                }
                
                # This assumes you have a 'profiles' table
                supabase.table('profiles').upsert(profile_data).execute()
                print("\n✅ Admin profile created in 'profiles' table")
                
            except Exception as e:
                print(f"\n⚠️  Note: Could not update profiles table: {str(e)}")
                
        else:
            print("❌ Failed to create admin user")
            if hasattr(auth_response, 'error'):
                print(f"Error: {auth_response.error}")
                
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        if hasattr(e, 'message'):
            print(f"Details: {e.message}")

if __name__ == "__main__":
    print("🚀 Starting admin user creation...")
    create_admin_user()
