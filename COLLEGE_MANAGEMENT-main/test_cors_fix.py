"""
Test CORS fix for frontend-backend connection
"""

import requests
import json
import os
from datetime import datetime
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:5001/api')

def test_cors_connection():
    """Test CORS connection from frontend perspective"""
    print("🔗 TESTING CORS CONNECTION FIX")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Simulate frontend request from localhost:3001
    headers = {
        'Origin': 'http://localhost:3001',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        print("\n1️⃣ Testing CORS Preflight (OPTIONS)...")
        
        # Test OPTIONS request
        response = requests.options(f'{API_BASE}/transport-routes', headers=headers, timeout=5)
        print(f"   Status: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods')
        }
        
        print("   CORS Headers:")
        for header, value in cors_headers.items():
            print(f"     {header}: {value}")
        
        if (cors_headers['Access-Control-Allow-Origin'] == 'http://localhost:3001' and 
            cors_headers['Access-Control-Allow-Credentials'] == 'true'):
            print("   ✅ CORS preflight successful")
        else:
            print("   ❌ CORS preflight failed")
            return False
        
        print("\n2️⃣ Testing Actual API Request (GET)...")
        
        # Test actual GET request
        response = requests.get(f'{API_BASE}/transport-routes?limit=3', headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                routes = data.get('data', [])
                total = data.get('total', 0)
                print(f"   ✅ API request successful")
                print(f"   Records returned: {len(routes)}")
                print(f"   Total available: {total}")
                print(f"   Sample route: {routes[0] if routes else 'None'}")
                return True
            else:
                print(f"   ❌ API error: {data.get('error')}")
                return False
        else:
            print(f"   ❌ HTTP error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return False

def test_frontend_simulation():
    """Simulate frontend fetch request"""
    print("\n3️⃣ Testing Frontend Simulation...")
    
    # This simulates what the frontend does
    try:
        import urllib3
        
        # Create a PoolManager with similar settings to frontend
        http = urllib3.PoolManager()
        
        headers = {
            'Origin': 'http://localhost:3001',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Make request similar to frontend fetch
        response = http.request(
            'GET',
            f'{API_BASE}/transport-routes?limit=2',
            headers=headers
        )
        
        print(f"   Status: {response.status}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status == 200:
            data = json.loads(response.data.decode('utf-8'))
            if data.get('success'):
                print("   ✅ Frontend simulation successful")
                return True
            else:
                print(f"   ❌ Frontend simulation error: {data.get('error')}")
                return False
        else:
            print(f"   ❌ Frontend simulation HTTP error: {response.status}")
            return False
            
    except ImportError:
        print("   ⚠️  urllib3 not available, skipping simulation")
        return True
    except Exception as e:
        print(f"   ❌ Frontend simulation error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TESTING CORS FIX FOR FRONTEND-BACKEND CONNECTION")
    print("=" * 60)
    
    success1 = test_cors_connection()
    success2 = test_frontend_simulation()
    
    print("\n" + "=" * 60)
    print("CORS FIX TEST SUMMARY")
    print("=" * 60)
    
    if success1 and success2:
        print("🎉 CORS FIX VERIFICATION SUCCESSFUL!")
        print("✅ CORS preflight requests working")
        print("✅ API requests from frontend working")
        print("✅ Credentials header properly configured")
        print("✅ Frontend should now be able to connect to backend")
        print("\n📝 Next steps:")
        print("   1. Refresh the frontend browser to clear cached responses")
        print("   2. Clear browser cache if needed")
        print("   3. Test the frontend application at http://localhost:3001")
    else:
        print("❌ CORS FIX VERIFICATION FAILED")
        print("Please check the server configuration and try again")
    
    exit(0 if (success1 and success2) else 1)
