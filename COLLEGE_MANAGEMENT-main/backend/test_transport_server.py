"""
Simple Transport Test Server
"""

from flask import Flask
from routes.transportRoutes import transport_bp
import os

app = Flask(__name__)

# Register transport blueprint
app.register_blueprint(transport_bp, url_prefix='/api')

@app.route('/')
def home():
    return "Transport Test Server is running!"

@app.route('/health')
def health():
    return {"status": "healthy", "transport": "registered"}

if __name__ == '__main__':
    print("Starting Transport Test Server...")
    print("Available endpoints:")
    
    with app.app_context():
        for rule in app.url_map.iter_rules():
            if 'transport' in rule.rule:
                print(f"  {list(rule.methods)} {rule.rule}")
    
    print("\nServer running on http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)
