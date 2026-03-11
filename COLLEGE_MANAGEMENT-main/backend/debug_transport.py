"""
Debug Transport Routes Registration
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    print("1. Testing basic imports...")
    from flask import Flask
    print("✓ Flask imported")
    
    print("2. Testing model imports...")
    from models.transport_models import TransportStudent
    print("✓ Transport models imported")
    
    print("3. Testing controller imports...")
    from controllers.transportController import DashboardController
    print("✓ Transport controllers imported")
    
    print("4. Testing route imports...")
    from routes.transportRoutes import transport_bp
    print("✓ Transport routes imported")
    
    print("5. Testing Flask app creation...")
    app = Flask(__name__)
    print("✓ Flask app created")
    
    print("6. Testing blueprint registration...")
    app.register_blueprint(transport_bp, url_prefix='/api')
    print("✓ Transport blueprint registered")
    
    print("7. Listing routes...")
    with app.app_context():
        for rule in app.url_map.iter_rules():
            if 'transport' in rule.rule:
                print(f"  {list(rule.methods)} {rule.rule}")
    
    print("\n✓ All tests passed! Transport system should work correctly.")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
