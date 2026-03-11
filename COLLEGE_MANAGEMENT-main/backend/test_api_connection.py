import requests
import json

def test_api():
    try:
        # Test health endpoint
        response = requests.get("http://localhost:5001/health", timeout=5)
        print(f"Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        
        # Test transport faculty endpoint
        response = requests.get("http://localhost:5001/api/transport/faculty", timeout=5)
        print(f"Transport faculty endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Records: {len(data.get('data', []))}")
            if data.get('data'):
                print(f"Sample record: {data['data'][0]}")
        else:
            print(f"Error response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Cannot connect to server - is it running?")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
