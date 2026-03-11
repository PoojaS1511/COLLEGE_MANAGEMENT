"""
Setup PostgreSQL authentication tables to replace Supabase Auth.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from postgres_client import execute_query, execute_insert, execute_ddl
import logging

logger = logging.getLogger(__name__)

def setup_auth_tables():
    """Create authentication tables in PostgreSQL."""
    
    try:
        # Create users table (replaces Supabase auth.users)
        users_table_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'student',
            is_active BOOLEAN DEFAULT true,
            email_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
            metadata JSONB
        );
        """
        
        # Create sessions table (replaces Supabase auth.sessions)
        sessions_table_sql = """
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_agent TEXT,
            ip_address VARCHAR(45)
        );
        """
        
        # Create refresh_tokens table
        refresh_tokens_sql = """
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_revoked BOOLEAN DEFAULT false
        );
        """
        
        # Create password_resets table
        password_resets_sql = """
        CREATE TABLE IF NOT EXISTS password_resets (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            used_at TIMESTAMP WITH TIME ZONE,
            is_used BOOLEAN DEFAULT false
        );
        """
        
        # Create indexes for better performance
        indexes_sql = [
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
            "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);",
            "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);",
            "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);",
            "CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);",
            "CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);"
        ]
        
        # Execute table creation
        tables = [users_table_sql, sessions_table_sql, refresh_tokens_sql, password_resets_sql]
        
        for table_sql in tables:
            try:
                execute_ddl(table_sql)
                logger.info("Table created successfully")
            except Exception as e:
                if "already exists" not in str(e):
                    logger.error(f"Error creating table: {e}")
        
        # Create indexes
        for index_sql in indexes_sql:
            try:
                execute_ddl(index_sql)
                logger.info("Index created successfully")
            except Exception as e:
                if "already exists" not in str(e):
                    logger.error(f"Error creating index: {e}")
        
        logger.info("✅ Authentication tables setup completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to setup authentication tables: {e}")
        return False

if __name__ == "__main__":
    setup_auth_tables()
