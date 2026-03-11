"""
Complete Flask server for testing transport_routes API
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys

# Add current directory to path
sys.path.append('.')

# Create Flask app
app = Flask(__name__)

# Enable CORS with credentials support
CORS(app, 
    origins=['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], 
    supports_credentials=True,
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)

# Import and register transport routes controller
from controllers.transportRoutesController import (
    get_transport_routes, get_transport_route, create_transport_route,
    update_transport_route, delete_transport_route
)

# ====================================
# TRANSPORT ROUTES API ENDPOINTS
# ====================================

@app.route('/api/transport-routes', methods=['GET'])
def api_get_transport_routes():
    """Get all transport routes with pagination and filtering"""
    return get_transport_routes()

@app.route('/api/transport-routes/<int:route_id>', methods=['GET'])
def api_get_transport_route(route_id):
    """Get specific transport route by ID"""
    return get_transport_route(route_id)

@app.route('/api/transport-routes', methods=['POST'])
def api_create_transport_route():
    """Create new transport route"""
    return create_transport_route()

@app.route('/api/transport-routes/<int:route_id>', methods=['PUT'])
def api_update_transport_route(route_id):
    """Update transport route"""
    return update_transport_route(route_id)

@app.route('/api/transport-routes/<int:route_id>', methods=['DELETE'])
def api_delete_transport_route(route_id):
    """Delete transport route"""
    return delete_transport_route(route_id)

# ====================================
# UTILITY ENDPOINTS
# ====================================

@app.route('/api/transport-routes/health', methods=['GET'])
def health_check():
    """Health check endpoint for transport routes API"""
    return {
        'success': True,
        'message': 'Transport Routes API is running',
        'table': 'transport_routes',
        'schema': {
            'id': 'bigint (NOT NULL)',
            'bus_name': 'text',
            'route': 'text',
            'capacity': 'bigint',
            'driver_name': 'text',
            'faculty_id': 'uuid'
        }
    }

@app.route('/api/transport-routes/info', methods=['GET'])
def get_info():
    """Get API information"""
    return {
        'success': True,
        'data': {
            'name': 'Transport Routes Management API',
            'version': '1.0.0',
            'description': 'Backend API for transport_routes table management',
            'table': 'transport_routes',
            'endpoints': {
                'get_all': '/api/transport-routes',
                'get_by_id': '/api/transport-routes/<id>',
                'create': '/api/transport-routes',
                'update': '/api/transport-routes/<id>',
                'delete': '/api/transport-routes/<id>',
                'health': '/api/transport-routes/health',
                'info': '/api/transport-routes/info'
            },
            'supported_parameters': {
                'pagination': ['limit', 'offset', 'page'],
                'filtering': ['bus_name', 'route', 'driver_name', 'faculty_id'],
                'sorting': 'Ordered by id (ascending)'
            }
        }
    }

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Transport Routes API Server',
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
        'table': 'transport_routes',
        'records': 2000
    })

if __name__ == '__main__':
    print("🚌 Starting Transport Routes API Server...")
    print("=" * 60)
    print("Server will be available at: http://localhost:5001")
    print()
    print("Available endpoints:")
    print("  GET  /                           - Home page")
    print("  GET  /api/test                    - Test endpoint")
    print("  GET  /api/transport-routes         - Get all routes")
    print("  GET  /api/transport-routes/<id>    - Get specific route")
    print("  POST /api/transport-routes         - Create new route")
    print("  PUT  /api/transport-routes/<id>    - Update route")
    print("  DELETE /api/transport-routes/<id>    - Delete route")
    print("  GET  /api/transport-routes/health - Health check")
    print("  GET  /api/transport-routes/info   - API information")
    print()
    print("Table schema (transport_routes):")
    print("  - id (bigint, NOT NULL)")
    print("  - bus_name (text)")
    print("  - route (text)")
    print("  - capacity (bigint)")
    print("  - driver_name (text)")
    print("  - faculty_id (uuid)")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5001, debug=False)
