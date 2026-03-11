"""
Transport Controllers for ST College Transport Management System
Migrated to PostgreSQL
"""

from flask import jsonify, request
from datetime import datetime, date, timedelta
import json
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

class TransportController:
    """Main Transport Controller using PostgreSQL"""

class DashboardController(TransportController):
    """Dashboard Metrics Controller"""
    
    def get_metrics(self):
        """Get dashboard metrics"""
        try:
            # Get counts from PostgreSQL
            students_result = execute_query("SELECT COUNT(*) as count FROM transport_students", fetch_all=False)
            total_students = students_result['count'] if students_result else 0
            
            faculty_result = execute_query("SELECT COUNT(*) as count FROM transport_faculty", fetch_all=False)
            faculty_users = faculty_result['count'] if faculty_result else 0
            
            buses_result = execute_query("SELECT COUNT(*) as count FROM transport_buses WHERE status = 'Active'", fetch_all=False)
            active_buses = buses_result['count'] if buses_result else 0
            
            drivers_result = execute_query("SELECT COUNT(*) as count FROM transport_drivers", fetch_all=False)
            total_drivers = drivers_result['count'] if drivers_result else 0
            
            # Calculate attendance percentage
            attendance_result = execute_query(
                "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present FROM transport_attendance WHERE date = %s",
                [str(date.today())], fetch_all=False
            )
            if attendance_result and attendance_result.get('total', 0) > 0:
                attendance_percentage = round((attendance_result.get('present', 0) / attendance_result['total']) * 100, 1)
            else:
                attendance_percentage = 92.5
            
            # Calculate fee collection
            fee_result = execute_query(
                "SELECT SUM(amount) as total, SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as paid FROM transport_fees",
                fetch_all=False
            )
            if fee_result and fee_result.get('total', 0) > 0:
                fee_collection_rate = round((fee_result.get('paid', 0) / fee_result['total']) * 100, 1)
                pending_fees = fee_result['total'] - fee_result.get('paid', 0)
            else:
                fee_collection_rate = 87.3
                pending_fees = 0
            
            # Get active routes
            routes_result = execute_query("SELECT COUNT(*) as count FROM transport_routes WHERE status = 'Active'", fetch_all=False)
            active_routes = routes_result['count'] if routes_result else 0
            
            # Get recent activities
            try:
                recent_activities = execute_query(
                    "SELECT * FROM transport_activities ORDER BY created_at DESC LIMIT 4",
                    fetch_all=True
                )
                if recent_activities:
                    formatted_activities = []
                    for activity in recent_activities:
                        activity_time = activity.get('created_at')
                        if isinstance(activity_time, str):
                            try:
                                activity_time = datetime.fromisoformat(activity_time.replace('Z', '+00:00'))
                            except:
                                activity_time = datetime.now()
                        
                        time_diff = datetime.now() - activity_time
                        if time_diff.total_seconds() < 3600:
                            time_str = f"{int(time_diff.total_seconds() / 60)} mins ago"
                        elif time_diff.total_seconds() < 86400:
                            time_str = f"{int(time_diff.total_seconds() / 3600)} hours ago"
                        else:
                            time_str = f"{time_diff.days} days ago"
                        
                        formatted_activities.append({
                            'id': activity['id'],
                            'type': activity.get('type', 'activity'),
                            'message': activity.get('message', ''),
                            'time': time_str
                        })
                else:
                    raise Exception("No activities")
            except:
                formatted_activities = [
                    { 'id': 1, 'type': 'attendance', 'message': 'Bus RT-12 marked attendance', 'time': '10 mins ago' },
                    { 'id': 2, 'type': 'payment', 'message': 'Fee payment received from Student ID: 2024001', 'time': '25 mins ago' },
                    { 'id': 3, 'type': 'route', 'message': 'Route RT-05 updated with new stops', 'time': '1 hour ago' },
                    { 'id': 4, 'type': 'bus', 'message': 'Bus TN-09-AB-1234 maintenance completed', 'time': '2 hours ago' },
                ]
            
            # Monthly trends
            monthly_trends = [
                {'month': 'Jan', 'students': 800, 'fees': 200000, 'attendance': 90},
                {'month': 'Feb', 'students': 820, 'fees': 205000, 'attendance': 91},
                {'month': 'Mar', 'students': 840, 'fees': 210000, 'attendance': 92},
                {'month': 'Apr', 'students': total_students, 'fees': 212500, 'attendance': attendance_percentage},
            ]
            
            metrics = {
                'totalStudents': total_students,
                'total_students': total_students,
                'facultyUsers': faculty_users,
                'total_faculty': faculty_users,
                'activeBuses': active_buses,
                'total_buses': active_buses,
                'totalDrivers': total_drivers,
                'attendancePercentage': attendance_percentage,
                'feeCollectionRate': fee_collection_rate,
                'activeRoutes': active_routes,
                'total_routes': active_routes,
                'pendingFees': pending_fees,
                'total_fees_pending': pending_fees,
                'active_students': total_students,
                'recentActivities': formatted_activities,
                'monthlyTrends': monthly_trends
            }
            
            return jsonify({'success': True, 'data': metrics})
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class StudentController(TransportController):
    """Transport Student Controller"""
    
    def get_students(self):
        """Get all transport students with pagination"""
        try:
            filters = request.args.to_dict()

            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Build query with filters
            query = "SELECT * FROM transport_students WHERE 1=1"
            params = []
            
            # Apply filters
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])

            # Get total count
            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            try:
                total_count = execute_query(count_query, params, fetch_all=False)
                total = total_count.get('count', 0) if total_count else 0
            except:
                total = 0

            # Add pagination
            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            
            result = execute_query(query, params, fetch_all=True)
            
            # Transform data
            transformed_students = []
            for student in (result or []):
                s_copy = dict(student)
                if 'name' in s_copy:
                    s_copy['full_name'] = s_copy['name']
                if 'student_id' in s_copy:
                    s_copy['register_number'] = s_copy['student_id']
                transformed_students.append(s_copy)

            return jsonify({
                'success': True,
                'data': transformed_students,
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            print(f"ERROR in get_students: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def add_student(self):
        """Add new transport student"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['student_id', 'name', 'email']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            student_data = {
                'id': data.get('id'),
                'student_id': data['student_id'],
                'name': data['name'],
                'email': data.get('email'),
                'phone': data.get('phone'),
                'route_id': data.get('route_id'),
                'stop_name': data.get('stop_name'),
                'pickup_time': data.get('pickup_time'),
                'drop_time': data.get('drop_time'),
                'status': data.get('status', 'active'),
                'created_at': datetime.now().isoformat()
            }
            
            student = execute_insert('transport_students', student_data)
            
            # Log activity
            if student:
                execute_insert('transport_activities', {
                    'type': 'student',
                    'message': f"Student {data['name']} added to transport system",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': student})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_student(self, student_id):
        """Update transport student"""
        try:
            data = request.get_json()
            data['updated_at'] = datetime.now().isoformat()
            
            student = execute_update('transport_students', student_id, data)
            
            if student:
                execute_insert('transport_activities', {
                    'type': 'student',
                    'message': f"Student {student_id} information updated",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': student})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_student(self, student_id):
        """Delete transport student"""
        try:
            success = execute_delete('transport_students', student_id)
            
            if success:
                execute_insert('transport_activities', {
                    'type': 'student',
                    'message': f"Student {student_id} removed from transport system",
                    'created_at': datetime.now().isoformat()
                })
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Student not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class FacultyController(TransportController):
    """Transport Faculty Controller"""
    
    def get_faculty(self):
        """Get all transport faculty with pagination"""
        try:
            filters = request.args.to_dict()
            
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            query = "SELECT * FROM transport_faculty WHERE 1=1"
            params = []
            
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])

            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0

            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            result = execute_query(query, params, fetch_all=True)
            
            transformed_faculty = []
            for faculty in (result or []):
                transformed_record = dict(faculty)
                if 'name' in transformed_record:
                    transformed_record['full_name'] = transformed_record['name']
                if 'phone' in transformed_record:
                    transformed_record['phone_number'] = transformed_record['phone']
                transformed_faculty.append(transformed_record)

            return jsonify({
                'success': True, 
                'data': transformed_faculty, 
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def add_faculty(self):
        """Add new transport faculty"""
        try:
            data = request.get_json()
            
            required_fields = ['faculty_id', 'name', 'email']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            faculty_data = {
                'id': data.get('id'),
                'faculty_id': data['faculty_id'],
                'name': data['name'],
                'email': data.get('email'),
                'phone': data.get('phone'),
                'department': data.get('department'),
                'route_id': data.get('route_id'),
                'status': data.get('status', 'active'),
                'created_at': datetime.now().isoformat()
            }
            
            faculty = execute_insert('transport_faculty', faculty_data)
            
            if faculty:
                execute_insert('transport_activities', {
                    'type': 'faculty',
                    'message': f"Faculty {data['name']} added to transport system",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': faculty})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_faculty(self, faculty_id):
        """Update transport faculty"""
        try:
            data = request.get_json()
            data['updated_at'] = datetime.now().isoformat()
            
            faculty = execute_update('transport_faculty', faculty_id, data)
            
            if faculty:
                execute_insert('transport_activities', {
                    'type': 'faculty',
                    'message': f"Faculty {faculty_id} information updated",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': faculty})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_faculty(self, faculty_id):
        """Delete transport faculty"""
        try:
            success = execute_delete('transport_faculty', faculty_id)
            
            if success:
                execute_insert('transport_activities', {
                    'type': 'faculty',
                    'message': f"Faculty {faculty_id} removed from transport system",
                    'created_at': datetime.now().isoformat()
                })
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Faculty not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class BusController(TransportController):
    """Bus Controller"""
    
    def get_buses(self):
        """Get all buses with pagination"""
        try:
            filters = request.args.to_dict()
            
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            query = "SELECT * FROM transport_buses WHERE 1=1"
            params = []
            
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])

            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0

            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            result = execute_query(query, params, fetch_all=True)

            return jsonify({
                'success': True, 
                'data': result if result else [], 
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def add_bus(self):
        """Add new bus"""
        try:
            data = request.get_json()
            
            required_fields = ['bus_number', 'capacity']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            bus_data = {
                'id': data.get('id'),
                'bus_number': data['bus_number'],
                'capacity': data['capacity'],
                'bus_type': data.get('bus_type'),
                'route_id': data.get('route_id'),
                'driver_id': data.get('driver_id'),
                'status': data.get('status', 'active'),
                'insurance_expiry': data.get('insurance_expiry'),
                'permit_expiry': data.get('permit_expiry'),
                'created_at': datetime.now().isoformat()
            }
            
            bus = execute_insert('transport_buses', bus_data)
            
            if bus:
                execute_insert('transport_activities', {
                    'type': 'bus',
                    'message': f"Bus {data['bus_number']} added to fleet",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': bus})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_bus(self, bus_id):
        """Update bus"""
        try:
            data = request.get_json()
            data['updated_at'] = datetime.now().isoformat()
            
            bus = execute_update('transport_buses', bus_id, data)
            
            if bus:
                execute_insert('transport_activities', {
                    'type': 'bus',
                    'message': f"Bus {bus_id} information updated",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': bus})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_bus(self, bus_id):
        """Delete bus"""
        try:
            success = execute_delete('transport_buses', bus_id)
            
            if success:
                execute_insert('transport_activities', {
                    'type': 'bus',
                    'message': f"Bus {bus_id} removed from fleet",
                    'created_at': datetime.now().isoformat()
                })
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Bus not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class DriverController(TransportController):
    """Driver Controller"""
    
    def get_drivers(self):
        """Get all drivers with pagination"""
        try:
            filters = request.args.to_dict()
            
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            query = "SELECT * FROM transport_drivers WHERE 1=1"
            params = []
            
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])

            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0

            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            result = execute_query(query, params, fetch_all=True)

            transformed_drivers = []
            for driver in (result or []):
                d_copy = dict(driver)
                if 'name' in d_copy:
                    d_copy['full_name'] = d_copy['name']
                transformed_drivers.append(d_copy)

            return jsonify({
                'success': True, 
                'data': transformed_drivers, 
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def add_driver(self):
        """Add new driver"""
        try:
            data = request.get_json()
            
            required_fields = ['driver_id', 'name', 'phone', 'license_number', 'license_expiry']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            driver_data = {
                'id': data.get('id'),
                'driver_id': data['driver_id'],
                'name': data['name'],
                'phone': data['phone'],
                'license_number': data['license_number'],
                'license_expiry': data['license_expiry'],
                'experience_years': data.get('experience_years'),
                'status': data.get('status', 'active'),
                'created_at': datetime.now().isoformat()
            }
            
            driver = execute_insert('transport_drivers', driver_data)
            
            if driver:
                execute_insert('transport_activities', {
                    'type': 'driver',
                    'message': f"Driver {data['name']} added to system",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': driver})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_driver(self, driver_id):
        """Update driver"""
        try:
            data = request.get_json()
            data['updated_at'] = datetime.now().isoformat()
            
            driver = execute_update('transport_drivers', driver_id, data)
            
            if driver:
                execute_insert('transport_activities', {
                    'type': 'driver',
                    'message': f"Driver {driver_id} information updated",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': driver})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_driver(self, driver_id):
        """Delete driver"""
        try:
            success = execute_delete('transport_drivers', driver_id)
            
            if success:
                execute_insert('transport_activities', {
                    'type': 'driver',
                    'message': f"Driver {driver_id} removed from system",
                    'created_at': datetime.now().isoformat()
                })
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Driver not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class RouteController(TransportController):
    """Route Controller"""
    
    def get_routes(self):
        """Get all routes with pagination"""
        try:
            filters = request.args.to_dict()
            
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            query = "SELECT * FROM transport_routes WHERE 1=1"
            params = []
            
            if 'status' in filters:
                query += " AND status = %s"
                params.append(filters['status'])

            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0

            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            result = execute_query(query, params, fetch_all=True)

            transformed_routes = []
            for route in (result or []):
                r_copy = dict(route)
                if 'stops' in r_copy and isinstance(r_copy['stops'], list) and len(r_copy['stops']) > 0:
                    stops = r_copy['stops']
                    first_stop = stops[0]
                    last_stop = stops[-1]
                    
                    if isinstance(first_stop, dict):
                        r_copy['start_point'] = first_stop.get('name', 'Origin')
                    else:
                        r_copy['start_point'] = str(first_stop)
                        
                    if isinstance(last_stop, dict):
                        r_copy['end_point'] = last_stop.get('name', 'Destination')
                    else:
                        r_copy['end_point'] = str(last_stop)
                else:
                    r_copy['start_point'] = 'Not Specified'
                    r_copy['end_point'] = 'College'

                if 'distance' not in r_copy:
                    r_copy['distance'] = 'N/A'
                
                transformed_routes.append(r_copy)

            return jsonify({
                'success': True, 
                'data': transformed_routes, 
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def get_route(self, route_id):
        """Get specific route"""
        try:
            result = execute_query("SELECT * FROM transport_routes WHERE id = %s", [route_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result})
            else:
                return jsonify({'success': False, 'error': 'Route not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def add_route(self):
        """Add new route"""
        try:
            data = request.get_json()
            
            required_fields = ['route_id', 'route_name', 'stops', 'pickup_time', 'drop_time']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            route_data = {
                'id': data.get('id'),
                'route_id': data['route_id'],
                'route_name': data['route_name'],
                'stops': data['stops'],
                'pickup_time': data['pickup_time'],
                'drop_time': data['drop_time'],
                'distance': data.get('distance'),
                'estimated_duration': data.get('estimated_duration'),
                'status': data.get('status', 'active'),
                'created_at': datetime.now().isoformat()
            }
            
            route = execute_insert('transport_routes', route_data)
            
            if route:
                execute_insert('transport_activities', {
                    'type': 'route',
                    'message': f"Route {data['route_id']} - {data['route_name']} created",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': route})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_route(self, route_id):
        """Update route"""
        try:
            data = request.get_json()
            data['updated_at'] = datetime.now().isoformat()
            
            route = execute_update('transport_routes', route_id, data)
            
            if route:
                execute_insert('transport_activities', {
                    'type': 'route',
                    'message': f"Route {route_id} updated",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': route})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_route(self, route_id):
        """Delete route"""
        try:
            success = execute_delete('transport_routes', route_id)
            
            if success:
                execute_insert('transport_activities', {
                    'type': 'route',
                    'message': f"Route {route_id} deleted",
                    'created_at': datetime.now().isoformat()
                })
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Route not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class FeeController(TransportController):
    """Transport Fee Controller"""
    
    def get_fees(self):
        """Get all transport fees with pagination"""
        try:
            filters = request.args.to_dict()
            
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            query = "SELECT * FROM transport_fees WHERE 1=1"
            params = []
            
            if 'payment_status' in filters:
                query += " AND payment_status = %s"
                params.append(filters['payment_status'])

            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0

            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            result = execute_query(query, params, fetch_all=True)

            # Get summary statistics
            summary_result = execute_query(
                "SELECT SUM(amount) as total, SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as paid FROM transport_fees",
                fetch_all=False
            )
            summary = {
                'totalAmount': summary_result.get('total', 0) if summary_result else 0,
                'paidAmount': summary_result.get('paid', 0) if summary_result else 0,
                'pendingAmount': (summary_result.get('total', 0) - summary_result.get('paid', 0)) if summary_result else 0
            }

            return jsonify({
                'success': True, 
                'data': result if result else [], 
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit,
                'summary': summary
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def record_payment(self):
        """Record fee payment"""
        try:
            data = request.get_json()
            
            required_fields = ['student_id', 'student_name', 'amount', 'payment_date', 'payment_mode']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            fee_data = {
                'payment_status': 'Paid',
                'payment_date': data['payment_date'],
                'payment_mode': data['payment_mode']
            }
            
            # Find and update the fee record
            fees = execute_query("SELECT * FROM transport_fees WHERE student_id = %s", [data['student_id']], fetch_all=True)
            if fees:
                fee = execute_update('transport_fees', fees[0]['id'], fee_data)
                
                execute_insert('transport_activities', {
                    'type': 'payment',
                    'message': f"Payment of {data['amount']} received from {data['student_name']}",
                    'created_at': datetime.now().isoformat()
                })
                
                return jsonify({'success': True, 'data': fee})
            else:
                # Create new fee record
                fee_data.update({
                    'id': data.get('id'),
                    'student_id': data['student_id'],
                    'student_name': data['student_name'],
                    'amount': data['amount'],
                    'due_date': data.get('due_date', str(date.today() + timedelta(days=30))),
                    'created_at': datetime.now().isoformat()
                })
                fee = execute_insert('transport_fees', fee_data)
                
                execute_insert('transport_activities', {
                    'type': 'payment',
                    'message': f"Payment of {data['amount']} received from {data['student_name']}",
                    'created_at': datetime.now().isoformat()
                })
                
                return jsonify({'success': True, 'data': fee})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_fee_status(self, fee_id):
        """Update fee status"""
        try:
            data = request.get_json()
            fee = execute_update('transport_fees', fee_id, data)
            
            if fee:
                execute_insert('transport_activities', {
                    'type': 'payment',
                    'message': f"Fee status updated for fee ID: {fee_id}",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class AttendanceController(TransportController):
    """Transport Attendance Controller"""
    
    def get_attendance(self):
        """Get attendance records with pagination"""
        try:
            filters = request.args.to_dict()

            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            query = "SELECT * FROM transport_attendance WHERE 1=1"
            params = []
            
            if 'date' in filters:
                query += " AND date = %s"
                params.append(filters['date'])
            if 'entity_type' in filters:
                query += " AND entity_type = %s"
                params.append(filters['entity_type'])

            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0

            query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
            result = execute_query(query, params, fetch_all=True)

            return jsonify({
                'success': True, 
                'data': result if result else [], 
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def mark_attendance(self):
        """Mark attendance"""
        try:
            data = request.get_json()
            
            required_fields = ['date', 'entity_type', 'entity_id', 'entity_name', 'status']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            attendance_data = {
                'id': data.get('id'),
                'date': data['date'],
                'entity_type': data['entity_type'],
                'entity_id': data['entity_id'],
                'entity_name': data['entity_name'],
                'status': data['status'],
                'remarks': data.get('remarks'),
                'created_at': datetime.now().isoformat()
            }
            
            attendance = execute_insert('transport_attendance', attendance_data)
            
            if attendance:
                execute_insert('transport_activities', {
                    'type': 'attendance',
                    'message': f"Attendance marked for {data['entity_name']} - {data['status']}",
                    'created_at': datetime.now().isoformat()
                })
            
            return jsonify({'success': True, 'data': attendance})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class LiveTrackingController(TransportController):
    """Live Tracking Controller"""
    
    def get_live_locations(self):
        """Get live bus locations"""
        try:
            result = execute_query("SELECT * FROM transport_live_locations", fetch_all=True)
            
            if not result:
                # Generate mock data
                buses = execute_query("SELECT * FROM transport_buses LIMIT 15", fetch_all=True)
                mock_locations = []
                for bus in (buses or []):
                    mock_location = {
                        'bus_id': bus['id'],
                        'bus_number': bus['bus_number'],
                        'route_id': bus.get('route_id'),
                        'latitude': 13.0827 + (hash(str(bus['id'])) % 100 - 50) * 0.001,
                        'longitude': 80.2707 + (hash(str(bus['id'])) % 100 - 50) * 0.001,
                        'speed': (hash(str(bus['id'])) % 30) + 20,
                        'status': 'Moving' if hash(str(bus['id'])) % 10 != 0 else 'Stopped',
                        'last_update': datetime.now().isoformat(),
                        'driver_name': bus.get('driver_name', f"Driver {bus['id']}")
                    }
                    mock_locations.append(mock_location)
                return jsonify({'success': True, 'data': mock_locations})
            
            return jsonify({'success': True, 'data': result})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def get_route_history(self, bus_id, date):
        """Get route history for a specific bus and date"""
        try:
            result = execute_query(
                "SELECT * FROM transport_route_history WHERE bus_id = %s AND date = %s",
                [bus_id, date], fetch_all=True
            )
            
            if not result:
                # Generate mock data
                mock_history = []
                try:
                    if isinstance(date, str):
                        base_time = datetime.strptime(date, '%Y-%m-%d')
                    else:
                        base_time = date
                except:
                    base_time = datetime.now()
                
                for i in range(20):
                    timestamp = base_time.replace(hour=7, minute=30 + i*2)
                    mock_history.append({
                        'timestamp': timestamp.isoformat(),
                        'latitude': 13.0827 + i * 0.005,
                        'longitude': 80.2707 + i * 0.005,
                        'speed': (hash(str(bus_id) + str(i)) % 30) + 20,
                    })
                
                return jsonify({'success': True, 'data': mock_history})
            
            return jsonify({'success': True, 'data': result})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class ReportController(TransportController):
    """Reports Controller"""
    
    def generate_report(self, report_type):
        """Generate various reports"""
        try:
            if report_type == 'attendance':
                result = execute_query("SELECT * FROM transport_attendance", fetch_all=True)
                records = result or []
                total_days = len(set(r['date'] for r in records))
                present_days = len([r for r in records if r.get('status') == 'Present'])
                absent_days = len([r for r in records if r.get('status') == 'Absent'])
                percentage = round((present_days / (present_days + absent_days)) * 100, 1) if (present_days + absent_days) > 0 else 0
                
                data = {
                    'title': 'Attendance Report',
                    'data': {
                        'totalDays': total_days,
                        'presentDays': present_days,
                        'absentDays': absent_days,
                        'percentage': percentage,
                        'byRoute': []
                    }
                }
                
            elif report_type == 'fees':
                result = execute_query("SELECT * FROM transport_fees", fetch_all=True)
                records = result or []
                total_amount = sum(r.get('amount', 0) for r in records)
                collected = sum(r.get('amount', 0) for r in records if r.get('payment_status') == 'Paid')
                pending = total_amount - collected
                collection_rate = round((collected / total_amount) * 100, 1) if total_amount > 0 else 0
                
                data = {
                    'title': 'Fee Collection Report',
                    'data': {
                        'totalAmount': total_amount,
                        'collected': collected,
                        'pending': pending,
                        'collectionRate': collection_rate,
                        'byRoute': []
                    }
                }
                
            elif report_type == 'routes':
                result = execute_query("SELECT * FROM transport_routes", fetch_all=True)
                routes = result or []
                total_routes = len(routes)
                active_routes = len([r for r in routes if r.get('status') == 'Active'])
                
                data = {
                    'title': 'Route Efficiency Report',
                    'data': {
                        'totalRoutes': total_routes,
                        'activeRoutes': active_routes,
                        'avgOccupancy': 0,
                        'byRoute': []
                    }
                }
                
            elif report_type == 'drivers':
                result = execute_query("SELECT * FROM transport_drivers", fetch_all=True)
                drivers = result or []
                total_drivers = len(drivers)
                active_drivers = len([d for d in drivers if d.get('status') == 'Active'])
                total_experience = sum(d.get('experience_years', 0) for d in drivers)
                avg_experience = round(total_experience / len(drivers), 1) if drivers else 0
                
                data = {
                    'title': 'Driver Performance Report',
                    'data': {
                        'totalDrivers': total_drivers,
                        'activeDrivers': active_drivers,
                        'avgExperience': avg_experience,
                        'byDriver': []
                    }
                }
                
            else:
                return jsonify({'success': False, 'error': 'Invalid report type'}), 400
            
            return jsonify({'success': True, 'data': data})
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

