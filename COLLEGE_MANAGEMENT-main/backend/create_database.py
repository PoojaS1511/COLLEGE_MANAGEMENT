"""
Create PostgreSQL database for the college management system
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    """Create the college_management_system database"""
    print("🗄️ Creating PostgreSQL Database...")
    
    try:
        # Connect to PostgreSQL default database
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5432'),
            database='postgres',  # Connect to default postgres database first
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', 'Pooja@15')
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Create the database
        cursor.execute("CREATE DATABASE college_management_system")
        print("✅ Database 'college_management_system' created successfully")
        
        cursor.close()
        conn.close()
        
        # Now test connection to the new database
        print("\n🔍 Testing connection to new database...")
        conn2 = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5432'),
            database=os.getenv('POSTGRES_DB', 'college_management_system'),
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', 'Pooja@15')
        )
        
        cursor2 = conn2.cursor()
        cursor2.execute("SELECT current_database()")
        db_name = cursor2.fetchone()[0]
        print(f"✅ Connected to database: {db_name}")
        
        cursor2.close()
        conn2.close()
        
        print("🎉 Database setup complete!")
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")

if __name__ == "__main__":
    create_database()
