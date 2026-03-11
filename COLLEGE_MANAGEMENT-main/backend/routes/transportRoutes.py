"""
Transport Routes for ST College Transport Management System
"""

from flask import Blueprint, request, jsonify
from controllers.transportController import (
    DashboardController, StudentController, FacultyController, 
    BusController, DriverController, RouteController, FeeController,
    AttendanceController, LiveTrackingController, ReportController
)

# Create blueprint
transport_bp = Blueprint('transport', __name__, url_prefix='/api/transport')

# Initialize controllers
dashboard_controller = DashboardController()
student_controller = StudentController()
faculty_controller = FacultyController()
bus_controller = BusController()
driver_controller = DriverController()
route_controller = RouteController()
fee_controller = FeeController()
attendance_controller = AttendanceController()
live_tracking_controller = LiveTrackingController()
report_controller = ReportController()

# ====================================
# DASHBOARD ROUTES
# ====================================

@transport_bp.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Get dashboard metrics"""
    return dashboard_controller.get_metrics()

# ====================================
# STUDENT MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/students', methods=['GET'])
def get_transport_students():
    """Get all transport students"""
    return student_controller.get_students()

@transport_bp.route('/students', methods=['POST'])
def add_transport_student():
    """Add new transport student"""
    return student_controller.add_student()

@transport_bp.route('/students/<student_id>', methods=['PUT'])
def update_transport_student(student_id):
    """Update transport student"""
    return student_controller.update_student(student_id)

@transport_bp.route('/students/<student_id>', methods=['DELETE'])
def delete_transport_student(student_id):
    """Delete transport student"""
    return student_controller.delete_student(student_id)

# ====================================
# FACULTY MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/faculty', methods=['GET'])
def get_transport_faculty():
    """Get all transport faculty"""
    return faculty_controller.get_faculty()

@transport_bp.route('/faculty', methods=['POST'])
def add_transport_faculty():
    """Add new transport faculty"""
    result = faculty_controller.add_faculty()
    return jsonify(result), 400 if not result.get('success') else 200

@transport_bp.route('/faculty/<faculty_id>', methods=['PUT'])
def update_transport_faculty(faculty_id):
    """Update transport faculty"""
    result = faculty_controller.update_faculty(faculty_id)
    return jsonify(result), 400 if not result.get('success') else 200

@transport_bp.route('/faculty/<faculty_id>', methods=['DELETE'])
def delete_transport_faculty(faculty_id):
    """Delete transport faculty"""
    result = faculty_controller.delete_faculty(faculty_id)
    return jsonify(result), 400 if not result.get('success') else 200

# ====================================
# BUS MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/buses', methods=['GET'])
def get_buses():
    """Get all buses"""
    return bus_controller.get_buses()

@transport_bp.route('/buses', methods=['POST'])
def add_bus():
    """Add new bus"""
    return bus_controller.add_bus()

@transport_bp.route('/buses/<bus_id>', methods=['PUT'])
def update_bus(bus_id):
    """Update bus"""
    return bus_controller.update_bus(bus_id)

@transport_bp.route('/buses/<bus_id>', methods=['DELETE'])
def delete_bus(bus_id):
    """Delete bus"""
    return bus_controller.delete_bus(bus_id)

# ====================================
# DRIVER MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/drivers', methods=['GET'])
def get_drivers():
    """Get all drivers"""
    return driver_controller.get_drivers()

@transport_bp.route('/drivers', methods=['POST'])
def add_driver():
    """Add new driver"""
    return driver_controller.add_driver()

@transport_bp.route('/drivers/<driver_id>', methods=['PUT'])
def update_driver(driver_id):
    """Update driver"""
    return driver_controller.update_driver(driver_id)

@transport_bp.route('/drivers/<driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    """Delete driver"""
    return driver_controller.delete_driver(driver_id)

# ====================================
# ROUTE MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/routes', methods=['GET'])
def get_routes():
    """Get all routes"""
    return route_controller.get_routes()

@transport_bp.route('/routes/<route_id>', methods=['GET'])
def get_route(route_id):
    """Get specific route"""
    return route_controller.get_route(route_id)

@transport_bp.route('/routes', methods=['POST'])
def add_route():
    """Add new route"""
    return route_controller.add_route()

@transport_bp.route('/routes/<route_id>', methods=['PUT'])
def update_route(route_id):
    """Update route"""
    return route_controller.update_route(route_id)

@transport_bp.route('/routes/<route_id>', methods=['DELETE'])
def delete_route(route_id):
    """Delete route"""
    return route_controller.delete_route(route_id)

# ====================================
# FEES MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/fees', methods=['GET'])
def get_transport_fees():
    """Get all transport fees"""
    return fee_controller.get_fees()

@transport_bp.route('/fees/payment', methods=['POST'])
def record_payment():
    """Record fee payment"""
    return fee_controller.record_payment()

@transport_bp.route('/fees/<fee_id>/status', methods=['PUT'])
def update_fee_status(fee_id):
    """Update fee status"""
    return fee_controller.update_fee_status(fee_id)

# ====================================
# ATTENDANCE MANAGEMENT ROUTES
# ====================================

@transport_bp.route('/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    return attendance_controller.get_attendance()

@transport_bp.route('/attendance', methods=['POST'])
def mark_attendance():
    """Mark attendance"""
    return attendance_controller.mark_attendance()

# ====================================
# LIVE TRACKING ROUTES
# ====================================

@transport_bp.route('/live-locations', methods=['GET'])
def get_live_locations():
    """Get live bus locations"""
    return live_tracking_controller.get_live_locations()

@transport_bp.route('/route-history/<bus_id>/<date>', methods=['GET'])
def get_route_history(bus_id, date):
    """Get route history for a specific bus and date"""
    return live_tracking_controller.get_route_history(bus_id, date)

# ====================================
# REPORTS ROUTES
# ====================================

@transport_bp.route('/reports/<report_type>', methods=['GET'])
def generate_report(report_type):
    """Generate various reports"""
    return report_controller.generate_report(report_type)

# ====================================
# UTILITY ROUTES
# ====================================

@transport_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'success': True, 'message': 'Transport API is running'}

@transport_bp.route('/info', methods=['GET'])
def get_info():
    """Get API information"""
    return {
        'success': True,
        'data': {
            'name': 'ST College Transport Management API',
            'version': '1.0.0',
            'description': 'Backend API for transport management system',
            'endpoints': {
                'dashboard': '/api/transport/dashboard/metrics',
                'students': '/api/transport/students',
                'faculty': '/api/transport/faculty',
                'buses': '/api/transport/buses',
                'drivers': '/api/transport/drivers',
                'routes': '/api/transport/routes',
                'fees': '/api/transport/fees',
                'attendance': '/api/transport/attendance',
                'live_tracking': '/api/transport/live-locations',
                'reports': '/api/transport/reports/<type>'
            }
        }
    }
