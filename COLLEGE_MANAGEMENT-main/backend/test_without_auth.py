from flask import Flask, jsonify, request, g
from routes.student_dashboard import student_dashboard_bp

# Create a new Flask app
app = Flask(__name__)

# Custom before_request handler to exclude certain endpoints from authentication
@app.before_request
def before_request():
    # List of paths that don't require authentication
    public_paths = [
        '/health',
        '/api/student_dashboard/test'
    ]
    
    # Skip authentication for public paths
    if request.path in public_paths:
        # Set a mock user for testing (optional)
        g.user = {
            'id': 'public_user',
            'email': 'public@example.com',
            'role': 'public'
        }
        return None
    
    # For all other endpoints, require authentication
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({
            'success': False,
            'error': 'Authorization header is missing',
            'message': 'No token provided',
            'method': request.method,
            'path': request.path
        }), 401
    
    # Here you would typically validate the token
    # For testing, we'll just set a mock user
    g.user = {
        'id': 'test_user_id',
        'email': 'test@example.com',
        'role': 'student'
    }

# Register the student dashboard blueprint
app.register_blueprint(student_dashboard_bp, url_prefix='/api/student_dashboard')

# Add a simple health check endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Test Server Without Auth for Test Endpoint...")
    print("Health check: http://localhost:5008/health")
    print("Test dashboard (no auth): http://localhost:5008/api/student_dashboard/test")
    print("="*70 + "\n")
    app.run(debug=True, port=5008, use_reloader=False)
