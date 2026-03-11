"""
Test script to create a test user and verify PostgreSQL authentication system.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth_service import auth_service
from postgres_client import execute_query
import logging

logger = logging.getLogger(__name__)

def create_test_user():
    """Create a test user for testing the authentication system."""
    try:
        print("🔧 Creating test user...")
        
        # Create test user
        user = auth_service.create_user(
            email="test@example.com",
            password="test123456",
            role="student",
            metadata={"name": "Test User"}
        )
        
        print(f"✅ Test user created successfully:")
        print(f"   ID: {user['id']}")
        print(f"   Email: {user['email']}")
        print(f"   Role: {user['role']}")
        
        return user
        
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️ Test user already exists, getting existing user...")
            user = execute_query("SELECT * FROM users WHERE email = %s", ["test@example.com"], fetch_all=False)
            return user
        else:
            print(f"❌ Error creating test user: {e}")
            return None

def test_authentication():
    """Test the authentication flow."""
    try:
        print("\n🔐 Testing authentication...")
        
        # Test login
        user = auth_service.authenticate_user("test@example.com", "test123456")
        
        if user:
            print(f"✅ Authentication successful:")
            print(f"   User ID: {user['id']}")
            print(f"   Email: {user['email']}")
            print(f"   Role: {user['role']}")
            
            # Test token generation
            tokens = auth_service.generate_tokens(user['id'])
            print(f"✅ Tokens generated successfully")
            print(f"   Access Token: {tokens['access_token'][:50]}...")
            print(f"   Refresh Token: {tokens['refresh_token'][:50]}...")
            
            # Test token verification
            verified_user = auth_service.verify_token(tokens['access_token'])
            if verified_user:
                print(f"✅ Token verification successful")
                print(f"   Verified User ID: {verified_user['id']}")
            else:
                print(f"❌ Token verification failed")
            
            return tokens
        else:
            print(f"❌ Authentication failed")
            return None
            
    except Exception as e:
        print(f"❌ Error testing authentication: {e}")
        return None

def test_database_connection():
    """Test database connection and tables."""
    try:
        print("\n🗄️ Testing database connection...")
        
        # Test users table
        user_count = execute_query("SELECT COUNT(*) as count FROM users", fetch_all=False)
        print(f"✅ Users table accessible: {user_count['count']} users found")
        
        # Test sessions table
        session_count = execute_query("SELECT COUNT(*) as count FROM sessions", fetch_all=False)
        print(f"✅ Sessions table accessible: {session_count['count']} sessions found")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 PostgreSQL Authentication System Test")
    print("=" * 50)
    
    # Test database connection
    if not test_database_connection():
        print("❌ Database tests failed. Exiting.")
        sys.exit(1)
    
    # Create test user
    test_user = create_test_user()
    if not test_user:
        print("❌ User creation failed. Exiting.")
        sys.exit(1)
    
    # Test authentication
    tokens = test_authentication()
    if not tokens:
        print("❌ Authentication tests failed. Exiting.")
        sys.exit(1)
    
    print("\n🎉 All tests passed! PostgreSQL authentication system is ready.")
    print("\n📋 Test Credentials:")
    print("   Email: test@example.com")
    print("   Password: test123456")
    print("\n🔗 Test Endpoints:")
    print("   POST /api/auth/login")
    print("   GET  /api/auth/me")
    print("   POST /api/auth/refresh")
    print("   POST /api/auth/logout")
