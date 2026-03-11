import os
import sys
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create a connection to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', '5432')
        )
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def setup_database():
    """Set up the database schema"""
    print("Setting up database...")
    
    # Create database if it doesn't exist
    try:
        # Connect to the default 'postgres' database to create our database
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database='postgres',
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', '5432')
        )
        conn.autocommit = True
        
        with conn.cursor() as cur:
            # Check if database exists
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", 
                       (os.getenv('DB_NAME'),))
            
            if not cur.fetchone():
                print(f"Creating database: {os.getenv('DB_NAME')}")
                cur.execute(
                    sql.SQL("CREATE DATABASE {}").format(
                        sql.Identifier(os.getenv('DB_NAME'))
                    )
                )
                print("Database created successfully")
            else:
                print("Database already exists")
        
        conn.close()
        
        # Now connect to our database and create tables
        conn = get_db_connection()
        
        # Enable UUID extension
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
            print("Enabled UUID extension")
        
        # Create subjects table if it doesn't exist
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS subjects (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(50) NOT NULL UNIQUE,
                    department_id UUID,
                    credits INTEGER DEFAULT 3,
                    description TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            print("Created subjects table")
        
        # Create exams table (this will be created by migrations, but adding here for completeness)
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS exams (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
                    academic_year VARCHAR(9) NOT NULL,
                    semester VARCHAR(20) NOT NULL,
                    date DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    duration INTEGER NOT NULL,
                    exam_type VARCHAR(50) NOT NULL,
                    max_marks INTEGER DEFAULT 100,
                    passing_marks INTEGER DEFAULT 35,
                    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
                    description TEXT,
                    created_by UUID,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            print("Created exams table")
        
        # Create indexes
        with conn.cursor() as cur:
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_exams_subject_id ON exams(subject_id);
                CREATE INDEX IF NOT EXISTS idx_exams_academic_year ON exams(academic_year);
                CREATE INDEX IF NOT EXISTS idx_exams_semester ON exams(semester);
                CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
            """)
            print("Created indexes")
        
        # Create update_updated_at function
        with conn.cursor() as cur:
            cur.execute("""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """)
            print("Created update_updated_at function")
        
        # Create triggers for updated_at
        for table in ['subjects', 'exams']:
            with conn.cursor() as cur:
                cur.execute(f"""
                    DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table};
                    CREATE TRIGGER update_{table}_updated_at
                    BEFORE UPDATE ON {table}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
                """)
                print(f"Created trigger for {table}.updated_at")
        
        print("Database setup completed successfully!")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    setup_database()
