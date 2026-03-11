#!/usr/bin/env python3
"""
Direct API test without server
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

# Apply httpx patch for Supabase client
import httpx
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

from controllers.transportController import FacultyController

def test_faculty_controller():
    """Test faculty controller directly"""
    print("🧪 Testing Faculty Controller directly...")
    
    try:
        controller = FacultyController()
        
        # Mock request args (empty for get all)
        class MockRequest:
            args = {}
        
        # Temporarily replace request
        import controllers.transportController as tc
        original_request = tc.request
        tc.request = MockRequest()
        
        try:
            result = controller.get_faculty()
            print(f"✅ Controller returned: {type(result)}")
            
            if hasattr(result, 'get_json'):
                data = result.get_json()
                print(f"✅ Response JSON: {data}")
            elif hasattr(result, 'data'):
                data = result.data
                print(f"✅ Response data: {data}")
            else:
                print(f"✅ Raw result: {result}")
                
        finally:
            # Restore original request
            tc.request = original_request
            
    except Exception as e:
        print(f"❌ Error testing controller: {e}")
        import traceback
        traceback.print_exc()

def test_supabase_direct():
    """Test Supabase connection directly"""
    print("\n🧪 Testing Supabase connection directly...")
    
    try:
        from supabase_client import get_supabase
        supabase = get_supabase()
        
        # Test connection
        result = supabase.table('transport_faculty').select('count').limit(1).execute()
        print(f"✅ Supabase connection: {result}")
        
        # Get actual data
        result = supabase.table('transport_faculty').select('*').limit(5).execute()
        print(f"✅ Data count: {len(result.data) if result.data else 0}")
        
        if result.data:
            print(f"✅ Sample record: {result.data[0]}")
        else:
            print("⚠️  No data found in transport_faculty table")
            
    except Exception as e:
        print(f"❌ Error testing Supabase: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_supabase_direct()
    test_faculty_controller()
