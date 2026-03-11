from flask import Flask, Blueprint, jsonify

# Create a new Flask app
app = Flask(__name__)

# Create a new blueprint for testing
test_bp = Blueprint('test_bp', __name__)

# Add a test route to the blueprint
@test_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Test route works!"}), 200

# Register the blueprint with the app
app.register_blueprint(test_bp, url_prefix='/api/test_blueprint')

# Add a direct test route
@app.route('/api/test_direct', methods=['GET'])
def test_direct():
    return jsonify({"message": "Direct test route works!"}), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting fixed test server...")
    print("Blueprint test: http://localhost:5003/api/test_blueprint/test")
    print("Direct test: http://localhost:5003/api/test_direct")
    print("="*70 + "\n")
    app.run(debug=True, port=5003, use_reloader=False)
