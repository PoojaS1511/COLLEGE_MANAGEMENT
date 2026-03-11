from flask import Blueprint
from controllers.hrOnboardingController import hr_onboarding_bp

# Export the controller blueprint directly
hr_onboarding_bp = hr_onboarding_bp

# Create the main HR Onboarding routes blueprint
hr_onboarding_routes = Blueprint('hr_onboarding_routes', __name__)

# Register all HR Onboarding endpoints
def register_hr_onboarding_routes(app):
    """Register all HR Onboarding routes with the Flask app"""
    
    # Register the main HR Onboarding blueprint
    app.register_blueprint(hr_onboarding_bp)
    
    print("✅ HR Onboarding routes registered successfully")
    print("📋 Available endpoints:")
    print("   GET  /api/hr-onboarding/dashboard/stats")
    print("   POST /api/hr-onboarding/registration")
    print("   GET  /api/hr-onboarding/registration/<employee_id>")
    print("   POST /api/hr-onboarding/documents/upload")
    print("   POST /api/hr-onboarding/documents/<document_id>/verify")
    print("   GET  /api/hr-onboarding/documents/<employee_id>")
    print("   POST /api/hr-onboarding/role-assignment")
    print("   GET  /api/hr-onboarding/role-assignment/<employee_id>")
    print("   POST /api/hr-onboarding/work-policy")
    print("   GET  /api/hr-onboarding/work-policy/<employee_id>")
    print("   POST /api/hr-onboarding/salary-setup")
    print("   GET  /api/hr-onboarding/salary-setup/<employee_id>")
    print("   POST /api/hr-onboarding/system-access")
    print("   POST /api/hr-onboarding/system-access/activate")
    print("   GET  /api/hr-onboarding/system-access/<employee_id>")
    print("   GET  /api/hr-onboarding/record/<employee_id>")

# Export for use in main app
__all__ = ['hr_onboarding_bp', 'register_hr_onboarding_routes']
