"""
Transport Controllers for ST College Transport Management System
"""

from flask import jsonify, request
from datetime import datetime, date, timedelta
import json
from models.transport_models import (
    TransportStudent, TransportFaculty, Bus, Driver, Route, 
    TransportFee, TransportAttendance, LiveLocation, TransportActivity
)
from models.supabase_transport_adapter import (
    SupabaseTransportStudent, SupabaseTransportFaculty, SupabaseBus, 
    SupabaseDriver, SupabaseRoute, SupabaseTransportAttendance,
    SupabaseLiveLocation, SupabaseTransportActivity
)
from models.supabase_transport_fee import SupabaseTransportFee
from supabase_client import get_supabase

class TransportController:
    """Main Transport Controller"""

    def __init__(self):
        # Use Supabase models for production (where available)
        supabase = get_supabase()

        self.student_model = SupabaseTransportStudent(supabase)
        self.faculty_model = SupabaseTransportFaculty(supabase)
        self.bus_model = SupabaseBus(supabase)
        self.driver_model = SupabaseDriver(supabase)
        self.route_model = SupabaseRoute(supabase)
        self.fee_model = SupabaseTransportFee(supabase)
        self.attendance_model = SupabaseTransportAttendance(supabase)
        self.location_model = SupabaseLiveLocation(supabase)
        self.activity_model = SupabaseTransportActivity(supabase)

