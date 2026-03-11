from flask import Flask, Blueprint, jsonify, request, g
from routes.student_dashboard import student_dashboard_bp

# Mock the auth_required decorator for testing
def mock_auth_required(f):
    def decorated_function(*args, **kwargs):
        # Set a mock user for testing
        g.user = {
            'id': 'test_user_id',
            'email': 'test@example.com',
            'role': 'student'
        }
        return f(*args, **kwargs)
    return decorated_function

# Create a new Flask app
app = Flask(__name__)

# Replace the auth_required decorator with our mock for testing
import routes.student_dashboard as student_dashboard_module
student_dashboard_module.auth_required = mock_auth_required

# Register the student dashboard blueprint with a test prefix
app.register_blueprint(student_dashboard_bp, url_prefix='/api/test_dashboard')

# Add a simple health check endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Student Dashboard Test Server...")
    print("Health check: http://localhost:5004/health")
    print("Test dashboard: http://localhost:5004/api/test_dashboard/test")
    print("="*70 + "\n")
    app.run(debug=True, port=5004, use_reloader=False)
