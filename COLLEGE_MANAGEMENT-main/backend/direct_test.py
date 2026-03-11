from flask import Flask, jsonify, g

app = Flask(__name__)

# Mock the auth_required decorator
def auth_required(func):
    def wrapper(*args, **kwargs):
        g.user = {
            'id': 'test_user_id',
            'email': 'test@example.com',
            'role': 'student'
        }
        return func(*args, **kwargs)
    return wrapper

# Test route without authentication
@app.route('/api/test')
def test():
    return jsonify({"message": "Test endpoint works!"}), 200

# Test route with mock authentication
@app.route('/api/student_dashboard/test')
@auth_required
def test_dashboard():
    return jsonify({
        "success": True,
        "message": "Student dashboard test endpoint works!",
        "user_id": g.user.get('id')
    }), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Direct Test Server...")
    print("Test endpoint: http://localhost:5005/api/test")
    print("Student dashboard test: http://localhost:5005/api/student_dashboard/test")
    print("="*70 + "\n")
    app.run(debug=True, port=5005, use_reloader=False)