class DashboardController(TransportController):
    """Dashboard Metrics Controller"""
    
    def get_metrics(self):
        """Get dashboard metrics"""
        try:
            # Get counts
            total_students = len(self.student_model.get_all())
            faculty_users = len(self.faculty_model.get_all())
            active_buses = len(self.bus_model.get_all({'status': 'Active'}))
            total_drivers = len(self.driver_model.get_all())
            
            # Calculate attendance percentage
            attendance_records = self.attendance_model.get_all({'date': str(date.today())})
            if attendance_records:
                present_count = len([r for r in attendance_records if r['status'] == 'Present'])
                attendance_percentage = round((present_count / len(attendance_records)) * 100, 1)
            else:
                attendance_percentage = 92.5  # Default value
            
            # Calculate fee collection rate and pending fees using fee stats
            fee_stats = self.fee_model.get_payment_statistics()
            fee_collection_rate = fee_stats.get('collection_rate', 87.3)
            pending_fees = fee_stats.get('pending_amount', 0)
            
            # Get active routes
            active_routes = len(self.route_model.get_all({'status': 'Active'}))
            
            # Get recent activities
            try:
                recent_activities = self.activity_model.get_recent(4)
                formatted_activities = []
                for activity in recent_activities:
                    # Handle different time field names (time or created_at)
                    activity_time = activity.get('time') or activity.get('created_at')
                    if not activity_time:
                        activity_time = datetime.now()
                    
                    if isinstance(activity_time, str):
                        try:
                            # Try parsing ISO format datetime string
                            activity_time = datetime.fromisoformat(activity_time.replace('Z', '+00:00'))
                        except (ValueError, AttributeError):
                            try:
                                # Try parsing common datetime formats
                                activity_time = datetime.strptime(activity_time, '%Y-%m-%d %H:%M:%S')
                            except ValueError:
                                # If parsing fails, use current time as fallback
                                activity_time = datetime.now()
                    
                    time_diff = datetime.now() - activity_time
                    if time_diff.total_seconds() < 3600:  # Less than 1 hour
                        time_str = f"{int(time_diff.total_seconds() / 60)} mins ago"
                    elif time_diff.total_seconds() < 86400:  # Less than 1 day
                        time_str = f"{int(time_diff.total_seconds() / 3600)} hours ago"
                    else:
                        time_str = f"{time_diff.days} days ago"
                    
                    formatted_activities.append({
                        'id': activity['id'],
                        'type': activity['type'],
                        'message': activity['message'],
                        'time': time_str
                    })
            except Exception as e:
                print(f"Warning: Could not fetch recent activities: {e}")
                # Provide mock recent activities when table is not available
                formatted_activities = [
                    { 'id': 1, 'type': 'attendance', 'message': 'Bus RT-12 marked attendance', 'time': '10 mins ago' },
                    { 'id': 2, 'type': 'payment', 'message': 'Fee payment received from Student ID: 2024001', 'time': '25 mins ago' },
                    { 'id': 3, 'type': 'route', 'message': 'Route RT-05 updated with new stops', 'time': '1 hour ago' },
                    { 'id': 4, 'type': 'bus', 'message': 'Bus TN-09-AB-1234 maintenance completed', 'time': '2 hours ago' },
                ]
            
            # Generate monthly trends (mock data for now)
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
                'active_students': total_students, # Assuming all are active for now
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

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            # Get all students (for now - could optimize with pagination in model)
            all_students = self.student_model.get_all(model_filters)

            # Debug logging
            print(f"DEBUG: Retrieved {len(all_students)} students from model")
            if all_students:
                print(f"DEBUG: First student: {all_students[0]}")

            # Apply pagination
            total = len(all_students)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_students = all_students[start_idx:end_idx]

            # Transform data for frontend compatibility
            transformed_students = []
            for student in paginated_students:
                s_copy = student.copy()
                if 'name' in s_copy:
                    s_copy['full_name'] = s_copy['name']
                if 'student_id' in s_copy:
                    s_copy['register_number'] = s_copy['student_id']
                transformed_students.append(s_copy)

            # Return paginated response
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
            
            student = self.student_model.create(data)
            
            # Log activity
            self.activity_model.create(
                'student', f'Student {data["name"]} added to transport system',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': student})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_student(self, student_id):
        """Update transport student"""
        try:
            data = request.get_json()
            student = self.student_model.update(student_id, data)
            
            # Log activity
            self.activity_model.create(
                'student', f'Student {student_id} information updated',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': student})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_student(self, student_id):
        """Delete transport student"""
        try:
            success = self.student_model.delete(student_id)
            
            if success:
                # Log activity
                self.activity_model.create(
                    'student', f'Student {student_id} removed from transport system',
                    request.headers.get('User-ID')
                )
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
            
            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            all_faculty = self.faculty_model.get_all(model_filters)
            
            # Transform data to match expected API schema
            transformed_faculty = []
            for faculty in all_faculty:
                # Create a new dict to avoid modifying original
                transformed_record = faculty.copy()
                
                # Map fields for frontend compatibility
                if 'name' in transformed_record:
                    transformed_record['full_name'] = transformed_record['name']
                
                # Map 'phone' to 'phone_number' for API compatibility
                if 'phone' in transformed_record:
                    transformed_record['phone_number'] = transformed_record['phone']
                
                transformed_faculty.append(transformed_record)
            
            # Apply pagination
            total = len(transformed_faculty)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_faculty = transformed_faculty[start_idx:end_idx]

            return jsonify({
                'success': True, 
                'data': paginated_faculty, 
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
            
            # Validate required fields
            required_fields = ['faculty_id', 'name', 'email']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            faculty = self.faculty_model.create(data)
            
            # Log activity
            self.activity_model.create(
                'faculty', f'Faculty {data["name"]} added to transport system',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': faculty})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_faculty(self, faculty_id):
        """Update transport faculty"""
        try:
            data = request.get_json()
            faculty = self.faculty_model.update(faculty_id, data)
            
            # Log activity
            self.activity_model.create(
                'faculty', f'Faculty {faculty_id} information updated',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': faculty})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_faculty(self, faculty_id):
        """Delete transport faculty"""
        try:
            success = self.faculty_model.delete(faculty_id)
            
            if success:
                # Log activity
                self.activity_model.create(
                    'faculty', f'Faculty {faculty_id} removed from transport system',
                    request.headers.get('User-ID')
                )
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
            
            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            all_buses = self.bus_model.get_all(model_filters)
            
            # Apply pagination
            total = len(all_buses)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_buses = all_buses[start_idx:end_idx]

            return jsonify({
                'success': True, 
                'data': paginated_buses, 
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
            
            # Validate required fields
            required_fields = ['bus_number', 'capacity']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            bus = self.bus_model.create(data)
            
            # Log activity
            self.activity_model.create(
                'bus', f'Bus {data["bus_number"]} added to fleet',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': bus})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_bus(self, bus_id):
        """Update bus"""
        try:
            data = request.get_json()
            bus = self.bus_model.update(bus_id, data)
            
            # Log activity
            self.activity_model.create(
                'bus', f'Bus {bus_id} information updated',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': bus})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_bus(self, bus_id):
        """Delete bus"""
        try:
            success = self.bus_model.delete(bus_id)
            
            if success:
                # Log activity
                self.activity_model.create(
                    'bus', f'Bus {bus_id} removed from fleet',
                    request.headers.get('User-ID')
                )
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
            
            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            all_drivers = self.driver_model.get_all(model_filters)
            
            # Apply pagination
            total = len(all_drivers)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_drivers = all_drivers[start_idx:end_idx]

            # Transform data for frontend compatibility
            transformed_drivers = []
            for driver in paginated_drivers:
                d_copy = driver.copy()
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
            
            # Validate required fields
            required_fields = ['driver_id', 'name', 'phone', 'license_number', 'license_expiry']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            driver = self.driver_model.create(data)
            
            # Log activity
            self.activity_model.create(
                'driver', f'Driver {data["name"]} added to system',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': driver})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_driver(self, driver_id):
        """Update driver"""
        try:
            data = request.get_json()
            driver = self.driver_model.update(driver_id, data)
            
            # Log activity
            self.activity_model.create(
                'driver', f'Driver {driver_id} information updated',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': driver})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_driver(self, driver_id):
        """Delete driver"""
        try:
            success = self.driver_model.delete(driver_id)
            
            if success:
                # Log activity
                self.activity_model.create(
                    'driver', f'Driver {driver_id} removed from system',
                    request.headers.get('User-ID')
                )
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
            
            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            all_routes = self.route_model.get_all(model_filters)
            
            # Apply pagination
            total = len(all_routes)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_routes = all_routes[start_idx:end_idx]

            # Transform data for frontend compatibility
            transformed_routes = []
            for route in paginated_routes:
                r_copy = route.copy()
                
                # Derive start_point and end_point from stops if they exist
                if 'stops' in r_copy and isinstance(r_copy['stops'], list) and len(r_copy['stops']) > 0:
                    stops = r_copy['stops']
                    # Handle both list of strings and list of dicts
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

                # Add distance if missing
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
            route = self.route_model.get_by_id(route_id)
            if route:
                return jsonify({'success': True, 'data': route})
            else:
                return jsonify({'success': False, 'error': 'Route not found'}), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def add_route(self):
        """Add new route"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['route_id', 'route_name', 'stops', 'pickup_time', 'drop_time']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            route = self.route_model.create(data)
            
            # Log activity
            self.activity_model.create(
                'route', f'Route {data["route_id"]} - {data["route_name"]} created',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': route})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_route(self, route_id):
        """Update route"""
        try:
            data = request.get_json()
            route = self.route_model.update(route_id, data)
            
            # Log activity
            self.activity_model.create(
                'route', f'Route {route_id} updated',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': route})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def delete_route(self, route_id):
        """Delete route"""
        try:
            success = self.route_model.delete(route_id)
            
            if success:
                # Log activity
                self.activity_model.create(
                    'route', f'Route {route_id} deleted',
                    request.headers.get('User-ID')
                )
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
            
            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            # Get all fees
            all_fees = self.fee_model.get_all(model_filters)
            
            # Apply pagination
            total = len(all_fees)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_fees = all_fees[start_idx:end_idx]

            # Get summary statistics
            summary = self.fee_model.get_payment_statistics()

            return jsonify({
                'success': True, 
                'data': paginated_fees, 
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
            
            # Validate required fields
            required_fields = ['student_id', 'student_name', 'amount', 'payment_date', 'payment_mode']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            # Update fee status
            fee_data = {
                'payment_status': 'Paid',
                'payment_date': data['payment_date'],
                'payment_mode': data['payment_mode']
            }
            
            # Find and update the fee record
            fees = self.fee_model.get_all({'student_id': data['student_id']})
            if fees:
                fee = self.fee_model.update(fees[0]['id'], fee_data)
                
                # Log activity
                self.activity_model.create(
                    'payment', f'Payment of {data["amount"]} received from {data["student_name"]}',
                    request.headers.get('User-ID'), data
                )
                
                return jsonify({'success': True, 'data': fee})
            else:
                # Create new fee record
                fee_data.update({
                    'student_id': data['student_id'],
                    'student_name': data['student_name'],
                    'amount': data['amount'],
                    'due_date': data.get('due_date', str(date.today() + timedelta(days=30)))
                })
                fee = self.fee_model.create(fee_data)
                
                # Log activity
                self.activity_model.create(
                    'payment', f'Payment of {data["amount"]} received from {data["student_name"]}',
                    request.headers.get('User-ID'), data
                )
                
                return jsonify({'success': True, 'data': fee})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def update_fee_status(self, fee_id):
        """Update fee status"""
        try:
            data = request.get_json()
            fee = self.fee_model.update(fee_id, data)
            
            # Log activity
            self.activity_model.create(
                'payment', f'Fee status updated for fee ID: {fee_id}',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class AttendanceController(TransportController):
    """Transport Attendance Controller"""
    
    def get_attendance(self):
        """Get attendance records with pagination"""
        try:
            filters = request.args.to_dict()

            # Extract pagination parameters
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            # Remove pagination from filters for the model
            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            attendance = self.attendance_model.get_all(model_filters)
            
            # Apply pagination
            total = len(attendance)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_attendance = attendance[start_idx:end_idx]

            return jsonify({
                'success': True, 
                'data': paginated_attendance, 
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
            
            # Validate required fields
            required_fields = ['date', 'entity_type', 'entity_id', 'entity_name', 'status']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'error': f'{field} is required'}), 400
            
            attendance = self.attendance_model.create(data)
            
            # Log activity
            self.activity_model.create(
                'attendance', f'Attendance marked for {data["entity_name"]} - {data["status"]}',
                request.headers.get('User-ID'), data
            )
            
            return jsonify({'success': True, 'data': attendance})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class LiveTrackingController(TransportController):
    """Live Tracking Controller"""
    
    def get_live_locations(self):
        """Get live bus locations"""
        try:
            locations = self.location_model.get_all()
            
            # Generate mock data if no real data exists
            if not locations:
                buses = self.bus_model.get_all()
                mock_locations = []
                for bus in buses[:15]:  # Limit to 15 buses
                    mock_location = {
                        'bus_id': bus['id'],
                        'bus_number': bus['bus_number'],
                        'route_id': bus.get('route_id'),
                        'latitude': 13.0827 + (hash(str(bus['id'])) % 100 - 50) * 0.001,
                        'longitude': 80.2707 + (hash(str(bus['id'])) % 100 - 50) * 0.001,
                        'speed': (hash(str(bus['id'])) % 30) + 20,
                        'status': 'Moving' if hash(str(bus['id'])) % 10 != 0 else 'Stopped',
                        'last_update': datetime.now().isoformat(),
                        'driver_name': bus.get('driver_name', f'Driver {bus["id"]}')
                    }
                    mock_locations.append(mock_location)
                locations = mock_locations
            
            return jsonify({'success': True, 'data': locations})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    def get_route_history(self, bus_id, date):
        """Get route history for a specific bus and date"""
        try:
            # Generate mock route history
            mock_history = []
            
            # Handle date parsing more robustly
            try:
                if isinstance(date, str):
                    base_time = datetime.strptime(date, '%Y-%m-%d')
                else:
                    base_time = date
            except (ValueError, TypeError) as e:
                print(f"Date parsing error: {e}, using today instead")
                base_time = datetime.now()
            
            for i in range(20):  # 20 data points throughout the day
                timestamp = base_time.replace(hour=7, minute=30 + i*2)
                mock_history.append({
                    'timestamp': timestamp.isoformat(),
                    'latitude': 13.0827 + i * 0.005,
                    'longitude': 80.2707 + i * 0.005,
                    'speed': (hash(str(bus_id) + str(i)) % 30) + 20,
                })
            
            return jsonify({'success': True, 'data': mock_history})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class ReportController(TransportController):
    """Reports Controller"""
    
    def generate_report(self, report_type):
        """Generate various reports"""
        try:
            if report_type == 'attendance':
                # Generate attendance report
                attendance_records = self.attendance_model.get_all()
                total_days = len(set(r['date'] for r in attendance_records))
                present_days = len([r for r in attendance_records if r['status'] == 'Present'])
                absent_days = len([r for r in attendance_records if r['status'] == 'Absent'])
                percentage = round((present_days / (present_days + absent_days)) * 100, 1) if (present_days + absent_days) > 0 else 0
                
                # Group by route
                route_stats = {}
                for record in attendance_records:
                    route_id = record.get('route_id', 'Unknown')
                    if route_id not in route_stats:
                        route_stats[route_id] = {'present': 0, 'absent': 0}
                    if record['status'] == 'Present':
                        route_stats[route_id]['present'] += 1
                    else:
                        route_stats[route_id]['absent'] += 1
                
                by_route = [{'route_id': k, 'present': v['present'], 'absent': v['absent']} 
                           for k, v in route_stats.items()]
                
                data = {
                    'title': 'Attendance Report',
                    'data': {
                        'totalDays': total_days,
                        'presentDays': present_days,
                        'absentDays': absent_days,
                        'percentage': percentage,
                        'byRoute': by_route
                    }
                }
                
            elif report_type == 'fees':
                # Generate fee collection report
                fee_records = self.fee_model.get_all()
                total_amount = sum(r['amount'] for r in fee_records)
                collected = sum(r['amount'] for r in fee_records if r['payment_status'] == 'Paid')
                pending = total_amount - collected
                collection_rate = round((collected / total_amount) * 100, 1) if total_amount > 0 else 0
                
                # Group by route
                route_stats = {}
                for record in fee_records:
                    route_id = record.get('route_id', 'Unknown')
                    if route_id not in route_stats:
                        route_stats[route_id] = {'total': 0, 'collected': 0, 'pending': 0}
                    route_stats[route_id]['total'] += record['amount']
                    if record['payment_status'] == 'Paid':
                        route_stats[route_id]['collected'] += record['amount']
                    else:
                        route_stats[route_id]['pending'] += record['amount']
                
                by_route = [{'route_id': k, 'total': v['total'], 'collected': v['collected'], 'pending': v['pending']} 
                           for k, v in route_stats.items()]
                
                data = {
                    'title': 'Fee Collection Report',
                    'data': {
                        'totalAmount': total_amount,
                        'collected': collected,
                        'pending': pending,
                        'collectionRate': collection_rate,
                        'byRoute': by_route
                    }
                }
                
            elif report_type == 'routes':
                # Generate route efficiency report
                routes = self.route_model.get_all()
                total_routes = len(routes)
                active_routes = len([r for r in routes if r['status'] == 'Active'])
                
                # Calculate average occupancy
                total_capacity = 0
                total_occupied = 0
                by_route = []
                
                for route in routes:
                    students = route.get('total_students', 0)
                    # Get capacity from assigned bus
                    buses = self.bus_model.get_all({'route_id': route['route_id']})
                    capacity = sum(b['capacity'] for b in buses) if buses else 50
                    occupancy = round((students / capacity) * 100, 1) if capacity > 0 else 0
                    
                    total_capacity += capacity
                    total_occupied += students
                    
                    by_route.append({
                        'route_id': route['route_id'],
                        'students': students,
                        'capacity': capacity,
                        'occupancy': occupancy,
                        'onTimePerformance': (hash(route['route_id']) % 20) + 80  # Mock performance
                    })
                
                avg_occupancy = round((total_occupied / total_capacity) * 100, 1) if total_capacity > 0 else 0
                
                data = {
                    'title': 'Route Efficiency Report',
                    'data': {
                        'totalRoutes': total_routes,
                        'activeRoutes': active_routes,
                        'avgOccupancy': avg_occupancy,
                        'byRoute': by_route
                    }
                }
                
            elif report_type == 'drivers':
                # Generate driver performance report
                drivers = self.driver_model.get_all()
                total_drivers = len(drivers)
                active_drivers = len([d for d in drivers if d['status'] == 'Active'])
                
                # Calculate average experience
                total_experience = sum(d.get('experience_years', 0) for d in drivers)
                avg_experience = round(total_experience / len(drivers), 1) if drivers else 0
                
                by_driver = []
                for driver in drivers:
                    trips = (hash(driver['driver_id']) % 50) + 40  # Mock trips
                    on_time = (hash(driver['driver_id']) % 20) + 80  # Mock on-time percentage
                    rating = round((hash(driver['driver_id']) % 10) / 10 + 4, 1)  # Mock rating 4.0-5.0
                    
                    by_driver.append({
                        'driver_id': driver['driver_id'],
                        'name': driver['name'],
                        'trips': trips,
                        'onTime': on_time,
                        'rating': rating
                    })
                
                data = {
                    'title': 'Driver Performance Report',
                    'data': {
                        'totalDrivers': total_drivers,
                        'activeDrivers': active_drivers,
                        'avgExperience': avg_experience,
                        'byDriver': by_driver
                    }
                }
                
            else:
                return jsonify({'success': False, 'error': 'Invalid report type'}), 400
            
            return jsonify({'success': True, 'data': data})
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
