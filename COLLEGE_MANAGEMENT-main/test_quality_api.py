import requests

def test_quality_policies_api():
    try:
        print("Testing quality policies API...")
        response = requests.get('http://localhost:5000/api/quality/policies', timeout=10)
        print(f'Status: {response.status_code}')

        if response.status_code == 200:
            data = response.json()
            print(f'Success: {data.get("success")}')
            policies = data.get('data', [])
            print(f'Policies count: {len(policies)}')
            if policies:
                print(f'Sample policy: {policies[0]}')
            else:
                print('No policies returned')
        else:
            print(f'Error: {response.text}')
    except Exception as e:
        print(f'Backend not running or error: {e}')

if __name__ == "__main__":
    test_quality_policies_api()
