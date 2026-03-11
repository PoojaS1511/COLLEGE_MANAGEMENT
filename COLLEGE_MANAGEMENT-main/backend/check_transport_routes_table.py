import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'student_management.db')
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check structure of transport_routes table
cursor.execute('PRAGMA table_info(transport_routes)')
tr_columns = cursor.fetchall()
print('Transport_routes table structure:')
for col in tr_columns:
    print(f'  - {col[1]} ({col[2]})')

# Check sample data
cursor.execute('SELECT * FROM transport_routes LIMIT 3')
sample_data = cursor.fetchall()
print('\nSample transport_routes data:')
for i, row in enumerate(sample_data, 1):
    print(f'  Record {i}: {row}')

conn.close()
