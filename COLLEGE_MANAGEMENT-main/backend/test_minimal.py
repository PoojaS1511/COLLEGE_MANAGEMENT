from flask import Flask, jsonify, request, g
from datetime import datetime

# Create a new Flask app
app = Flask(__name__)

# Simple test endpoint
@app.route('/api/student_dashboard/test', methods=['GET'])
def test_route():
    return jsonify({
        "success": True,
        "message": "Minimal test endpoint is working!",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Minimal Test Server...")
    print("Health check: http://localhost:5010/health")
    print("Test endpoint: http://localhost:5010/api/student_dashboard/test")
    print("="*70 + "\n")
    app.run(debug=True, port=5010, use_reloader=False)
