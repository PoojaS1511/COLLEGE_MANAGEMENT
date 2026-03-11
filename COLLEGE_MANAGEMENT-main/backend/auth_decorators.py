"""
Authentication decorators for PostgreSQL-based auth system.
"""
from functools import wraps
from flask import request, jsonify
from auth_service import auth_service
import logging

logger = logging.getLogger(__name__)

def token_required(f):
    """Decorator to require JWT token authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'message': 'Authentication token is missing',
                'error': 'token_missing'
            }), 401
        
        # Verify token
        user = auth_service.verify_token(token)
        if not user:
            return jsonify({
                'message': 'Invalid or expired authentication token',
                'error': 'token_invalid'
            }), 401
        
        # Add user to request context
        request.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function

def role_required(*allowed_roles):
    """Decorator to require specific user roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user from token_required decorator
            user = getattr(request, 'current_user', None)
            
            if not user:
                return jsonify({
                    'message': 'Authentication required',
                    'error': 'auth_required'
                }), 401
            
            # Check user role
            if user.get('role') not in allowed_roles:
                return jsonify({
                    'message': 'Insufficient permissions',
                    'error': 'insufficient_permissions',
                    'required_roles': allowed_roles,
                    'user_role': user.get('role')
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator to require admin role."""
    return role_required('admin')(f)

def student_required(f):
    """Decorator to require student role."""
    return role_required('student')(f)

def faculty_required(f):
    """Decorator to require faculty role."""
    return role_required('faculty')(f)

def optional_auth(f):
    """Decorator for optional authentication - adds user if token exists but doesn't require it."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        # Verify token if present
        if token:
            user = auth_service.verify_token(token)
            if user:
                request.current_user = user
            else:
                request.current_user = None
        else:
            request.current_user = None
        
        return f(*args, **kwargs)
    
    return decorated_function
