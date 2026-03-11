"""
Transport Routes API Routes
Handles the transport_routes table with exact schema:
- id (uuid, NOT NULL)
- route_id (text)
- route_name (text)
- stops (jsonb)
- pickup_time (time)
- drop_time (time)
- total_students (integer)
- assigned_bus (text)
- assigned_driver (text)
- status (text)
"""

from flask import Blueprint
from controllers.transportRoutesController import (
    get_transport_routes, get_transport_route, create_transport_route,
    update_transport_route, delete_transport_route
)

# Create blueprint for transport routes API
transport_routes_bp = Blueprint('transport_routes', __name__, url_prefix='/api/transport-routes')

# ====================================
# TRANSPORT ROUTES CRUD ROUTES
# ====================================

@transport_routes_bp.route('', methods=['GET'])
def get_all_transport_routes():
    """Get all transport routes with pagination and filtering"""
    return get_transport_routes()

@transport_routes_bp.route('/<int:route_id>', methods=['GET'])
def get_transport_route_by_id(route_id):
    """Get specific transport route by ID"""
    return get_transport_route(route_id)

@transport_routes_bp.route('', methods=['POST'])
def add_transport_route():
    """Create new transport route"""
    return create_transport_route()

@transport_routes_bp.route('/<int:route_id>', methods=['PUT'])
def update_transport_route_by_id(route_id):
    """Update transport route"""
    return update_transport_route(route_id)

@transport_routes_bp.route('/<int:route_id>', methods=['DELETE'])
def delete_transport_route_by_id(route_id):
    """Delete transport route"""
    return delete_transport_route(route_id)

# ====================================
# UTILITY ROUTES
# ====================================

@transport_routes_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for transport routes API"""
    return {
        'success': True,
        'message': 'Transport Routes API is running',
        'table': 'transport_routes',
        'schema': {
            'id': 'uuid (PRIMARY KEY)',
            'route_id': 'varchar(20) (UNIQUE)',
            'route_name': 'varchar(255)',
            'stops': 'jsonb',
            'pickup_time': 'time',
            'drop_time': 'time',
            'total_students': 'integer',
            'assigned_bus': 'varchar(20)',
            'assigned_driver': 'varchar(50)',
            'status': 'varchar(20)'
        }
    }

@transport_routes_bp.route('/info', methods=['GET'])
def get_info():
    """Get API information"""
    return {
        'success': True,
        'data': {
            'name': 'Transport Routes Management API',
            'version': '1.1.0',
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
                'filtering': ['route_id', 'route_name', 'status'],
                'sorting': 'Ordered by route_id (ascending)'
            }
        }
    }
