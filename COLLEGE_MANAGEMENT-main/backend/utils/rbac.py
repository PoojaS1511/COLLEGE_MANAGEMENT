from functools import wraps
from flask import request, jsonify, g
from werkzeug.exceptions import Forbidden

# Define roles and their permissions
ROLES = {
    'admin': {
        'description': 'Administrator with full access',
        'permissions': {
            'manage_users': True,
            'manage_courses': True,
            'manage_subjects': True,
            'manage_faculty': True,
            'manage_students': True,
            'manage_exams': True,
            'manage_marks': True,
            'manage_attendance': True,
            'manage_fees': True,
            'manage_payments': True,
            'view_reports': True,
            'manage_notifications': True,
            'manage_settings': True
        }
    },
    'teacher': {
        'description': 'Teacher with teaching-related access',
        'permissions': {
            'manage_users': False,
            'manage_courses': False,
            'manage_subjects': False,
            'manage_faculty': False,
            'manage_students': False,
            'manage_exams': True,
            'manage_marks': True,
            'manage_attendance': True,
            'manage_fees': False,
            'manage_payments': False,
            'view_reports': True,
            'manage_notifications': False,
            'manage_settings': False
        }
    },
    'student': {
        'description': 'Student with limited access',
        'permissions': {
            'manage_users': False,
            'manage_courses': False,
            'manage_subjects': False,
            'manage_faculty': False,
            'manage_students': False,
            'manage_exams': False,
            'manage_marks': False,
            'manage_attendance': False,
            'manage_fees': False,
            'manage_payments': False,
            'view_reports': False,
            'manage_notifications': False,
            'manage_settings': False
        }
    },
    'parent': {
        'description': 'Parent with view access to their children\'s data',
        'permissions': {
            'manage_users': False,
            'manage_courses': False,
            'manage_subjects': False,
            'manage_faculty': False,
            'manage_students': False,
            'manage_exams': False,
            'manage_marks': False,
            'manage_attendance': False,
            'manage_fees': False,
            'manage_payments': False,
            'view_reports': True,
            'manage_notifications': False,
            'manage_settings': False
        }
    }
}

def has_permission(permission_name):
    """
    Decorator to check if the current user has the required permission.
    
    Args:
        permission_name (str): The name of the permission to check
        
    Returns:
        function: Decorated route handler
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get the current user from the request context
            current_user = getattr(g, 'user', None)
            
            if not current_user:
                return jsonify({'error': 'Authentication required'}), 401
                
            # Get the user's role
            user_role = current_user.get('role', 'student')
            
            # Check if the role exists
            if user_role not in ROLES:
                return jsonify({'error': 'Invalid user role'}), 403
                
            # Check if the permission exists for the role
            if not ROLES[user_role]['permissions'].get(permission_name, False):
                return jsonify({
                    'error': 'Insufficient permissions',
                    'required_permission': permission_name,
                    'user_role': user_role
                }), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def role_required(*roles):
    """
    Decorator to check if the current user has one of the required roles.
    
    Args:
        *roles (str): One or more role names that are allowed to access the route
        
    Returns:
        function: Decorated route handler
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get the current user from the request context
            current_user = getattr(g, 'user', None)
            
            if not current_user:
                return jsonify({'error': 'Authentication required'}), 401
                
            # Get the user's role
            user_role = current_user.get('role')
            
            # Check if the user has one of the required roles
            if user_role not in roles:
                return jsonify({
                    'error': 'Insufficient permissions',
                    'required_roles': roles,
                    'user_role': user_role
                }), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_user_permissions(role):
    """
    Get all permissions for a specific role.
    
    Args:
        role (str): The role to get permissions for
        
    Returns:
        dict: Dictionary of permissions for the role
    """
    if role not in ROLES:
        return {}
        
    return ROLES[role]['permissions']

def get_all_roles():
    """
    Get all available roles and their permissions.
    
    Returns:
        dict: Dictionary of all roles and their permissions
    """
    return {
        role: {
            'description': data['description'],
            'permissions': data['permissions']
        }
        for role, data in ROLES.items()
    }
