
import os
import sys
from flask import Flask
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from routes.transportRoutes import transport_bp

def test_fees():
    app = Flask(__name__)
    app.register_blueprint(transport_bp)
    client = app.test_client()
    
    print("\n--- Testing Transport Fees API ---")
    
    # Test /api/transport/fees with pagination
    print("GET /api/transport/fees?limit=10")
    res = client.get('/api/transport/fees?limit=10')
    data = res.get_json()
    print(f"Status: {res.status_code}")
    print(f"Success: {data.get('success')}")
    print(f"Total records in DB: {data.get('total')}")
    print(f"Records returned (limit=10): {len(data.get('data'))}")
    
    if len(data.get('data')) > 0:
        print(f"Sample fee record: {json.dumps(data.get('data')[0], indent=2)}")

if __name__ == "__main__":
    test_fees()
