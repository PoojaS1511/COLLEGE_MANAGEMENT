from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Supabase configuration
SUPABASE_URL = "https://cdozcvfnamrqbaqsrhnp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkb3pjdmZuYW1ycWJhcXNyaG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDIwNDEsImV4cCI6MjA1ODcxODA0MX0.CprHN0BfyN5PlQp9yfQoiZkyjnO18Rm7MAD3ObzafJ8"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def home():
    return jsonify({"message": "Cube Arts and Engineering College API", "status": "running"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/test')
def test():
    return jsonify({"message": "API is working", "timestamp": datetime.now().isoformat()})

# Basic admission submission endpoint
@app.route('/api/admissions/submit', methods=['POST'])
def submit_application():
    try:
        data = request.get_json()
        
        # Generate application number
        year = datetime.now().year
        random_num = str(uuid.uuid4().int)[:4]
        application_number = f"ADM{year}{random_num}"
        
        # Prepare basic admission data
        admission_data = {
            'application_number': application_number,
            'full_name': data.get('full_name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender'),
            'blood_group': data.get('blood_group'),
            'father_name': data.get('father_name'),
            'father_phone': data.get('father_phone'),
            'mother_name': data.get('mother_name'),
            'mother_phone': data.get('mother_phone'),
            'permanent_address': data.get('permanent_address'),
            'city': data.get('city'),
            'state': data.get('state'),
            'pincode': data.get('pincode'),
            'tenth_marks': data.get('tenth_marks'),
            'twelfth_marks': data.get('twelfth_marks'),
            'course_id': data.get('course_id'),
            'quota_type': data.get('quota_type'),
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Insert into database
        response = supabase.table('admissions').insert(admission_data).execute()
        
        if response.data:
            return jsonify({
                'success': True,
                'application_number': application_number,
                'message': 'Application submitted successfully',
                'data': response.data[0]
            }), 201
        else:
            return jsonify({'error': 'Failed to submit application'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get courses endpoint
@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        response = supabase.table('courses').select("""
            id,
            name,
            code,
            fee_per_semester,
            departments (
                id,
                name,
                code
            )
        """).execute()
        
        return jsonify({
            'success': True,
            'data': response.data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Basic auth endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # For demo purposes, return success for any login
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'email': email,
                'role': 'student'
            }
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Cube Arts and Engineering College API...")
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("Test endpoint: http://localhost:5000/api/test")
    app.run(debug=True, host='0.0.0.0', port=5000)
