from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update
import os
from datetime import datetime
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint that accepts user_id and password
    Authenticates via PostgreSQL and returns role-based redirect path
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        password = data.get('password')

        # Also support email-based login for backward compatibility
        email = data.get('email')

        if not password:
            return jsonify({'error': 'Password is required'}), 400

        # If user_id is provided, convert to email format
        if user_id and not email:
            # Check if it's a student user_id (STU format)
            if user_id.startswith('STU'):
                email = f"{user_id}@college.edu"
            else:
                # For admin or other users, use as-is if it's an email
                if '@' in user_id:
                    email = user_id
                else:
                    return jsonify({'error': 'Invalid user_id format'}), 400

        if not email:
            return jsonify({'error': 'user_id or email is required'}), 400

        # Authenticate with PostgreSQL
        try:
            # Find user in PostgreSQL auth.users table
            user_query = "SELECT * FROM auth.users WHERE email = %s AND is_active = true"
            user = execute_query(user_query, [email], fetch_all=False)

            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401

            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({'error': 'Invalid credentials'}), 401

            # Update last login
            execute_update('auth.users', user['id'], {
                'last_login': datetime.utcnow().isoformat()
            })

            # Get role
            role = user.get('role', 'student')

            # Determine redirect path based on role
            redirect_path = '/'
            if role == 'admin':
                redirect_path = '/admin/dashboard'
            elif role == 'student':
                redirect_path = '/student/dashboard'
            elif role == 'teacher':
                redirect_path = '/faculty/dashboard'

            # Get additional user data based on role
            user_data = None
            if role == 'student':
                # Get student data from PostgreSQL
                student_query = "SELECT * FROM students WHERE user_id = %s"
                student = execute_query(student_query, [user['id']], fetch_all=False)
                if student:
                    user_data = student

            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'role': role,
                    'user_metadata': {'role': role}
                },
                'session': {
                    'access_token': 'mock_token',  # PostgreSQL doesn't use JWT tokens
                    'refresh_token': 'mock_refresh'
                },
                'redirect_path': redirect_path,
                'user_data': user_data,
                'message': 'Login successful'
            }), 200

        except Exception as auth_error:
            error_message = str(auth_error)
            if 'Invalid login credentials' in error_message:
                return jsonify({'error': 'Invalid user_id or password'}), 401
            else:
                return jsonify({'error': f'Authentication failed: {error_message}'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        role = data.get('role', 'student')
        phone = data.get('phone')
        
        if not email or not password or not full_name:
            return jsonify({'error': 'Email, password, and full name are required'}), 400
        
        # Create user in PostgreSQL Auth
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user in auth.users table
        user_data = {
            'email': email,
            'password_hash': password_hash,
            'role': role,
            'is_active': True,
            'email_verified': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        user = execute_insert('auth.users', user_data)
        
        if user:
            # Create profile
            profile_data = {
                'user_id': user['id'],
                'email': email,
                'full_name': full_name,
                'role': role,
                'phone': phone,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            profile_response = execute_insert('auth.profiles', profile_data)
            
            return jsonify({
                'user': user,
                'profile': profile_response,
                'message': 'User registered successfully'
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        # PostgreSQL doesn't need explicit logout - just return success
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    try:
        # Get the authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header required'}), 401
        
        # Extract the token (mock implementation for PostgreSQL)
        token = auth_header.replace('Bearer ', '')
        
        # For PostgreSQL, we'll use a simple token validation
        # In production, you'd implement proper JWT validation
        if token == 'mock_token':
            # Get profile data from PostgreSQL
            profile_query = "SELECT * FROM auth.profiles LIMIT 1"
            profile = execute_query(profile_query, fetch_all=False)
            
            return jsonify({
                'user': profile,
                'profile': profile
            }), 200
        else:
            return jsonify({'error': 'Invalid token'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    try:
        # Get the authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header required'}), 401
        
        # Extract the token
        token = auth_header.replace('Bearer ', '')
        
        # Get user from token
        user = supabase.auth.get_user(token)
        
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        data['updated_at'] = datetime.now().isoformat()
        
        # Update profile
        response = supabase.table('profiles').update(data).eq('id', user.user.id).execute()
        
        return jsonify({
            'profile': response.data[0] if response.data else None,
            'message': 'Profile updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        response = supabase.auth.reset_password_email(email)
        
        return jsonify({'message': 'Password reset email sent'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
