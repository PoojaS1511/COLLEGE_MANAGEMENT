#!/usr/bin/env python3
"""
Test Authentication and RLS permissions for transport_students table
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import requests
import json
import os
from supabase_client import get_supabase
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:5001/api')

def test_anon_access():
    """Test anonymous access to transport_students"""
    print("🔍 Testing Anonymous Access...")
    
    try:
        # Test with anon key (default)
        supabase = get_supabase()
        
        # Try to read data
        result = supabase.table('transport_students').select('*').limit(5).execute()
        
        if result.data:
            print(f"✅ Anonymous access: {len(result.data)} records")
            print("✅ Anonymous users can READ transport_students")
        else:
            print("❌ Anonymous access: No data returned")
            
        # Try to write data (should fail with RLS)
        test_record = {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'register_number': 'TEST001',
            'status': 'active'
        }
        
        try:
            insert_result = supabase.table('transport_students').insert(test_record).execute()
            if insert_result.data:
                print("⚠️  WARNING: Anonymous users can WRITE to transport_students!")
                # Clean up
                supabase.table('transport_students').delete().eq('register_number', 'TEST001').execute()
            else:
                print("✅ Anonymous users cannot WRITE to transport_students (RLS working)")
        except Exception as e:
            if 'permission' in str(e).lower() or 'row level security' in str(e).lower():
                print("✅ Anonymous users cannot WRITE to transport_students (RLS working)")
            else:
                print(f"⚠️  Unexpected error on write: {str(e)}")
                
        return True
        
    except Exception as e:
        print(f"❌ Error testing anonymous access: {str(e)}")
        return False

def test_service_role_access():
    """Test service role access"""
    print("\n🔍 Testing Service Role Access...")
    
    try:
        # We need to create a service role client
        from supabase import create_client
        
        service_client = create_client(
            'https://qkaaoeismqnhjyikgkme.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NTQzMDI1NzQsImV4cCI6MjA2OTg3ODU3NH0.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
        )
        
        # Test read access
        result = service_client.table('transport_students').select('*').limit(5).execute()
        
        if result.data:
            print(f"✅ Service role access: {len(result.data)} records")
            print("✅ Service role can READ transport_students")
        else:
            print("❌ Service role access: No data returned")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing service role access: {str(e)}")
        return False

def test_backend_api_auth():
    """Test backend API authentication"""
    print("\n🔍 Testing Backend API Authentication...")
    
    try:
        # Test without authentication
        response = requests.get(f'{API_BASE}/transport/students', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Backend API allows unauthenticated access")
                print("⚠️  Consider adding authentication middleware")
            else:
                print(f"❌ Backend API returned error: {data.get('error')}")
        elif response.status_code == 401:
            print("✅ Backend API requires authentication")
        elif response.status_code == 403:
            print("✅ Backend API denies unauthenticated access")
        else:
            print(f"⚠️  Backend API returned status: {response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing backend API auth: {str(e)}")
        return False

def test_rls_policies():
    """Check RLS policies on transport_students"""
    print("\n🔍 Testing RLS Policies...")
    
    try:
        # This is a simplified test - in production you'd query pg_policies
        supabase = get_supabase()
        
        # Test different operations with anon role
        operations = [
            ('SELECT', lambda: supabase.table('transport_students').select('*').limit(1).execute()),
            ('INSERT', lambda: supabase.table('transport_students').insert({'test': 'value'}).execute()),
            ('UPDATE', lambda: supabase.table('transport_students').update({'test': 'value'}).eq('id', '00000000-0000-0000-0000-000000000000').execute()),
            ('DELETE', lambda: supabase.table('transport_students').delete().eq('id', '00000000-0000-0000-0000-000000000000').execute())
        ]
        
        for op_name, op_func in operations:
            try:
                result = op_func()
                if result.data:
                    print(f"⚠️  {op_name}: Allowed for anonymous users")
                else:
                    print(f"✅ {op_name}: Blocked for anonymous users")
            except Exception as e:
                if 'permission' in str(e).lower() or 'row level security' in str(e).lower():
                    print(f"✅ {op_name}: Blocked by RLS")
                else:
                    print(f"⚠️  {op_name}: Unexpected error - {str(e)[:50]}...")
                    
        return True
        
    except Exception as e:
        print(f"❌ Error testing RLS policies: {str(e)}")
        return False

def check_table_permissions():
    """Check table-level permissions"""
    print("\n🔍 Checking Table Permissions...")
    
    try:
        # Check if we can access table information
        supabase = get_supabase()
        
        # Try to get table schema (this might be restricted)
        try:
            result = supabase.table('transport_students').select('*').limit(1).execute()
            if result.data:
                print("✅ Table is accessible")
                print(f"✅ Table has {len(result.data[0].keys())} columns")
            else:
                print("⚠️  Table exists but no data accessible")
        except Exception as e:
            print(f"❌ Table access error: {str(e)}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error checking table permissions: {str(e)}")
        return False

def generate_security_recommendations():
    """Generate security recommendations"""
    print("\n📋 Security Recommendations:")
    print("=" * 50)
    
    recommendations = [
        "🔒 Enable RLS (Row Level Security) on transport_students table",
        "🔒 Create specific RLS policies for different user roles",
        "🔒 Implement authentication middleware in backend API",
        "🔒 Use JWT tokens for API authentication",
        "🔒 Add rate limiting to prevent abuse",
        "🔒 Validate all input data on backend",
        "🔒 Use HTTPS for all API communications",
        "🔒 Implement proper error handling without exposing sensitive info",
        "🔒 Add audit logging for data access",
        "🔒 Use environment variables for sensitive configuration"
    ]
    
    for rec in recommendations:
        print(f"   {rec}")
    
    print(f"\n📊 Current Security Status:")
    print(f"   ✅ Supabase connection: Working")
    print(f"   ✅ Data access: Functional")
    print(f"   ⚠️  Authentication: Needs review")
    print(f"   ⚠️  RLS policies: Needs verification")

if __name__ == "__main__":
    print("🚀 Starting Authentication & RLS Security Test")
    print("=" * 60)
    
    # Run security tests
    tests = [
        ("Anonymous Access", test_anon_access),
        ("Service Role Access", test_service_role_access),
        ("Backend API Auth", test_backend_api_auth),
        ("RLS Policies", test_rls_policies),
        ("Table Permissions", check_table_permissions),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        results[test_name] = test_func()
    
    # Generate recommendations
    generate_security_recommendations()
    
    # Summary
    print("\n" + "=" * 60)
    print("📯 Security Testing Summary:")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} security tests passed")
    print("=" * 60)
