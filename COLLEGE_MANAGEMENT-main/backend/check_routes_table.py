import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('All tables:')
for table in tables:
    print(f'  - {table[0]}')

# Check transport-related tables
transport_tables = [t[0] for t in tables if 'transport' in t[0].lower() or 'route' in t[0].lower()]
print(f'\nTransport-related tables: {transport_tables}')

# Check structure of routes table
if 'routes' in transport_tables:
    cursor.execute('PRAGMA table_info(routes)')
    routes_columns = cursor.fetchall()
    print('\nRoutes table structure:')
    for col in routes_columns:
        print(f'  - {col[1]} ({col[2]})')
    
    # Check sample data
    cursor.execute('SELECT * FROM routes LIMIT 3')
    sample_data = cursor.fetchall()
    print('\nSample routes data:')
    for i, row in enumerate(sample_data, 1):
        print(f'  Record {i}: {row}')

conn.close()
