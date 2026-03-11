import requests

# Test the subjects API endpoint
course_id = "649b61a8-20fd-4eb7-a9e9-4524a7f3d309"
url = f"http://localhost:5001/api/academics/subjects?course_id={course_id}"

print(f"Testing API: {url}\n")

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {str(e)}")
