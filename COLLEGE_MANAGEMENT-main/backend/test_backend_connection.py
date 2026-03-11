"""
Quick Backend Connection Test
"""

import requests
import sys

def test_backend_connection():
    """Test if backend is running on port 5000"""
    try:
        print("🔍 Testing backend connection...")
        response = requests.get('http://localhost:5000/api/test', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running on port 5000")
            print("✅ Test endpoint accessible")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on port 5000")
        print("❌ Connection refused - server may not be started")
        return False
    except requests.exceptions.Timeout:
        print("❌ Backend connection timeout")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {str(e)}")
        return False

def test_student_stats_endpoint():
    """Test the specific endpoint that's failing"""
    try:
        print("\n🔍 Testing /api/students/stats endpoint...")
        response = requests.get('http://localhost:5000/api/students/stats', timeout=5)
        if response.status_code == 200:
            print("✅ Student stats endpoint working")
            print(f"Response: {response.text[:200]}...")
            return True
        else:
            print(f"❌ Student stats endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing student stats: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Backend Connection Test")
    print("=" * 40)
    
    # Test basic connection
    backend_running = test_backend_connection()
    
    if backend_running:
        # Test the failing endpoint
        test_student_stats_endpoint()
    else:
        print("\n💡 SOLUTION:")
        print("1. Make sure backend is running:")
        print("   cd d:/cams/ST/backend")
        print("   python app.py")
        print("\n2. Check if port 5000 is available:")
        print("   netstat -an | findstr :5000")
        print("\n3. Check for any Python errors in terminal")
        print("\n4. Try accessing http://localhost:5000/api/test directly in browser")
