from flask import Flask, jsonify, g
from flask_cors import CORS
from .config import Config
from supabase import create_client, Client
import os

# Initialize extensions
cors = CORS()

# Initialize Supabase client
supabase = None

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    cors.init_app(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
            "allow_headers": ["*"],  # Allow all headers
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "X-Total-Count", "Authorization", "Content-Length"],
            "max_age": 600  # Cache preflight for 10 minutes
        }
    })
    
    # Initialize Supabase client
    global supabase
    supabase = create_client(
        app.config['SUPABASE_URL'],
        app.config['SUPABASE_KEY']
    )
    app.supabase = supabase
    
    # Register blueprints with error handling
    try:
        # Register clubs blueprint
        from .clubs import clubs_bp
        app.register_blueprint(clubs_bp, url_prefix='/api/clubs')
    except ImportError as e:
        print(f"Warning: Could not import clubs blueprint: {e}")
    
    try:
        # Register course scraper blueprint
        from .routes.course_scraper import bp
        app.register_blueprint(bp, url_prefix='/api')
    except ImportError as e:
        print(f"Warning: Could not import course_scraper blueprint: {e}")
    
    try:
        # Register students blueprint
        from ..routes.students import students_bp
        app.register_blueprint(students_bp, url_prefix='/api/students')
        print("Students blueprint registered successfully")
    except ImportError as e:
        print(f"Error registering students blueprint: {e}")
    
    # Register a test route to verify the app is running
    @app.route('/api/health')
    def health_check():
        return jsonify({"status": "ok", "message": "Backend is running"})
    
    # Register other optional blueprints
    optional_blueprints = [
        ('career_roadmap', '/api/career-roadmap'),
        ('internships', '/api/internships'),
        ('resume_analytics', '/api/resume'),
        ('career_courses', '/api')
    ]
    
    for module_name, url_prefix in optional_blueprints:
        try:
            module = __import__(f'.routes.{module_name}', fromlist=['*'])
            bp = getattr(module, f'{module_name}_bp', None)
            if bp:
                app.register_blueprint(bp, url_prefix=url_prefix)
                print(f"Registered {module_name} blueprint at {url_prefix}")
        except ImportError as e:
            print(f"Warning: Could not import {module_name} blueprint: {e}")
        except Exception as e:
            print(f"Error registering {module_name} blueprint: {e}")
    
    return app