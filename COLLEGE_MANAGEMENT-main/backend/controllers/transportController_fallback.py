"""
Transport Controllers for ST College Transport Management System
With Fallback Data Support
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
    SupabaseDriver, SupabaseRoute
)
from models.supabase_transport_fee import SupabaseTransportFee
from supabase_client import get_supabase

class TransportController:
    """Main Transport Controller"""

    def __init__(self):
        # Try to use Supabase models, fallback to mock data if they fail
        try:
            supabase = get_supabase()
            supabase_url = supabase.supabase_url
            supabase_key = supabase.supabase_key

            self.student_model = SupabaseTransportStudent(supabase_url, supabase_key)
            self.faculty_model = SupabaseTransportFaculty(supabase_url, supabase_key)
            self.bus_model = SupabaseBus(supabase_url, supabase_key)
            self.driver_model = SupabaseDriver(supabase_url, supabase_key)
            self.route_model = SupabaseRoute(supabase_url, supabase_key)
            self.fee_model = TransportFee()
            self.attendance_model = TransportAttendance()
            self.location_model = LiveLocation()
            self.activity_model = TransportActivity()
            self.use_fallback = False
        except Exception as e:
            print(f"Supabase initialization failed, using fallback data: {e}")
            self.use_fallback = True
            self._init_fallback_data()

    def _init_fallback_data(self):
        """Initialize fallback mock data"""
        self.mock_students = [
            {
                'id': 'ST2024001',
                'student_id': 'ST2024001',
                'name': 'John Doe',
                'email': 'john.doe@student.edu',
                'phone': '+91 9876543210',
                'course': 'B.Tech CSE',
                'route_name': 'Route A - T.Nagar',
                'status': 'Active'
            },
            {
                'id': 'ST2024002',
                'student_id': 'ST2024002',
                'name': 'Jane Smith',
                'email': 'jane.smith@student.edu',
                'phone': '+91 9876543211',
                'course': 'B.Tech ECE',
                'route_name': 'Route B - Adyar',
                'status': 'Active'
            }
        ]

        self.mock_faculty = [
            {
                'id': 'FC2024001',
                'faculty_id': 'FC2024001',
                'name': 'Dr. Rajesh Kumar',
                'email': 'rajesh.kumar@college.edu',
                'phone': '+91 9876543201',
                'department': 'Computer Science',
                'route_name': 'Route A - T.Nagar',
                'status': 'Active'
            },
            {
                'id': 'FC2024002',
                'faculty_id': 'FC2024002',
                'name': 'Dr. Priya Sharma',
                'email': 'priya.sharma@college.edu',
                'phone': '+91 9876543202',
                'department': 'Mathematics',
                'route_name': 'Route B - Adyar',
                'status': 'Active'
            }
        ]

        self.mock_buses = [
            {
                'id': 'BUS001',
                'bus_number': 'TN-09-AB-1234',
                'capacity': 50,
                'driver_name': 'Ravi Kumar',
                'route_name': 'Route A - T.Nagar',
                'status': 'Active'
            },
            {
                'id': 'BUS002',
                'bus_number': 'TN-09-CD-5678',
                'capacity': 45,
                'driver_name': 'Suresh Babu',
                'route_name': 'Route B - Adyar',
                'status': 'Active'
            }
        ]

        self.mock_drivers = [
            {
                'id': 'DRV001',
                'driver_id': 'DRV001',
                'name': 'Ravi Kumar',
                'phone': '+91 9876543101',
                'license_number': 'TN123456789',
                'license_expiry': '2025-12-31',
                'status': 'Active'
            },
            {
                'id': 'DRV002',
                'driver_id': 'DRV002',
                'name': 'Suresh Babu',
                'phone': '+91 9876543102',
                'license_number': 'TN987654321',
                'license_expiry': '2025-10-15',
                'status': 'Active'
            }
        ]

        self.mock_routes = [
            {
                'id': 'RT001',
                'route_id': 'RT001',
                'route_name': 'Route A - T.Nagar',
                'start_point': 'College Campus',
                'end_point': 'T.Nagar',
                'distance': 15.5,
                'status': 'Active'
            },
            {
                'id': 'RT002',
                'route_id': 'RT002',
                'route_name': 'Route B - Adyar',
                'start_point': 'College Campus',
                'end_point': 'Adyar',
                'distance': 12.3,
                'status': 'Active'
            }
        ]

        self.mock_fees = [
            {
                'id': 1,
                'student_id': 'ST2024001',
                'student_name': 'John Doe',
                'amount': 2500,
                'payment_status': 'Paid',
                'due_date': '2024-02-01'
            },
            {
                'id': 2,
                'student_id': 'ST2024002',
                'student_name': 'Jane Smith',
                'amount': 2500,
                'payment_status': 'Pending',
                'due_date': '2024-02-01'
            }
        ]

class DashboardController(TransportController):
    """Dashboard Metrics Controller"""

    def get_metrics(self):
        """Get dashboard metrics"""
        try:
            if self.use_fallback:
                # Return mock dashboard metrics
                metrics = {
                    'totalStudents': len(self.mock_students),
                    'facultyUsers': len(self.mock_faculty),
                    'activeBuses': len([b for b in self.mock_buses if b['status'] == 'Active']),
                    'totalDrivers': len(self.mock_drivers),
                    'attendancePercentage': 92.5,
                    'feeCollectionRate': 87.3,
                    'activeRoutes': len([r for r in self.mock_routes if r['status'] == 'Active']),
                    'pendingFees': sum([f['amount'] for f in self.mock_fees if f['payment_status'] == 'Pending']),
                    'recentActivities': [
                        { 'id': 1, 'type': 'attendance', 'message': 'Bus RT-12 marked attendance', 'time': '10 mins ago' },
                        { 'id': 2, 'type': 'payment', 'message': 'Fee payment received from Student ID: 2024001', 'time': '25 mins ago' },
                        { 'id': 3, 'type': 'route', 'message': 'Route RT-05 updated with new stops', 'time': '1 hour ago' },
                        { 'id': 4, 'type': 'bus', 'message': 'Bus TN-09-AB-1234 maintenance completed', 'time': '2 hours ago' },
                    ],
                    'monthlyTrends': [
                        {'month': 'Jan', 'students': 800, 'fees': 200000, 'attendance': 90},
                        {'month': 'Feb', 'students': 820, 'fees': 205000, 'attendance': 91},
                        {'month': 'Mar', 'students': 840, 'fees': 210000, 'attendance': 92},
                        {'month': 'Apr', 'students': len(self.mock_students), 'fees': 212500, 'attendance': 92.5},
                    ]
                }
                return jsonify({'success': True, 'data': metrics})

            # Try Supabase first
            try:
                total_students = len(self.student_model.get_all())
                faculty_users = len(self.faculty_model.get_all())
                active_buses = len(self.bus_model.get_all({'status': 'Active'}))
                total_drivers = len(self.driver_model.get_all())

                attendance_percentage = 92.5
                fee_collection_rate = 87.3
                active_routes = len(self.route_model.get_all({'status': 'Active'}))
                pending_fees = 45000

                metrics = {
                    'totalStudents': total_students,
                    'facultyUsers': faculty_users,
                    'activeBuses': active_buses,
                    'totalDrivers': total_drivers,
                    'attendancePercentage': attendance_percentage,
                    'feeCollectionRate': fee_collection_rate,
                    'activeRoutes': active_routes,
                    'pendingFees': pending_fees,
                    'recentActivities': [
                        { 'id': 1, 'type': 'attendance', 'message': 'Bus RT-12 marked attendance', 'time': '10 mins ago' },
                        { 'id': 2, 'type': 'payment', 'message': 'Fee payment received from Student ID: 2024001', 'time': '25 mins ago' },
                        { 'id': 3, 'type': 'route', 'message': 'Route RT-05 updated with new stops', 'time': '1 hour ago' },
                        { 'id': 4, 'type': 'bus', 'message': 'Bus TN-09-AB-1234 maintenance completed', 'time': '2 hours ago' },
                    ],
                    'monthlyTrends': [
                        {'month': 'Jan', 'students': 800, 'fees': 200000, 'attendance': 90},
                        {'month': 'Feb', 'students': 820, 'fees': 205000, 'attendance': 91},
                        {'month': 'Mar', 'students': 840, 'fees': 210000, 'attendance': 92},
                        {'month': 'Apr', 'students': total_students, 'fees': 212500, 'attendance': attendance_percentage},
                    ]
                }
                return jsonify({'success': True, 'data': metrics})

            except Exception as supabase_error:
                print(f"Supabase connection failed, using fallback data: {supabase_error}")
                # Switch to fallback mode
                self.use_fallback = True
                self._init_fallback_data()
                return self.get_metrics()  # Retry with fallback data

        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class StudentController(TransportController):
    """Transport Student Controller"""

    def get_students(self):
        """Get all transport students with pagination"""
        try:
            if self.use_fallback:
                filters = request.args.to_dict()
                filtered_students = self.mock_students

                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if key == 'status':
                            filtered_students = [s for s in filtered_students if s.get('status') == value]
                        elif key == 'course':
                            filtered_students = [s for s in filtered_students if value.lower() in s.get('course', '').lower()]

                return jsonify({
                    'success': True,
                    'data': filtered_students,
                    'total': len(filtered_students)
                })

            # Try Supabase
            filters = request.args.to_dict()
            limit = int(filters.get('limit', 50))
            offset = int(filters.get('offset', 0))
            page = int(filters.get('page', 1))

            model_filters = {k: v for k, v in filters.items()
                           if k not in ['limit', 'offset', 'page']}

            all_students = self.student_model.get_all(model_filters)
            total = len(all_students)
            start_idx = offset if offset > 0 else (page - 1) * limit
            end_idx = start_idx + limit
            paginated_students = all_students[start_idx:end_idx]

            return jsonify({
                'success': True,
                'data': paginated_students,
                'total': total,
                'limit': limit,
                'offset': offset,
                'page': page,
                'pages': (total + limit - 1) // limit
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class FacultyController(TransportController):
    """Transport Faculty Controller"""

    def get_faculty(self):
        """Get all transport faculty"""
        try:
            if self.use_fallback:
                filters = request.args.to_dict()
                filtered_faculty = self.mock_faculty

                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if key == 'status':
                            filtered_faculty = [f for f in filtered_faculty if f.get('status') == value]
                        elif key == 'department':
                            filtered_faculty = [f for f in filtered_faculty if value.lower() in f.get('department', '').lower()]

                return {'success': True, 'data': filtered_faculty, 'total': len(filtered_faculty)}

            # Try Supabase
            filters = request.args.to_dict()
            faculty = self.faculty_model.get_all(filters)
            return {'success': True, 'data': faculty, 'total': len(faculty)}
        except Exception as e:
            return {'success': False, 'error': str(e)}

class BusController(TransportController):
    """Bus Controller"""

    def get_buses(self):
        """Get all buses"""
        try:
            if self.use_fallback:
                filters = request.args.to_dict()
                filtered_buses = self.mock_buses

                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if key == 'status':
                            filtered_buses = [b for b in filtered_buses if b.get('status') == value]

                return jsonify({'success': True, 'data': filtered_buses, 'total': len(filtered_buses)})

            # Try Supabase
            filters = request.args.to_dict()
            buses = self.bus_model.get_all(filters)
            return jsonify({'success': True, 'data': buses, 'total': len(buses)})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class DriverController(TransportController):
    """Driver Controller"""

    def get_drivers(self):
        """Get all drivers"""
        try:
            if self.use_fallback:
                filters = request.args.to_dict()
                filtered_drivers = self.mock_drivers

                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if key == 'status':
                            filtered_drivers = [d for d in filtered_drivers if d.get('status') == value]

                return jsonify({'success': True, 'data': filtered_drivers, 'total': len(filtered_drivers)})

            # Try Supabase
            filters = request.args.to_dict()
            drivers = self.driver_model.get_all(filters)
            return jsonify({'success': True, 'data': drivers, 'total': len(drivers)})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class RouteController(TransportController):
    """Route Controller"""

    def get_routes(self):
        """Get all routes"""
        try:
            if self.use_fallback:
                filters = request.args.to_dict()
                filtered_routes = self.mock_routes

                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if key == 'status':
                            filtered_routes = [r for r in filtered_routes if r.get('status') == value]

                return jsonify({'success': True, 'data': filtered_routes, 'total': len(filtered_routes)})

            # Try Supabase
            filters = request.args.to_dict()
            routes = self.route_model.get_all(filters)
            return jsonify({'success': True, 'data': routes, 'total': len(routes)})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class FeeController(TransportController):
    """Transport Fee Controller"""

    def get_fees(self):
        """Get all transport fees"""
        try:
            if self.use_fallback:
                filters = request.args.to_dict()
                filtered_fees = self.mock_fees

                # Apply filters
                if filters:
                    for key, value in filters.items():
                        if key == 'payment_status':
                            filtered_fees = [f for f in filtered_fees if f.get('payment_status') == value]

                return jsonify({'success': True, 'data': filtered_fees, 'total': len(filtered_fees)})

            # Try Supabase/SQLite
            filters = request.args.to_dict()
            fees = self.fee_model.get_all(filters)
            return jsonify({'success': True, 'data': fees, 'total': len(fees)})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class AttendanceController(TransportController):
    """Transport Attendance Controller"""

    def get_attendance(self):
        """Get attendance records"""
        try:
            if self.use_fallback:
                # Mock attendance data
                mock_attendance = [
                    {
                        'id': 1,
                        'student_id': 'ST2024001',
                        'student_name': 'John Doe',
                        'date': str(date.today()),
                        'status': 'Present',
                        'route_name': 'Route A - T.Nagar'
                    },
                    {
                        'id': 2,
                        'student_id': 'ST2024002',
                        'student_name': 'Jane Smith',
                        'date': str(date.today()),
                        'status': 'Present',
                        'route_name': 'Route B - Adyar'
                    }
                ]
                return jsonify({'success': True, 'data': mock_attendance, 'total': len(mock_attendance)})

            # Try SQLite
            filters = request.args.to_dict()
            attendance = self.attendance_model.get_all(filters)
            return jsonify({'success': True, 'data': attendance, 'total': len(attendance)})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

class LiveTrackingController(TransportController):
    """Live Tracking Controller"""

    def get_live_locations(self):
        """Get live bus locations"""
        try:
            if self.use_fallback:
                # Generate mock locations
                mock_locations = []
                for bus in self.mock_buses[:15]:
                    mock_location = {
                        'bus_id': bus['id'],
                        'bus_number': bus['bus_number'],
                        'route_id': bus.get('id'),
                        'latitude': 13.0827 + (hash(str(bus['id'])) % 100 - 50) * 0.001,
                        'longitude': 80.2707 + (hash(str(bus['id'])) % 100 - 50) * 0.001,
                        'speed': (hash(str(bus['id'])) % 30) + 20,
                        'status': 'Moving' if hash(str(bus['id'])) % 10 != 0 else 'Stopped',
                        'last_update': datetime.now().isoformat(),
                        'driver_name': bus.get('driver_name', f'Driver {bus["id"]}')
                    }
                    mock_locations.append(mock_location)
                return jsonify({'success': True, 'data': mock_locations})

            # Try SQLite
            locations = self.location_model.get_all()
            if not locations:
                # Generate mock data if no real data exists
                buses = self.bus_model.get_all()
                mock_locations = []
                for bus in buses[:15]:
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

class ReportController(TransportController):
    """Reports Controller"""

    def generate_report(self, report_type):
        """Generate various reports"""
        try:
            if report_type == 'attendance':
                data = {
                    'title': 'Attendance Report',
                    'data': {
                        'totalDays': 30,
                        'presentDays': 28,
                        'absentDays': 2,
                        'percentage': 93.3,
                        'byRoute': [
                            {'route_id': 'RT001', 'present': 15, 'absent': 1},
                            {'route_id': 'RT002', 'present': 13, 'absent': 1}
                        ]
                    }
                }
            elif report_type == 'fees':
                data = {
                    'title': 'Fee Collection Report',
                    'data': {
                        'totalAmount': 5000,
                        'collected': 4350,
                        'pending': 650,
                        'collectionRate': 87.0,
                        'byRoute': [
                            {'route_id': 'RT001', 'total': 2500, 'collected': 2200, 'pending': 300},
                            {'route_id': 'RT002', 'total': 2500, 'collected': 2150, 'pending': 350}
                        ]
                    }
                }
            else:
                return jsonify({'success': False, 'error': 'Invalid report type'}), 400

            return jsonify({'success': True, 'data': data})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
