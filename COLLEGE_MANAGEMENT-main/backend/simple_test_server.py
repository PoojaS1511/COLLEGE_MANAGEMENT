"""
Simple Flask server to test transport_routes API
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'])

# Import the transport routes blueprint
try:
    from routes.transportRoutesApi import transport_routes_bp
    app.register_blueprint(transport_routes_bp)
    print("✅ Transport routes API blueprint registered")
except ImportError as e:
    print(f"❌ Failed to import transport routes API: {e}")

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Transport Routes API Test Server',
        'version': '1.0.0',
        'endpoints': {
            'transport_routes': '/api/transport-routes',
            'health': '/api/transport-routes/health',
            'info': '/api/transport-routes/info'
        }
    })

@app.route('/api/test')
def test():
    """Test endpoint"""
    return jsonify({
        'success': True,
        'message': 'API is working',
        'database': 'SQLite',
        'table': 'transport_routes'
    })

if __name__ == '__main__':
    print("🚌 Starting Transport Routes API Test Server...")
    print("=" * 50)
    print("Server will be available at: http://localhost:5001")
    print("API endpoints:")
    print("  - GET /api/transport-routes (Get all routes)")
    print("  - GET /api/transport-routes/<id> (Get specific route)")
    print("  - POST /api/transport-routes (Create route)")
    print("  - PUT /api/transport-routes/<id> (Update route)")
    print("  - DELETE /api/transport-routes/<id> (Delete route)")
    print("  - GET /api/transport-routes/health (Health check)")
    print("  - GET /api/transport-routes/info (API info)")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True)
