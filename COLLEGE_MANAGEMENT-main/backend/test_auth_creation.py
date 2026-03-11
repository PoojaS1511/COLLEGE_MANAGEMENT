"""
Test script to diagnose Supabase auth user creation issue
"""
import requests
import json

# Supabase configuration
SUPABASE_URL = "https://qkaaoeismqnhjyikgkme.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGJbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw"

# Test user data
test_user = {
    "email": "test-debug-12345@example.com",
    "password": "TestPass123!@#",
    "email_confirm": True,
    "user_metadata": {
        "full_name": "Test User",
        "user_type": "student",
        "role": "student"
    }
}

# Make the request
auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

print(f"Testing auth user creation...")
print(f"URL: {auth_url}")
print(f"User data: {json.dumps({**test_user, 'password': '***'}, indent=2)}")

response = requests.post(auth_url, json=test_user, headers=headers, timeout=30)

print(f"\nResponse Status: {response.status_code}")
print(f"Response Headers: {dict(response.headers)}")
print(f"Response Body: {response.text}")

if response.status_code in [200, 201]:
    print("\n✓ SUCCESS: User created successfully!")
    user_data = response.json()
    print(f"User ID: {user_data.get('id') or user_data.get('user', {}).get('id')}")
else:
    print("\n✗ FAILED: User creation failed")
    try:
        error_data = response.json()
        print(f"Error details: {json.dumps(error_data, indent=2)}")
    except:
        print(f"Raw error: {response.text}")
