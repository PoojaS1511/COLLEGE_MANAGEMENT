"""
Test script for Career Roadmap API
"""
import requests
import json

BASE_URL = "http://localhost:5001"

def test_generate_roadmap():
    """Test roadmap generation"""
    print("\n=== Testing Roadmap Generation ===")
    
    # Use a test student ID (you'll need to replace this with a real one)
    test_student_id = "e356c5a3-e1bf-44a2-8462-9bbd004e6e63"
    
    payload = {
        "student_id": test_student_id,
        "career_interest": "AI Engineer",
        "description": "I want to become an AI Engineer",
        "weeks": 10
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/roadmap/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Roadmap generated successfully!")
            return response.json().get('roadmap_id')
        else:
            print("❌ Failed to generate roadmap")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_get_roadmaps(student_id):
    """Test fetching roadmaps"""
    print("\n=== Testing Get Roadmaps ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/roadmap/{student_id}")
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Roadmaps fetched successfully!")
        else:
            print("❌ Failed to fetch roadmaps")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health():
    """Test if backend is running"""
    print("\n=== Testing Backend Health ===")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Backend is running!")
            return True
        else:
            print("❌ Backend health check failed")
            return False
            
    except Exception as e:
        print(f"❌ Backend is not running: {e}")
        return False

if __name__ == "__main__":
    print("Career Roadmap API Test")
    print("=" * 50)
    
    # Test backend health
    if not test_health():
        print("\n⚠️  Please start the backend server first!")
        exit(1)
    
    # Test roadmap generation
    roadmap_id = test_generate_roadmap()
    
    # Test fetching roadmaps
    test_student_id = "e356c5a3-e1bf-44a2-8462-9bbd004e6e63"
    test_get_roadmaps(test_student_id)
    
    print("\n" + "=" * 50)
    print("Tests completed!")

