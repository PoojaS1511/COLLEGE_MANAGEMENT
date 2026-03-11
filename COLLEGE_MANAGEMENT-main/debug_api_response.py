#!/usr/bin/env python3
"""
Debug API response to check data structure
"""
import requests
import json
import os
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:5001/api')

def debug_api_response():
    """Debug the API response"""
    print("🔍 Debugging API Response...")
    
    try:
        # Test API endpoint
        response = requests.get(f'{API_BASE}/transport/students', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ API Status: {response.status_code}")
            print(f"✅ Response Success: {data.get('success')}")
            print(f"📊 Total Records: {len(data.get('data', []))}")
            
            if data.get('data') and len(data['data']) > 0:
                sample = data['data'][0]
                
                print(f"\n📋 Sample Record Keys:")
                for key in sample.keys():
                    value = sample[key]
                    print(f"   - {key}: {value} ({type(value).__name__})")
                
                print(f"\n🎯 Checking specific fields:")
                print(f"   - register_number: {sample.get('register_number', 'MISSING')}")
                print(f"   - full_name: {sample.get('full_name', 'MISSING')}")
                print(f"   - email: {sample.get('email', 'MISSING')}")
                print(f"   - phone: {sample.get('phone', 'MISSING')}")
                
                # Check if values are empty or None
                print(f"\n⚠️  Checking for empty values:")
                for key in ['register_number', 'full_name', 'email', 'phone']:
                    value = sample.get(key)
                    if not value or str(value).strip() == '':
                        print(f"   - {key}: EMPTY or None")
                    else:
                        print(f"   - {key}: '{value}' (OK)")
            else:
                print("❌ No data in API response")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"📝 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    debug_api_response()
