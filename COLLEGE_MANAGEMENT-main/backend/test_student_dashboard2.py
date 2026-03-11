from flask import Flask, jsonify
from routes.student_dashboard import student_dashboard_bp

app = Flask(__name__)

# Register the blueprint
app.register_blueprint(student_dashboard_bp, url_prefix='/api/student_dashboard')

# Add a simple test route
@app.route('/api/test')
def test():
    return jsonify({"message": "Test endpoint works!"}), 200

# Add a test route to the blueprint
@student_dashboard_bp.route('/test2', methods=['GET'])
def test_route2():
    return jsonify({"message": "Test route 2 works!"}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting test server...")
    print("Test endpoint: http://localhost:5002/api/test")
    print("Student dashboard test: http://localhost:5002/api/student_dashboard/test2")
    print("="*70 + "\n")
    app.run(debug=True, port=5002, use_reloader=False)
