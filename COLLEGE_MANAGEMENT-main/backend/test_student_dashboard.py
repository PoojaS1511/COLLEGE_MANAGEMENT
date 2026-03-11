from flask import Flask, jsonify
from routes.student_dashboard import student_dashboard_bp

app = Flask(__name__)

# Register the blueprint
app.register_blueprint(student_dashboard_bp, url_prefix='/api/student_dashboard')

# Add a simple test route
@app.route('/api/test')
def test():
    return jsonify({"message": "Test endpoint works!"}), 200

if __name__ == '__main__':
    print("Starting test server...")
    print("Test endpoint: http://localhost:5002/api/test")
    print("Student dashboard test: http://localhost:5002/api/student_dashboard/test")
    app.run(debug=True, port=5002)
