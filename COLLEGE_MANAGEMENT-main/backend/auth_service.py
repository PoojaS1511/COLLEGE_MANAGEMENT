"""
PostgreSQL Authentication Service to replace Supabase Auth.
"""
import jwt
import secrets
import hashlib
import json
from datetime import datetime, timedelta
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
import bcrypt
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """PostgreSQL-based authentication service."""
    
    def __init__(self, secret_key=None):
        self.secret_key = secret_key or secrets.token_urlsafe(32)
        self.token_expiry = timedelta(hours=24)
        self.refresh_token_expiry = timedelta(days=30)
    
    def hash_password(self, password):
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password, hashed_password):
        """Verify password against hash."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def hash_token(self, token):
        """Create a hash of a token for secure storage."""
        return hashlib.sha256(token.encode()).hexdigest()
    
    def create_user(self, email, password, role='student', metadata=None):
        """Create a new user."""
        try:
            # Check if user already exists
            existing_user = execute_query(
                "SELECT id FROM users WHERE email = %s", 
                [email], 
                fetch_all=False
            )
            
            if existing_user:
                raise Exception("User with this email already exists")
            
            # Hash password
            password_hash = self.hash_password(password)
            
            # Create user
            user_data = {
                'email': email,
                'password_hash': password_hash,
                'role': role,
                'metadata': json.dumps(metadata) if metadata else '{}'
            }
            
            user = execute_insert('users', user_data)
            
            logger.info(f"User created successfully: {email}")
            return user
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    def authenticate_user(self, email, password):
        """Authenticate user with email and password."""
        try:
            # Get user by email
            user = execute_query(
                "SELECT * FROM users WHERE email = %s AND is_active = true", 
                [email], 
                fetch_all=False
            )
            
            if not user:
                return None
            
            # Verify password
            if not self.verify_password(password, user['password_hash']):
                return None
            
            # Update last login
            execute_update('users', user['id'], {'last_login': datetime.utcnow()})
            
            return user
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None
    
    def generate_tokens(self, user_id):
        """Generate access and refresh tokens."""
        try:
            # Generate access token
            access_token_payload = {
                'user_id': str(user_id),
                'exp': datetime.utcnow() + self.token_expiry,
                'iat': datetime.utcnow(),
                'type': 'access'
            }
            access_token = jwt.encode(access_token_payload, self.secret_key, algorithm='HS256')
            
            # Generate refresh token
            refresh_token_payload = {
                'user_id': str(user_id),
                'exp': datetime.utcnow() + self.refresh_token_expiry,
                'iat': datetime.utcnow(),
                'type': 'refresh'
            }
            refresh_token = jwt.encode(refresh_token_payload, self.secret_key, algorithm='HS256')
            
            # Store session in database
            session_data = {
                'user_id': user_id,
                'token_hash': self.hash_token(access_token),
                'expires_at': datetime.utcnow() + self.token_expiry
            }
            execute_insert('sessions', session_data)
            
            # Store refresh token
            refresh_data = {
                'user_id': user_id,
                'token_hash': self.hash_token(refresh_token),
                'expires_at': datetime.utcnow() + self.refresh_token_expiry
            }
            execute_insert('refresh_tokens', refresh_data)
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'Bearer',
                'expires_in': int(self.token_expiry.total_seconds())
            }
            
        except Exception as e:
            logger.error(f"Token generation error: {e}")
            raise
    
    def verify_token(self, token):
        """Verify JWT token and return user info."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            
            # Check if token is blacklisted/expired in database
            token_hash = self.hash_token(token)
            session = execute_query(
                "SELECT * FROM sessions WHERE token_hash = %s AND expires_at > NOW()", 
                [token_hash], 
                fetch_all=False
            )
            
            if not session:
                return None
            
            # Get user info
            user = execute_query(
                "SELECT id, email, role, is_active FROM users WHERE id = %s", 
                [payload['user_id']], 
                fetch_all=False
            )
            
            if not user or not user['is_active']:
                return None
            
            return user
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None
    
    def refresh_access_token(self, refresh_token):
        """Generate new access token using refresh token."""
        try:
            # Verify refresh token
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=['HS256'])
            
            if payload.get('type') != 'refresh':
                raise Exception("Invalid refresh token")
            
            # Check if refresh token is valid in database
            token_hash = self.hash_token(refresh_token)
            refresh_record = execute_query(
                "SELECT * FROM refresh_tokens WHERE token_hash = %s AND expires_at > NOW() AND is_revoked = false", 
                [token_hash], 
                fetch_all=False
            )
            
            if not refresh_record:
                raise Exception("Invalid or expired refresh token")
            
            # Generate new access token
            access_token_payload = {
                'user_id': payload['user_id'],
                'exp': datetime.utcnow() + self.token_expiry,
                'iat': datetime.utcnow(),
                'type': 'access'
            }
            new_access_token = jwt.encode(access_token_payload, self.secret_key, algorithm='HS256')
            
            # Store new session
            session_data = {
                'user_id': payload['user_id'],
                'token_hash': self.hash_token(new_access_token),
                'expires_at': datetime.utcnow() + self.token_expiry
            }
            execute_insert('sessions', session_data)
            
            return {
                'access_token': new_access_token,
                'token_type': 'Bearer',
                'expires_in': int(self.token_expiry.total_seconds())
            }
            
        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            raise
    
    def logout(self, token):
        """Logout user by invalidating token."""
        try:
            token_hash = self.hash_token(token)
            
            # Remove session from database
            execute_delete('sessions', token_hash)
            
            logger.info("User logged out successfully")
            return True
            
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return False
    
    def revoke_refresh_token(self, refresh_token):
        """Revoke a refresh token."""
        try:
            token_hash = self.hash_token(refresh_token)
            
            # Mark refresh token as revoked
            execute_update('refresh_tokens', token_hash, {'is_revoked': True})
            
            logger.info("Refresh token revoked successfully")
            return True
            
        except Exception as e:
            logger.error(f"Token revocation error: {e}")
            return False
    
    def create_password_reset_token(self, email):
        """Create password reset token."""
        try:
            # Get user
            user = execute_query(
                "SELECT id FROM users WHERE email = %s AND is_active = true", 
                [email], 
                fetch_all=False
            )
            
            if not user:
                raise Exception("User not found")
            
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            token_hash = self.hash_token(reset_token)
            
            # Store reset token
            reset_data = {
                'user_id': user['id'],
                'token_hash': token_hash,
                'expires_at': datetime.utcnow() + timedelta(hours=1)
            }
            execute_insert('password_resets', reset_data)
            
            return reset_token
            
        except Exception as e:
            logger.error(f"Password reset token creation error: {e}")
            raise
    
    def reset_password(self, token, new_password):
        """Reset password using reset token."""
        try:
            token_hash = self.hash_token(token)
            
            # Get reset token record
            reset_record = execute_query(
                "SELECT * FROM password_resets WHERE token_hash = %s AND expires_at > NOW() AND is_used = false", 
                [token_hash], 
                fetch_all=False
            )
            
            if not reset_record:
                raise Exception("Invalid or expired reset token")
            
            # Update user password
            password_hash = self.hash_password(new_password)
            execute_update('users', reset_record['user_id'], {'password_hash': password_hash})
            
            # Mark reset token as used
            execute_update('password_resets', reset_record['id'], {'is_used': True, 'used_at': datetime.utcnow()})
            
            logger.info("Password reset successfully")
            return True
            
        except Exception as e:
            logger.error(f"Password reset error: {e}")
            raise

# Global auth service instance
auth_service = AuthService()
