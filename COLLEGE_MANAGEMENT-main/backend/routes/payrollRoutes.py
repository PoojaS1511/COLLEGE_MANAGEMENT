"""
Payroll Routes
Registers all payroll-related routes with the main application
"""
from controllers.payrollController import payroll_bp

def register_payroll_routes(app):
    """Register payroll routes with the Flask app"""
    app.register_blueprint(payroll_bp)
    print("[SUCCESS] Payroll routes registered successfully")
