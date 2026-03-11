from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Initialize Supabase client with service role key
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")

# Global Supabase client instance
supabase: Client = None
supabase_available = False

# Try to create Supabase client
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        supabase_available = True
        print("[INFO] Supabase client initialized successfully")
    except Exception as e:
        print(f"[WARNING] Failed to initialize Supabase client: {e}")
        print("[INFO] Application will run in offline/mock mode")
        supabase = None
        supabase_available = False
else:
    print("[WARNING] Missing Supabase configuration in environment variables")
    print("[INFO] Application will run in offline/mock mode")

def get_supabase() -> Client:
    """Get the Supabase client instance."""
    if not supabase_available:
        raise RuntimeError("Supabase client is not available. Check your environment variables.")
    return supabase

def is_supabase_available() -> bool:
    """Check if Supabase is available."""
    return supabase_available
