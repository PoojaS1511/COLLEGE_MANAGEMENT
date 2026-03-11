"""
Authentication API routes for PostgreSQL-based auth system.
"""
from flask import Blueprint, request, jsonify
from auth_service import auth_service
from auth_decorators import token_required, admin_required
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Create blueprint
auth_bp = Blueprint('postgres_auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'message': f'Missing required field: {field}',
                    'error': 'missing_field'
                }), 400
        
        email = data['email']
        password = data['password']
        role = data['role']
        metadata = data.get('metadata', {})
        
        # Validate role
        valid_roles = ['student', 'faculty', 'admin']
        if role not in valid_roles:
            return jsonify({
                'message': f'Invalid role. Must be one of: {valid_roles}',
                'error': 'invalid_role'
            }), 400
        
        # Create user
        user = auth_service.create_user(email, password, role, metadata)
        
        # Generate tokens for immediate login
        tokens = auth_service.generate_tokens(user['id'])
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'is_active': user['is_active'],
                'created_at': user['created_at']
            },
            'tokens': tokens
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({
            'message': 'Registration failed',
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return tokens."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'message': 'Email and password are required',
                'error': 'missing_credentials'
            }), 400
        
        email = data['email']
        password = data['password']
        
        # Authenticate user
        user = auth_service.authenticate_user(email, password)
        
        if not user:
            return jsonify({
                'message': 'Invalid email or password',
                'error': 'invalid_credentials'
            }), 401
        
        # Generate tokens
        tokens = auth_service.generate_tokens(user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'is_active': user['is_active'],
                'last_login': user['last_login']
            },
            'tokens': tokens
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            'message': 'Login failed',
            'error': str(e)
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token."""
    try:
        data = request.get_json()
        
        if not data.get('refresh_token'):
            return jsonify({
                'message': 'Refresh token is required',
                'error': 'missing_refresh_token'
            }), 400
        
        refresh_token = data['refresh_token']
        
        # Generate new access token
        tokens = auth_service.refresh_access_token(refresh_token)
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'tokens': tokens
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({
            'message': 'Token refresh failed',
            'error': str(e)
        }), 401

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout user and invalidate token."""
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        
        # Logout user
        auth_service.logout(token)
        
        return jsonify({
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({
            'message': 'Logout failed',
            'error': str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user info."""
    try:
        user = request.current_user
        
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'is_active': user['is_active'],
                'email_verified': user['email_verified'],
                'created_at': user['created_at'],
                'updated_at': user['updated_at'],
                'last_login': user['last_login'],
                'metadata': user.get('metadata', {})
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({
            'message': 'Failed to get user info',
            'error': str(e)
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'message': 'Current password and new password are required',
                'error': 'missing_fields'
            }), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        user = request.current_user
        
        # Verify current password
        if not auth_service.verify_password(current_password, user['password_hash']):
            return jsonify({
                'message': 'Current password is incorrect',
                'error': 'invalid_current_password'
            }), 400
        
        # Update password
        new_password_hash = auth_service.hash_password(new_password)
        from postgres_client import execute_update
        execute_update('users', user['id'], {'password_hash': new_password_hash})
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Change password error: {e}")
        return jsonify({
            'message': 'Failed to change password',
            'error': str(e)
        }), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Initiate password reset process."""
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({
                'message': 'Email is required',
                'error': 'missing_email'
            }), 400
        
        email = data['email']
        
        # Generate password reset token
        reset_token = auth_service.create_password_reset_token(email)
        
        # TODO: Send email with reset token (implement email service)
        logger.info(f"Password reset token generated for {email}: {reset_token}")
        
        return jsonify({
            'message': 'Password reset instructions sent to your email',
            # For development only, return the token
            'reset_token': reset_token
        }), 200
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        # Don't reveal if user exists or not
        return jsonify({
            'message': 'If an account with that email exists, a password reset link has been sent'
        }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using reset token."""
    try:
        data = request.get_json()
        
        if not data.get('token') or not data.get('new_password'):
            return jsonify({
                'message': 'Reset token and new password are required',
                'error': 'missing_fields'
            }), 400
        
        reset_token = data['token']
        new_password = data['new_password']
        
        # Reset password
        auth_service.reset_password(reset_token, new_password)
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({
            'message': 'Failed to reset password',
            'error': str(e)
        }), 400

@auth_bp.route('/revoke-refresh-token', methods=['POST'])
@token_required
def revoke_refresh_token():
    """Revoke a refresh token."""
    try:
        data = request.get_json()
        
        if not data.get('refresh_token'):
            return jsonify({
                'message': 'Refresh token is required',
                'error': 'missing_refresh_token'
            }), 400
        
        refresh_token = data['refresh_token']
        
        # Revoke refresh token
        auth_service.revoke_refresh_token(refresh_token)
        
        return jsonify({
            'message': 'Refresh token revoked successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Revoke refresh token error: {e}")
        return jsonify({
            'message': 'Failed to revoke refresh token',
            'error': str(e)
        }), 500

# Health check for auth service
@auth_bp.route('/health', methods=['GET'])
def auth_health():
    """Check authentication service health."""
    try:
        # Test database connection
        from postgres_client import execute_query
        execute_query("SELECT COUNT(*) FROM users", fetch_all=False)
        
        return jsonify({
            'status': 'healthy',
            'service': 'PostgreSQL Authentication Service',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Auth health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
