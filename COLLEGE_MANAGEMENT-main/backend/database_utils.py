"""
Database utilities to replace Supabase functionality with PostgreSQL.
This provides a similar interface to Supabase for easy migration.
"""
import json
from datetime import datetime
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from psycopg2 import sql
import logging

logger = logging.getLogger(__name__)

class PostgresClient:
    """PostgreSQL client that mimics Supabase interface."""
    
    def __init__(self):
        self.table_name = None
    
    def from_(self, table_name):
        """Start a query from a table."""
        self.table_name = table_name
        return self
    
    def select(self, columns="*", count=None, head=None):
        """Select columns from table."""
        self._select_columns = columns
        self._count = count
        self._head = head
        return self
    
    def eq(self, column, value):
        """Add equality condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, '=', value))
        return self
    
    def neq(self, column, value):
        """Add not equal condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, '!=', value))
        return self
    
    def gt(self, column, value):
        """Add greater than condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, '>', value))
        return self
    
    def gte(self, column, value):
        """Add greater than or equal condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, '>=', value))
        return self
    
    def lt(self, column, value):
        """Add less than condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, '<', value))
        return self
    
    def lte(self, column, value):
        """Add less than or equal condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, '<=', value))
        return self
    
    def like(self, column, pattern):
        """Add LIKE condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, 'LIKE', pattern))
        return self
    
    def ilike(self, column, pattern):
        """Add ILIKE condition (case-insensitive)."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, 'ILIKE', pattern))
        return self
    
    def or_(self, condition_string):
        """Add OR condition."""
        if not hasattr(self, '_or_conditions'):
            self._or_conditions = []
        self._or_conditions.append(condition_string)
        return self
    
    def not_(self, column, operator, value):
        """Add NOT condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, f'NOT {operator}', value))
        return self
    
    def in_(self, column, values):
        """Add IN condition."""
        if not hasattr(self, '_conditions'):
            self._conditions = []
        self._conditions.append((column, 'IN', values))
        return self
    
    def order(self, column, ascending=True):
        """Add ORDER BY clause."""
        self._order_column = column
        self._order_direction = 'ASC' if ascending else 'DESC'
        return self
    
    def limit(self, limit_count):
        """Add LIMIT clause."""
        self._limit = limit_count
        return self
    
    def offset(self, offset_count):
        """Add OFFSET clause."""
        self._offset = offset_count
        return self
    
    def range(self, start, end):
        """Add range (LIMIT and OFFSET)."""
        self._limit = end - start + 1
        self._offset = start
        return self
    
    def build_query(self):
        """Build the SQL query."""
        query_parts = []
        params = []
        
        # SELECT clause
        if self._count and self._head:
            query_parts.append(f"SELECT COUNT(*) as count FROM {self.table_name}")
        elif self._count:
            query_parts.append(f"SELECT {self._select_columns}, COUNT(*) OVER() as total_count FROM {self.table_name}")
        else:
            query_parts.append(f"SELECT {self._select_columns} FROM {self.table_name}")
        
        # WHERE conditions
        conditions = []
        if hasattr(self, '_conditions'):
            for column, operator, value in self._conditions:
                if operator == 'IN':
                    placeholders = ', '.join(['%s'] * len(value))
                    conditions.append(f"{column} {operator} ({placeholders})")
                    params.extend(value)
                else:
                    conditions.append(f"{column} {operator} %s")
                    params.append(value)
        
        if hasattr(self, '_or_conditions'):
            for condition in self._or_conditions:
                conditions.append(condition)
        
        if conditions:
            query_parts.append("WHERE " + " AND ".join(conditions))
        
        # ORDER BY
        if hasattr(self, '_order_column'):
            query_parts.append(f"ORDER BY {self._order_column} {self._order_direction}")
        
        # LIMIT and OFFSET
        if hasattr(self, '_limit'):
            query_parts.append(f"LIMIT %s")
            params.append(self._limit)
        
        if hasattr(self, '_offset'):
            query_parts.append(f"OFFSET %s")
            params.append(self._offset)
        
        return ' '.join(query_parts), params
    
    def execute(self):
        """Execute the query and return results."""
        if not self.table_name:
            raise ValueError("Table name not specified")
        
        query, params = self.build_query()
        
        try:
            if self._count and self._head:
                result = execute_query(query, params, fetch_all=False)
                return {'data': None, 'error': None, 'count': result['count'] if result else 0}
            else:
                results = execute_query(query, params, fetch_all=True)
                
                # Handle count
                count = None
                if self._count and results:
                    count = results[0].get('total_count', len(results))
                    # Remove total_count from results
                    results = [{k: v for k, v in result.items() if k != 'total_count'} for result in results]
                
                return {'data': results, 'error': None, 'count': count}
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            return {'data': None, 'error': str(e)}
    
    def then(self, callback):
        """Mimic Supabase's then method for promise-like interface."""
        result = self.execute()
        if callable(callback):
            return callback(result)
        return result
    
    def single(self):
        """Execute query and return single result."""
        if not self.table_name:
            raise ValueError("Table name not specified")
        
        query, params = self.build_query()
        query += " LIMIT 1"
        
        try:
            result = execute_query(query, params, fetch_all=False)
            return {'data': result, 'error': None}
        except Exception as e:
            logger.error(f"Single query execution failed: {e}")
            return {'data': None, 'error': str(e)}
    
    def insert(self, data):
        """Insert data into table."""
        if not self.table_name:
            raise ValueError("Table name not specified")
        
        try:
            if isinstance(data, list):
                results = []
                for item in data:
                    result = execute_insert(self.table_name, item)
                    results.append(result)
                return {'data': results, 'error': None}
            else:
                result = execute_insert(self.table_name, data)
                return {'data': result, 'error': None}
        except Exception as e:
            logger.error(f"Insert failed: {e}")
            return {'data': None, 'error': str(e)}
    
    def update(self, data):
        """Update records in table."""
        if not self.table_name:
            raise ValueError("Table name not specified")
        
        # For update, we need to execute conditions first to get IDs, then update
        try:
            if hasattr(self, '_conditions'):
                # Build SELECT query to get IDs
                select_query, params = self.build_query()
                select_query = f"SELECT id FROM {self.table_name} WHERE " + " AND ".join([
                    f"{column} {operator} %s" for column, operator, _ in self._conditions
                ])
                
                results = execute_query(select_query, params, fetch_all=True)
                
                # Update each record
                updated_results = []
                for record in results:
                    updated = execute_update(self.table_name, record['id'], data)
                    if updated:
                        updated_results.append(updated)
                
                return {'data': updated_results, 'error': None}
            else:
                return {'data': None, 'error': 'No conditions specified for update'}
        except Exception as e:
            logger.error(f"Update failed: {e}")
            return {'data': None, 'error': str(e)}
    
    def delete(self):
        """Delete records from table."""
        if not self.table_name:
            raise ValueError("Table name not specified")
        
        try:
            if hasattr(self, '_conditions'):
                # Build SELECT query to get IDs
                select_query, params = self.build_query()
                select_query = f"SELECT id FROM {self.table_name} WHERE " + " AND ".join([
                    f"{column} {operator} %s" for column, operator, _ in self._conditions
                ])
                
                results = execute_query(select_query, params, fetch_all=True)
                
                # Delete each record
                deleted_count = 0
                for record in results:
                    if execute_delete(self.table_name, record['id']):
                        deleted_count += 1
                
                return {'data': None, 'error': None}
            else:
                return {'data': None, 'error': 'No conditions specified for delete'}
        except Exception as e:
            logger.error(f"Delete failed: {e}")
            return {'data': None, 'error': str(e)}

# Create global instances
postgres_client = PostgresClient()

def get_postgres_client():
    """Get PostgreSQL client instance."""
    return postgres_client
