"""
DEPRECATED: Supabase client - DISABLED
All database operations have been migrated to PostgreSQL.
This file exists only to prevent import errors.
"""

# Disable Supabase functionality
class MockClient:
    def __init__(self, *args, **kwargs):
        pass  # Don't throw error on import, just be silent
    
    def table(self, *args):
        return MockTable()
    
    def auth(self, *args):
        return MockAuth()

class MockTable:
    def select(self, *args):
        return MockResponse()
    
    def insert(self, *args):
        return MockResponse()
    
    def update(self, *args):
        return MockResponse()
    
    def delete(self, *args):
        return MockResponse()
    
    def eq(self, *args):
        return MockResponse()

class MockAuth:
    def sign_in_with_password(self, *args):
        raise Exception("Supabase has been disabled. All operations now use PostgreSQL.")
    
    def sign_up(self, *args):
        raise Exception("Supabase has been disabled. All operations now use PostgreSQL.")
    
    def sign_out(self, *args):
        pass
    
    def get_user(self, *args):
        raise Exception("Supabase has been disabled. All operations now use PostgreSQL.")
    
    def admin(self, *args):
        return MockAdmin()

class MockAdmin:
    def list_users(self, *args):
        return MockResponse()
    
    def create_user(self, *args):
        return MockResponse()

class MockResponse:
    def __init__(self):
        self.data = None
    
    def execute(self, *args):
        return self
    
    def filter(self, *args):
        return self

# Mock functions to prevent import errors
def get_supabase(*args, **kwargs):
    return MockClient()

# Mock clients
supabase = MockClient()
supabase_admin = MockClient()

# Mock constants - provide valid dummy values
SUPABASE_URL = "https://disabled.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "disabled_dummy_key"

print("⚠️ Supabase has been disabled. All database operations now use PostgreSQL.")
