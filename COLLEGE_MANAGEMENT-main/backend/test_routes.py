from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Test endpoint works!"}), 200

if __name__ == '__main__':
    print("Starting test server...")
    print("Test endpoint: http://localhost:5002/api/test")
    app.run(debug=True, port=5002)
