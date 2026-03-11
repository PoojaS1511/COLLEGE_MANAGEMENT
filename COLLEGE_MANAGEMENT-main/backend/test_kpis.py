import requests
import json

def test_kpis():
    try:
        url = "http://localhost:5001/api/quality/dashboard/kpis"
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kpis()
