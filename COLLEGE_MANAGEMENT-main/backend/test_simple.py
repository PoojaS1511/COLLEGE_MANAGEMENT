from flask import Flask, jsonify
from routes.student_dashboard import student_dashboard_bp

# Create a new Flask app
app = Flask(__name__)

# Register the student dashboard blueprint with a test prefix
app.register_blueprint(student_dashboard_bp, url_prefix='/api/student_dashboard')

# Add a simple test route
@app.route('/api/test')
def test():
    return jsonify({"message": "Test endpoint works!"}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Simple Test Server...")
    print("Test endpoint: http://localhost:5007/api/test")
    print("Student dashboard test: http://localhost:5007/api/student_dashboard/test")
    print("="*70 + "\n")
    app.run(debug=True, port=5007, use_reloader=False)
