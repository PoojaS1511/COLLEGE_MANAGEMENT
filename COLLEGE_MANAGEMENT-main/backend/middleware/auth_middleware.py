import jwt
import requests
import json
from functools import wraps
from flask import request, g, jsonify, current_app
from jwt.algorithms import RSAAlgorithm

# ==============================
# SUPABASE CONFIGURATION
# ==============================
SUPABASE_URL = "https://qkaaoeismqnhjyikgkme.supabase.co"
SUPABASE_JWKS_URL = f"{SUPABASE_URL}/auth/v1/jwks"
SUPABASE_AUDIENCE = "authenticated"
SUPABASE_ISSUER = f"{SUPABASE_URL}/auth/v1"

# ==============================
# FETCH SUPABASE PUBLIC KEY
# ==============================
def get_supabase_public_key():
    try:
        response = requests.get(SUPABASE_JWKS_URL, timeout=5)
        response.raise_for_status()
        jwks = response.json()

        if "keys" not in jwks or not jwks["keys"]:
            current_app.logger.error("JWKS keys missing")
            return None

        return RSAAlgorithm.from_jwk(json.dumps(jwks["keys"][0]))

    except Exception as e:
        current_app.logger.error(f"JWKS fetch failed: {str(e)}")
        return None

# ==============================
# VERIFY SUPABASE JWT
# ==============================
def verify_supabase_token(token):
    if not token:
        return None, "No token provided"

    try:
        public_key = get_supabase_public_key()
        if not public_key:
            return None, "Public key fetch failed"

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=SUPABASE_AUDIENCE,
            issuer=SUPABASE_ISSUER,
            options={
                "verify_exp": True,
                "verify_signature": True
            }
        )

        # Required claims
        for field in ["sub", "email"]:
            if field not in payload:
                return None, f"Missing claim: {field}"

        user_metadata = payload.get("user_metadata", {})
        app_metadata = payload.get("app_metadata", {})

        user = {
            "id": payload["sub"],
            "email": payload["email"],
            "role": user_metadata.get("role", app_metadata.get("role", "student")),
            "email_verified": payload.get("email_confirmed_at") is not None,
            "user_metadata": user_metadata,
            "app_metadata": app_metadata
        }

        return user, None

    except jwt.ExpiredSignatureError:
        return None, "Token expired"
    except jwt.InvalidTokenError as e:
        return None, f"Invalid token: {str(e)}"
    except Exception as e:
        current_app.logger.error(str(e))
        return None, "Token verification failed"

# ==============================
# PUBLIC ROUTES (NO AUTH)
# ==============================
def should_bypass_auth():
    public_paths = [
        "/health",
        "/api/test",
        "/api/student_dashboard/test"
    ]
    return request.path in public_paths

# ==============================
# AUTH DECORATOR
# ==============================
def auth_required(roles=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):

            # Bypass auth for public routes
            if should_bypass_auth():
                g.user = {
                    "id": "public",
                    "email": "public@test.com",
                    "role": "guest"
                }
                return f(*args, **kwargs)

            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({
                    "success": False,
                    "error": "Authorization header missing"
                }), 401

            token = auth_header.split(" ")[1]
            user, error = verify_supabase_token(token)

            if error:
                return jsonify({
                    "success": False,
                    "error": error
                }), 401

            # Role validation
            if roles:
                allowed_roles = [roles] if isinstance(roles, str) else roles
                if user["role"].lower() not in [r.lower() for r in allowed_roles]:
                    return jsonify({
                        "success": False,
                        "error": "Access denied",
                        "required_roles": allowed_roles
                    }), 403

            # Email verification check
            if current_app.config.get("REQUIRE_VERIFIED_EMAIL", True):
                if not user.get("email_verified"):
                    return jsonify({
                        "success": False,
                        "error": "Email not verified"
                    }), 403

            g.user = user
            return f(*args, **kwargs)

        return decorated_function
    return decorator

# ==============================
# HELPER FUNCTIONS
# ==============================
def get_current_user():
    return getattr(g, "user", None)

def get_current_user_id():
    user = get_current_user()
    return user["id"] if user else None

def get_current_user_role():
    user = get_current_user()
    return user["role"] if user else "guest"

# ==============================
# OPTIONAL TRY-AUTH (NON-BLOCKING)
# ==============================
def try_authenticate():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Invalid auth header"}), 401

    token = auth_header.split(" ")[1]
    user, error = verify_supabase_token(token)

    if error:
        return jsonify({"error": error}), 401

    g.user = user
    return user
