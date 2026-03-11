from flask import Flask, jsonify

# Create a new Flask app
app = Flask(__name__)

# Add a simple test endpoint
@app.route('/api/student_dashboard/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        "success": True,
        "message": "Direct test endpoint works! (No auth required)",
        "note": "This is a direct test endpoint that bypasses all middleware"
    }), 200

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Direct Test Endpoint Server...")
    print("Health check: http://localhost:5009/health")
    print("Test endpoint: http://localhost:5009/api/student_dashboard/test")
    print("="*70 + "\n")
    app.run(debug=True, port=5009, use_reloader=False)
