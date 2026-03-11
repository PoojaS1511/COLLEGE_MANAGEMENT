"""
Transport Routes Controller for handling transport_routes table
Migrated to PostgreSQL
"""

import json
from flask import jsonify, request
from typing import List, Dict, Optional, Any
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

class TransportRoutesController:
    """Controller for transport_routes table operations using PostgreSQL"""
    
    def get_all(self, filters: Dict = None, limit: int = None, offset: int = None) -> List[Dict]:
        """Get all transport routes with optional filtering and pagination"""
        try:
            # Build query with filters
            query = "SELECT * FROM transport_routes WHERE 1=1"
            params = []
            
            if filters:
                if filters.get('route_id'):
                    query += " AND route_id = %s"
                    params.append(filters['route_id'])
                if filters.get('route_name'):
                    query += " AND route_name = %s"
                    params.append(filters['route_name'])
                if filters.get('status'):
                    query += " AND status = %s"
                    params.append(filters['status'])
                if filters.get('search'):
                    query += " AND (route_id ILIKE %s OR route_name ILIKE %s)"
                    params.append(f"%{filters['search']}%")
            
            # Get total count first
            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total = 0
            try:
                count_result = execute_query(count_query, params, fetch_all=False)
                total = count_result.get('count', 0) if count_result else 0
            except:
                pass
            
            # Apply pagination
            if offset is not None and limit is not None:
                query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            
            routes = execute_query(query, params, fetch_all=True) or []
            
            # Process JSON fields and add compatibility mappings
            for route in routes:
                if route.get('stops') and isinstance(route['stops'], str):
                    try:
                        route['stops'] = json.loads(route['stops'])
                    except:
                        pass
                
                # Compatibility mappings
                if 'assigned_bus' in route:
                    route['bus_name'] = route['assigned_bus']
                if 'route_name' in route:
                    route['route'] = route['route_name']
                if 'assigned_driver' in route:
                    route['driver_name'] = route['assigned_driver']
                if 'total_students' in route:
                    route['capacity'] = route['total_students']
                if 'id' not in route and 'route_id' in route:
                    route['id'] = route['route_id']
                if 'faculty_id' not in route:
                    route['faculty_id'] = 'F-001'
            
            return routes
            
        except Exception as e:
            print(f"Error fetching transport routes: {e}")
            return []
    
    def get_by_id(self, route_id: Any) -> Optional[Dict]:
        """Get transport route by ID"""
        try:
            # Try by UUID or route_id
            if isinstance(route_id, str) and len(route_id) > 20:
                query = "SELECT * FROM transport_routes WHERE id = %s"
            else:
                query = "SELECT * FROM transport_routes WHERE route_id = %s"
            
            route = execute_query(query, [str(route_id)], fetch_all=False)
            
            if route:
                if route.get('stops') and isinstance(route['stops'], str):
                    try:
                        route['stops'] = json.loads(route['stops'])
                    except:
                        pass
                
                # Compatibility mappings
                if 'assigned_bus' in route:
                    route['bus_name'] = route['assigned_bus']
                if 'route_name' in route:
                    route['route'] = route['route_name']
                if 'assigned_driver' in route:
                    route['driver_name'] = route['assigned_driver']
                if 'total_students' in route:
                    route['capacity'] = route['total_students']
                if 'id' not in route and 'route_id' in route:
                    route['id'] = route['route_id']
                if 'faculty_id' not in route:
                    route['faculty_id'] = 'F-001'
                    
                return route
            return None
        except Exception as e:
            print(f"Error fetching transport route by ID: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new transport route"""
        try:
            route_data = {
                'route_id': data.get('route_id'),
                'route_name': data.get('route_name'),
                'stops': json.dumps(data.get('stops')) if isinstance(data.get('stops'), list) else data.get('stops'),
                'pickup_time': data.get('pickup_time'),
                'drop_time': data.get('drop_time'),
                'total_students': data.get('total_students', 0),
                'assigned_bus': data.get('assigned_bus'),
                'assigned_driver': data.get('assigned_driver'),
                'status': data.get('status', 'Active'),
                'created_at': data.get('created_at', 'now()')
            }
            
            result = execute_insert('transport_routes', route_data)
            return result
            
        except Exception as e:
            print(f"Error creating transport route: {e}")
            raise Exception(f"Failed to create transport route: {str(e)}")
    
    def update(self, route_id: Any, data: Dict) -> Dict:
        """Update transport route"""
        try:
            update_data = {}
            fields = ['route_name', 'stops', 'pickup_time', 'drop_time', 'total_students', 
                     'assigned_bus', 'assigned_driver', 'status']
            
            for field in fields:
                if field in data:
                    update_data[field] = data[field]
            
            # Handle stops if it's a list/dict
            if 'stops' in update_data and update_data['stops'] and not isinstance(update_data['stops'], str):
                update_data['stops'] = json.dumps(update_data['stops'])
            
            update_data['updated_at'] = 'now()'
            
            # Update by UUID or route_id
            if isinstance(route_id, str) and len(route_id) > 20:
                result = execute_update('transport_routes', route_id, update_data)
            else:
                # First get the record by route_id to get its id
                existing = execute_query("SELECT id FROM transport_routes WHERE route_id = %s", [str(route_id)], fetch_all=False)
                if existing:
                    result = execute_update('transport_routes', existing['id'], update_data)
                else:
                    result = None
                
            return result
            
        except Exception as e:
            print(f"Error updating transport route: {e}")
            raise Exception(f"Failed to update transport route: {str(e)}")
    
    def delete(self, route_id: Any) -> bool:
        """Delete transport route"""
        try:
            # Delete by UUID or route_id
            if isinstance(route_id, str) and len(route_id) > 20:
                success = execute_delete('transport_routes', route_id)
            else:
                # First get the record by route_id to get its id
                existing = execute_query("SELECT id FROM transport_routes WHERE route_id = %s", [str(route_id)], fetch_all=False)
                if existing:
                    success = execute_delete('transport_routes', existing['id'])
                else:
                    success = False
                
            return success
        except Exception as e:
            print(f"Error deleting transport route: {e}")
            return False
    
    def get_count(self, filters: Dict = None) -> int:
        """Get total count of transport routes"""
        try:
            query = "SELECT COUNT(*) as count FROM transport_routes WHERE 1=1"
            params = []
            
            if filters:
                if filters.get('route_id'):
                    query += " AND route_id = %s"
                    params.append(filters['route_id'])
                if filters.get('route_name'):
                    query += " AND route_name = %s"
                    params.append(filters['route_name'])
                if filters.get('status'):
                    query += " AND status = %s"
                    params.append(filters['status'])
                if filters.get('search'):
                    query += " AND (route_id ILIKE %s OR route_name ILIKE %s)"
                    params.append(f"%{filters['search']}%")
            
            result = execute_query(query, params, fetch_all=False)
            return result.get('count', 0) if result else 0
        except Exception as e:
            print(f"Error getting transport routes count: {e}")
            return 0

# Flask route handlers
def get_transport_routes():
    """Get all transport routes with pagination"""
    try:
        controller = TransportRoutesController()
        
        # Get query parameters
        filters = request.args.to_dict()
        
        # Pagination parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        page = int(request.args.get('page', 1))
        
        if page > 1 and offset == 0:
            offset = (page - 1) * limit
        
        routes = controller.get_all(filters, limit, offset)
        total = controller.get_count(filters)
        
        return jsonify({
            'success': True,
            'data': routes,
            'total': total,
            'limit': limit,
            'offset': offset,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def get_transport_route(route_id):
    """Get specific transport route by ID"""
    try:
        controller = TransportRoutesController()
        route = controller.get_by_id(route_id)
        
        if route:
            return jsonify({'success': True, 'data': route})
        else:
            return jsonify({'success': False, 'error': 'Transport route not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def create_transport_route():
    """Create new transport route"""
    try:
        data = request.get_json()
        controller = TransportRoutesController()
        route = controller.create(data)
        return jsonify({'success': True, 'data': route})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def update_transport_route(route_id):
    """Update transport route"""
    try:
        data = request.get_json()
        controller = TransportRoutesController()
        route = controller.update(route_id, data)
        
        if route:
            return jsonify({'success': True, 'data': route})
        else:
            return jsonify({'success': False, 'error': 'Transport route not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def delete_transport_route(route_id):
    """Delete transport route"""
    try:
        controller = TransportRoutesController()
        success = controller.delete(route_id)
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Transport route not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

