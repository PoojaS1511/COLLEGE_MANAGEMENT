import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
import glob

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create a connection to the PostgreSQL database"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT', '5432')
    )

def get_migration_files():
    """Get all migration files in order"""
    migration_dir = os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations')
    return sorted(glob.glob(os.path.join(migration_dir, '*.sql')))

def get_applied_migrations(conn):
    """Get the list of applied migrations"""
    with conn.cursor() as cur:
        # Create migrations table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """)
        conn.commit()
        
        # Get applied migrations
        cur.execute("SELECT filename FROM _migrations ORDER BY id")
        return [row[0] for row in cur.fetchall()]

def apply_migration(conn, filename):
    """Apply a single migration"""
    with open(filename, 'r') as f:
        sql_script = f.read()
    
    with conn.cursor() as cur:
        try:
            # Start transaction
            conn.autocommit = False
            
            # Execute migration
            cur.execute(sql_script)
            
            # Record migration
            cur.execute(
                "INSERT INTO _migrations (filename) VALUES (%s)",
                (os.path.basename(filename),)
            )
            
            # Commit transaction
            conn.commit()
            print(f"Applied migration: {filename}")
            return True
            
        except Exception as e:
            conn.rollback()
            print(f"Error applying migration {filename}: {str(e)}")
            return False

def main():
    """Main function to apply all pending migrations"""
    try:
        conn = get_db_connection()
        print("Connected to database")
        
        # Get migrations
        applied_migrations = get_applied_migrations(conn)
        migration_files = get_migration_files()
        
        # Apply pending migrations
        for filename in migration_files:
            migration_name = os.path.basename(filename)
            if migration_name not in applied_migrations:
                print(f"Applying migration: {migration_name}")
                if not apply_migration(conn, filename):
                    print("Migration failed")
                    return 1
        
        print("All migrations applied successfully")
        return 0
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    exit(main())
