"""
PostgreSQL client initialization utility.
This module provides a consistent way to initialize and access PostgreSQL database.
"""
import psycopg2
from psycopg2 import pool, sql
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# PostgreSQL configuration
POSTGRES_HOST = "localhost"
POSTGRES_PORT = "5433"  # Fixed: Using correct port 5433
POSTGRES_DB = "college_management_system"
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "Pooja@15"

POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Connection pool
connection_pool = None

def init_postgres_pool():
    """Initialize PostgreSQL connection pool."""
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=20,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            database=POSTGRES_DB,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD
        )
        logger.info("PostgreSQL connection pool initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL pool: {e}")
        return False

def get_postgres_connection():
    """Get a connection from the pool."""
    global connection_pool
    if connection_pool is None:
        init_postgres_pool()
    try:
        return connection_pool.getconn()
    except Exception as e:
        logger.error(f"Failed to get PostgreSQL connection: {e}")
        raise

def release_postgres_connection(conn):
    """Release a connection back to the pool."""
    global connection_pool
    if connection_pool and conn:
        connection_pool.putconn(conn)

def execute_query(query, params=None, fetch_all=True):
    """Execute a PostgreSQL query."""
    conn = None
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query, params)
        
        if fetch_all:
            result = cursor.fetchall()
        else:
            result = cursor.fetchone()
        
        conn.commit()
        return result
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Query execution failed: {e}")
        raise
    finally:
        if conn:
            release_postgres_connection(conn)

def execute_ddl(query, params=None):
    """Execute DDL statements (CREATE, ALTER, DROP, etc.)."""
    conn = None
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return True
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"DDL execution failed: {e}")
        raise
    finally:
        if conn:
            release_postgres_connection(conn)

def execute_insert(table_name, data):
    """Insert data into a table and return the inserted record."""
    conn = None
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        columns = data.keys()
        placeholders = [sql.Placeholder() for _ in columns]
        query = sql.SQL("INSERT INTO {} ({}) VALUES ({}) RETURNING *").format(
            sql.Identifier(table_name),
            sql.SQL(', ').join(map(sql.Identifier, columns)),
            sql.SQL(', ').join(placeholders)
        )
        
        cursor.execute(query, list(data.values()))
        result = cursor.fetchone()
        conn.commit()
        return dict(result)
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Insert failed: {e}")
        raise
    finally:
        if conn:
            release_postgres_connection(conn)

def execute_update(table_name, record_id, data):
    """Update a record in a table and return the updated record."""
    conn = None
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        columns = data.keys()
        placeholders = [sql.Placeholder() for _ in columns]
        query = sql.SQL("UPDATE {} SET {} WHERE id = %s RETURNING *").format(
            sql.Identifier(table_name),
            sql.SQL(', ').join([
                sql.SQL("{} = {}").format(sql.Identifier(col), placeholder)
                for col, placeholder in zip(columns, placeholders)
            ]),
            sql.Placeholder()
        )
        
        cursor.execute(query, list(data.values()) + [record_id])
        result = cursor.fetchone()
        conn.commit()
        return dict(result) if result else None
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Update failed: {e}")
        raise
    finally:
        if conn:
            release_postgres_connection(conn)

def execute_delete(table_name, record_id):
    """Delete a record from a table."""
    conn = None
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()
        
        query = sql.SQL("DELETE FROM {} WHERE id = %s").format(
            sql.Identifier(table_name),
            sql.Placeholder()
        )
        
        cursor.execute(query, [record_id])
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Delete failed: {e}")
        raise
    finally:
        if conn:
            release_postgres_connection(conn)

def test_connection():
    """Test PostgreSQL connection."""
    try:
        result = execute_query("SELECT NOW()")
        logger.info("PostgreSQL connection test successful")
        return True
    except Exception as e:
        logger.error(f"PostgreSQL connection test failed: {e}")
        return False

# Initialize the pool on module import
init_postgres_pool()
