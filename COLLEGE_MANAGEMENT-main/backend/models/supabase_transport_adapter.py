"""
Supabase Adapter for Transport Management System
This adapter will replace the SQLite models when Supabase credentials are provided
"""

from supabase import create_client
import os
from typing import List, Dict, Optional, Any
import json

class SupabaseTransportAdapter:
    """Adapter for Supabase database operations"""

    def __init__(self, supabase_or_url, supabase_key=None):
        if supabase_key is None and hasattr(supabase_or_url, 'table'):
            # It's a supabase client
            self.supabase = supabase_or_url
        else:
            # It's URL and key
            self.supabase = create_client(supabase_or_url, supabase_key)
    
    def get_connection(self):
        """Get Supabase client"""
        return self.supabase
    
    def dict_from_row(self, row) -> Dict:
        """Convert Supabase response to dictionary"""
        return row if isinstance(row, dict) else dict(row) if row else None

class SupabaseTransportStudent(SupabaseTransportAdapter):
    """Transport Student Model for Supabase"""

    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport students"""
        try:
            query = self.supabase.table('transport_students').select('*')

            if filters:
                if filters.get('student_id'):
                    query = query.eq('student_id', filters['student_id'])
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('fee_status'):
                    query = query.eq('fee_status', filters['fee_status'])
                if filters.get('search'):
                    search = filters['search']
                    query = query.or_(f"name.ilike.%{search}%,student_id.ilike.%{search}%,email.ilike.%{search}%")

            # Order by name column (matches actual database schema)
            response = query.order('name').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching students: {e}")
            return []

    def get_by_id(self, student_id: str) -> Optional[Dict]:
        """Get student by ID"""
        try:
            response = self.supabase.table('transport_students').select('*').eq('student_id', student_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching student: {e}")
            return None

    def create(self, data: Dict) -> Dict:
        """Create new transport student"""
        try:
            # Map the input data to match database schema
            route_id = data.get('route_id') or data.get('route_name')
            route_name = data.get('route_name') or data.get('route_id')
            
            db_data = {
                'student_id': data.get('student_id'),
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'address': data.get('address'),
                'route_id': route_id,
                'route_name': route_name,
                'pickup_point': data.get('pickup_point'),
                'status': data.get('status', 'Active'),
                'fee_status': data.get('fee_status', 'Pending')
            }
            response = self.supabase.table('transport_students').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating student: {e}")
            raise Exception(f"Failed to create student: {str(e)}")

    def update(self, student_id: str, data: Dict) -> Dict:
        """Update transport student"""
        try:
            # Map the input data to match database schema
            db_data = {}
            for field in ['name', 'email', 'phone', 'address', 'route_id', 'route_name', 'pickup_point', 'status', 'fee_status']:
                if field in data:
                    db_data[field] = data[field]
            
            # Cross-populate route fields if one is provided
            if 'route_id' in data and 'route_name' not in db_data:
                db_data['route_name'] = data['route_id']
            elif 'route_name' in data and 'route_id' not in db_data:
                db_data['route_id'] = data['route_name']

            response = self.supabase.table('transport_students').update(db_data).eq('student_id', student_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating student: {e}")
            raise Exception(f"Failed to update student: {str(e)}")

    def delete(self, student_id: str) -> bool:
        """Delete transport student"""
        try:
            response = self.supabase.table('transport_students').delete().eq('student_id', student_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting student: {e}")
            return False

class SupabaseTransportFaculty(SupabaseTransportAdapter):
    """Transport Faculty Model for Supabase"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport faculty"""
        try:
            query = self.supabase.table('transport_faculty').select('*')

            if filters:
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('department'):
                    query = query.eq('department', filters['department'])
                if filters.get('search'):
                    search = filters['search']
                    query = query.or_(f"name.ilike.%{search}%,faculty_id.ilike.%{search}%,email.ilike.%{search}%")

            # Order by name column to match expected sequence
            response = query.order('name').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching faculty: {e}")
            return []
    
    def get_by_id(self, faculty_id: str) -> Optional[Dict]:
        """Get faculty by ID"""
        try:
            response = self.supabase.table('transport_faculty').select('*').eq('faculty_id', faculty_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching faculty: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new transport faculty"""
        try:
            # Map the input data to match database schema
            db_data = {
                'faculty_id': data.get('faculty_id'),
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'department': data.get('department'),
                'route_id': data.get('route_id'),
                'route_name': data.get('route_name'),
                'status': data.get('status', 'Active')
            }
            response = self.supabase.table('transport_faculty').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating faculty: {e}")
            raise Exception(f"Failed to create faculty: {str(e)}")
    
    def update(self, faculty_id: str, data: Dict) -> Dict:
        """Update transport faculty"""
        try:
            # Map the input data to match database schema
            db_data = {}
            for field in ['name', 'email', 'phone', 'department', 'route_id', 'route_name', 'status']:
                if field in data:
                    db_data[field] = data[field]
            
            response = self.supabase.table('transport_faculty').update(db_data).eq('faculty_id', faculty_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating faculty: {e}")
            raise Exception(f"Failed to update faculty: {str(e)}")
    
    def delete(self, faculty_id: str) -> bool:
        """Delete transport faculty"""
        try:
            response = self.supabase.table('transport_faculty').delete().eq('faculty_id', faculty_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting faculty: {e}")
            return False

class SupabaseBus(SupabaseTransportAdapter):
    """Bus Model for Supabase"""

    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all buses"""
        try:
            query = self.supabase.table('transport_buses').select('*')
            
            if filters:
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('driver_id'):
                    query = query.eq('driver_id', filters['driver_id'])
                if filters.get('search'):
                    search = filters['search']
                    query = query.or_(f"bus_number.ilike.%{search}%,route_name.ilike.%{search}%,driver_name.ilike.%{search}%")
            
            response = query.order('bus_number').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching buses: {e}")
            return []
    
    def get_by_id(self, bus_id: Any) -> Optional[Dict]:
        """Get bus by ID or bus_number"""
        try:
            # Try UUID first
            query = self.supabase.table('transport_buses').select('*')
            if isinstance(bus_id, str) and len(bus_id) > 20: # Likely a UUID
                response = query.eq('id', bus_id).execute()
            else:
                response = query.eq('bus_number', str(bus_id)).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching bus: {e}")
            return None

    def create(self, data: Dict) -> Dict:
        """Create new bus"""
        try:
            # Map the input data to match database schema
            db_data = {
                'bus_number': data.get('bus_number'),
                'route_id': data.get('route_id'),
                'route_name': data.get('route_name'),
                'capacity': data.get('capacity'),
                'driver_id': data.get('driver_id'),
                'driver_name': data.get('driver_name'),
                'status': data.get('status', 'Active'),
                'last_service': data.get('last_service'),
                'next_service': data.get('next_service')
            }
            response = self.supabase.table('transport_buses').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating bus: {e}")
            raise Exception(f"Failed to create bus: {str(e)}")

    def update(self, bus_id: Any, data: Dict) -> Dict:
        """Update bus"""
        try:
            # Map fields
            db_data = {}
            for field in ['bus_number', 'route_id', 'route_name', 'capacity', 'driver_id', 'driver_name', 'status', 'last_service', 'next_service']:
                if field in data:
                    db_data[field] = data[field]
            
            # Update by ID or bus_number
            query = self.supabase.table('transport_buses').update(db_data)
            if isinstance(bus_id, str) and len(bus_id) > 20:
                response = query.eq('id', bus_id).execute()
            else:
                response = query.eq('bus_number', str(bus_id)).execute()
                
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating bus: {e}")
            raise Exception(f"Failed to update bus: {str(e)}")

    def delete(self, bus_id: Any) -> bool:
        """Delete bus"""
        try:
            query = self.supabase.table('transport_buses').delete()
            if isinstance(bus_id, str) and len(bus_id) > 20:
                response = query.eq('id', bus_id).execute()
            else:
                response = query.eq('bus_number', str(bus_id)).execute()
                
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting bus: {e}")
            return False

class SupabaseDriver(SupabaseTransportAdapter):
    """Driver Model for Supabase"""

    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all drivers"""
        try:
            query = self.supabase.table('transport_drivers').select('*')

            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('shift'):
                    query = query.eq('shift', filters['shift'])
                if filters.get('assigned_bus'):
                    query = query.eq('assigned_bus', filters['assigned_bus'])
                if filters.get('search'):
                    search = filters['search']
                    query = query.or_(f"name.ilike.%{search}%,driver_id.ilike.%{search}%,phone.ilike.%{search}%")

            response = query.order('name').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching drivers: {e}")
            return []

    def get_by_id(self, driver_id: str) -> Optional[Dict]:
        """Get driver by ID"""
        try:
            response = self.supabase.table('transport_drivers').select('*').eq('driver_id', driver_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching driver: {e}")
            return None

    def create(self, data: Dict) -> Dict:
        """Create new driver"""
        try:
            # Map fields
            db_data = {
                'driver_id': data.get('driver_id'),
                'name': data.get('name'),
                'phone': data.get('phone'),
                'license_number': data.get('license_number'),
                'license_expiry': data.get('license_expiry'),
                'blood_group': data.get('blood_group'),
                'emergency_contact': data.get('emergency_contact'),
                'experience_years': data.get('experience_years', 0),
                'shift': data.get('shift', 'Morning'),
                'working_hours': data.get('working_hours', '8 hours'),
                'assigned_bus': data.get('assigned_bus'),
                'status': data.get('status', 'Active')
            }
            response = self.supabase.table('transport_drivers').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating driver: {e}")
            raise Exception(f"Failed to create driver: {str(e)}")

    def update(self, driver_id: str, data: Dict) -> Dict:
        """Update driver"""
        try:
            # Map fields
            db_data = {}
            fields = ['name', 'phone', 'license_number', 'license_expiry', 'blood_group', 
                     'emergency_contact', 'experience_years', 'shift', 'working_hours', 
                     'assigned_bus', 'status']
            for field in fields:
                if field in data:
                    db_data[field] = data[field]
                    
            response = self.supabase.table('transport_drivers').update(db_data).eq('driver_id', driver_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating driver: {e}")
            raise Exception(f"Failed to update driver: {str(e)}")

    def delete(self, driver_id: str) -> bool:
        """Delete driver"""
        try:
            response = self.supabase.table('transport_drivers').delete().eq('driver_id', driver_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting driver: {e}")
            return False

class SupabaseRoute(SupabaseTransportAdapter):
    """Route Model for Supabase - matches transport_routes table schema"""

    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all routes from transport_routes table"""
        try:
            query = self.supabase.table('transport_routes').select('*')

            if filters:
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('assigned_bus'):
                    query = query.eq('assigned_bus', filters['assigned_bus'])
                if filters.get('search'):
                    search = filters['search']
                    query = query.or_(f"route_id.ilike.%{search}%,route_name.ilike.%{search}%")

            response = query.order('route_id').execute()
            routes = response.data if response.data else []
            
            # Parse JSON stops for each route
            for route in routes:
                if route.get('stops'):
                    if isinstance(route['stops'], str):
                        try:
                            route['stops'] = json.loads(route['stops'])
                        except:
                            route['stops'] = []
            
            return routes
        except Exception as e:
            print(f"Error fetching routes: {e}")
            return []

    def get_by_id(self, route_id: str) -> Optional[Dict]:
        """Get route by ID from transport_routes table"""
        try:
            response = self.supabase.table('transport_routes').select('*').eq('route_id', route_id).single().execute()
            route = response.data if response.data else None
            
            if route and route.get('stops'):
                if isinstance(route['stops'], str):
                    try:
                        route['stops'] = json.loads(route['stops'])
                    except:
                        route['stops'] = []
            
            return route
        except Exception as e:
            print(f"Error fetching route: {e}")
            return None

    def create(self, data: Dict) -> Dict:
        """Create new route in transport_routes table"""
        try:
            # Map fields
            db_data = {
                'route_id': data.get('route_id'),
                'route_name': data.get('route_name'),
                'stops': data.get('stops'),
                'pickup_time': data.get('pickup_time'),
                'drop_time': data.get('drop_time'),
                'total_students': data.get('total_students', 0),
                'assigned_bus': data.get('assigned_bus'),
                'assigned_driver': data.get('assigned_driver'),
                'status': data.get('status', 'Active')
            }
            
            # Convert stops to JSON if needed
            if db_data['stops'] and not isinstance(db_data['stops'], str):
                db_data['stops'] = json.dumps(db_data['stops'])
            
            response = self.supabase.table('transport_routes').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating route: {e}")
            raise Exception(f"Failed to create route: {str(e)}")

    def update(self, route_id: str, data: Dict) -> Dict:
        """Update route in transport_routes table"""
        try:
            # Map fields
            db_data = {}
            fields = ['route_name', 'stops', 'pickup_time', 'drop_time', 'total_students', 
                     'assigned_bus', 'assigned_driver', 'status']
            for field in fields:
                if field in data:
                    db_data[field] = data[field]
            
            # Convert stops to JSON if needed
            if 'stops' in db_data and db_data['stops'] and not isinstance(db_data['stops'], str):
                db_data['stops'] = json.dumps(db_data['stops'])
            
            response = self.supabase.table('transport_routes').update(db_data).eq('route_id', route_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating route: {e}")
            raise Exception(f"Failed to update route: {str(e)}")

    def delete(self, route_id: str) -> bool:
        """Delete route from transport_routes table"""
        try:
            response = self.supabase.table('transport_routes').delete().eq('route_id', route_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"Error deleting route: {e}")
            return False

class SupabaseTransportAttendance(SupabaseTransportAdapter):
    """Attendance Model for Supabase"""

    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport attendance records"""
        try:
            query = self.supabase.table('transport_attendance').select('*')

            if filters:
                if filters.get('date'):
                    query = query.eq('date', filters['date'])
                if filters.get('entity_type'):
                    query = query.eq('entity_type', filters['entity_type'])
                if filters.get('entity_id'):
                    query = query.eq('entity_id', filters['entity_id'])
                if filters.get('route_id'):
                    query = query.eq('route_id', filters['route_id'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('search'):
                    search = filters['search']
                    query = query.or_(f"entity_name.ilike.%{search}%,entity_id.ilike.%{search}%")

            response = query.order('date', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching attendance: {e}")
            return []

    def create(self, data: Dict) -> Dict:
        """Create attendance record"""
        try:
            db_data = {
                'date': data.get('date'),
                'entity_type': data.get('entity_type'),
                'entity_id': data.get('entity_id'),
                'entity_name': data.get('entity_name'),
                'route_id': data.get('route_id'),
                'bus_number': data.get('bus_number'),
                'status': data.get('status', 'Present'),
                'remarks': data.get('remarks')
            }
            response = self.supabase.table('transport_attendance').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating attendance: {e}")
            raise Exception(f"Failed to create attendance: {str(e)}")

    def get_by_id(self, attendance_id: Any) -> Optional[Dict]:
        """Get attendance by ID"""
        try:
            response = self.supabase.table('transport_attendance').select('*').eq('id', attendance_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching attendance by ID: {e}")
            return None

class SupabaseLiveLocation(SupabaseTransportAdapter):
    """Live Location Model for Supabase"""

    def get_all(self) -> List[Dict]:
        """Get all live locations"""
        try:
            response = self.supabase.table('transport_live_locations').select('*').order('last_update', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching live locations: {e}")
            return []

    def update_location(self, data: Dict) -> Dict:
        """Update bus location"""
        try:
            bus_id = data.get('bus_id')
            db_data = {
                'bus_id': bus_id,
                'bus_number': data.get('bus_number'),
                'route_id': data.get('route_id'),
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'speed': data.get('speed', 0),
                'status': data.get('status', 'Moving'),
                'driver_name': data.get('driver_name'),
                'last_update': 'now()' # Supabase/Postgres function
            }
            
            # Upsert logic in Supabase
            response = self.supabase.table('transport_live_locations').upsert(db_data, on_conflict='bus_id').execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating live location: {e}")
            raise Exception(f"Failed to update live location: {str(e)}")

class SupabaseTransportActivity(SupabaseTransportAdapter):
    """Activity Model for Supabase"""

    def create(self, activity_type: str, message: str, user_id: str = None, metadata: Dict = None) -> Optional[Dict]:
        """Create activity log"""
        try:
            db_data = {
                'type': activity_type,
                'message': message,
                'user_id': user_id,
                'metadata': metadata # Supabase handles dict/JSON
            }
            response = self.supabase.table('transport_activities').insert(db_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating activity: {e}")
            return None

    def get_recent(self, limit: int = 10) -> List[Dict]:
        """Get recent activities"""
        try:
            response = self.supabase.table('transport_activities').select('*').order('time', desc=True).limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching recent activities: {e}")
            return []

def initialize_supabase_transport(supabase_url: str, supabase_key: str):
    """Initialize Supabase transport models"""
    return {
        'student_model': SupabaseTransportStudent(supabase_url, supabase_key),
        'faculty_model': SupabaseTransportFaculty(supabase_url, supabase_key),
        'bus_model': SupabaseBus(supabase_url, supabase_key),
        'driver_model': SupabaseDriver(supabase_url, supabase_key),
        'route_model': SupabaseRoute(supabase_url, supabase_key),
        'attendance_model': SupabaseTransportAttendance(supabase_url, supabase_key),
        'location_model': SupabaseLiveLocation(supabase_url, supabase_key),
        'activity_model': SupabaseTransportActivity(supabase_url, supabase_key),
    }

# Example usage:
# When you provide your Supabase credentials, you can switch to Supabase by:
# 1. Setting environment variables SUPABASE_URL and SUPABASE_KEY
# 2. Updating the controllers to use Supabase models instead of SQLite models
# 3. The API endpoints will remain the same
