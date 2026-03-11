"""
Supabase Employee Master Model
Handles employee operations with Supabase database
"""

import os
import json
import uuid
import re
from datetime import datetime, date
from typing import List, Dict, Optional, Any
from supabase import create_client

class SupabaseEmployeeMaster:
    """Employee Master Model for Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        # Initialize Supabase client with the provided credentials
        # Note: pass only URL and key to avoid incompatible options dict
        self.supabase = create_client(supabase_url, supabase_key)
        self.table_name = 'employee_master'
    
    def generate_employee_id(self, department: str, joining_date: date) -> str:
        """Generate unique employee ID"""
        year = joining_date.year
        dept_code = department[:3].upper()
        
        # Get count of employees in same department for the year
        try:
            result = self.supabase.table(self.table_name).select('employee_id', count='exact')\
                .like('employee_id', f'EMP{year}{dept_code}%')\
                .execute()
            
            count = result.count if hasattr(result, 'count') else 0
            sequence = str(count + 1).zfill(3)
            
            return f"EMP{year}{dept_code}{sequence}"
        except:
            # Fallback if query fails
            return f"EMP{year}{dept_code}001"
    
    def validate_email(self, email: str) -> bool:
        """Validate email format and uniqueness"""
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return False
        
        try:
            result = self.supabase.table(self.table_name).select('email')\
                .eq('email', email)\
                .execute()
            
            return len(result.data) == 0
        except:
            return False
    
    def create(self, employee_data: Dict) -> Optional[Dict]:
        """Create new employee"""
        try:
            # Generate employee ID if not provided
            if 'employee_id' not in employee_data:
                employee_data['employee_id'] = self.generate_employee_id(
                    employee_data['department'],
                    employee_data['joining_date']
                )
            
            # Validate email uniqueness
            if not self.validate_email(employee_data['email']):
                raise ValueError("Email already exists or is invalid")
            
            # Set defaults
            employee_data.setdefault('status', 'Active')
            employee_data.setdefault('created_at', datetime.now().isoformat())
            
            result = self.supabase.table(self.table_name).insert(employee_data).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error creating employee: {str(e)}")
            return None
    
    def get_all(self, filters: Dict = None, page: int = 1, limit: int = 50) -> Dict:
        """Get all employees with pagination and filters"""
        try:
            query = self.supabase.table(self.table_name).select('*')
            
            # Apply filters
            if filters:
                if filters.get('department'):
                    query = query.eq('department', filters['department'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('role'):
                    query = query.eq('role', filters['role'])
                if filters.get('employee_type'):
                    query = query.eq('employee_type', filters['employee_type'])
            
            # Get total count
            count_result = query.count('exact').execute()
            total = count_result.count if hasattr(count_result, 'count') else 0
            
            # Apply pagination
            offset = (page - 1) * limit
            result = query.range(offset, offset + limit - 1).execute()
            
            return {
                'data': result.data or [],
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': (total + limit - 1) // limit
            }
            
        except Exception as e:
            print(f"Error fetching employees: {str(e)}")
            return {'data': [], 'total': 0, 'page': page, 'limit': limit}
    
    def get_by_id(self, employee_id: str) -> Optional[Dict]:
        """Get employee by ID"""
        try:
            result = self.supabase.table(self.table_name).select('*')\
                .eq('employee_id', employee_id)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error fetching employee: {str(e)}")
            return None
    
    def get_by_uuid(self, uuid: str) -> Optional[Dict]:
        """Get employee by UUID"""
        try:
            result = self.supabase.table(self.table_name).select('*')\
                .eq('id', uuid)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error fetching employee: {str(e)}")
            return None
    
    def update(self, employee_id: str, update_data: Dict) -> Optional[Dict]:
        """Update employee information"""
        try:
            # Don't allow updating employee_id
            update_data.pop('employee_id', None)
            
            # Update timestamp
            update_data['updated_at'] = datetime.now().isoformat()
            
            result = self.supabase.table(self.table_name).update(update_data)\
                .eq('employee_id', employee_id)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error updating employee: {str(e)}")
            return None
    
    def delete(self, employee_id: str) -> bool:
        """Delete employee (soft delete by setting status to Inactive)"""
        try:
            result = self.supabase.table(self.table_name).update({
                'status': 'Inactive',
                'updated_at': datetime.now().isoformat()
            }).eq('employee_id', employee_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error deleting employee: {str(e)}")
            return False
    
    def get_department_stats(self) -> Dict:
        """Get department-wise employee statistics"""
        try:
            result = self.supabase.table(self.table_name).select('department, status')\
                .execute()
            
            stats = {}
            for employee in result.data or []:
                dept = employee['department']
                status = employee['status']
                
                if dept not in stats:
                    stats[dept] = {'total': 0, 'active': 0, 'inactive': 0}
                
                stats[dept]['total'] += 1
                if status == 'Active':
                    stats[dept]['active'] += 1
                else:
                    stats[dept]['inactive'] += 1
            
            return stats
            
        except Exception as e:
            print(f"Error fetching department stats: {str(e)}")
            return {}
    
    def search(self, query: str, filters: Dict = None) -> List[Dict]:
        """Search employees by name, email, or employee_id"""
        try:
            search_query = self.supabase.table(self.table_name).select('*')\
                .or_(f"name.ilike.%{query}%,email.ilike.%{query}%,employee_id.ilike.%{query}%")
            
            # Apply additional filters
            if filters:
                if filters.get('department'):
                    search_query = search_query.eq('department', filters['department'])
                if filters.get('status'):
                    search_query = search_query.eq('status', filters['status'])
            
            result = search_query.execute()
            return result.data or []
            
        except Exception as e:
            print(f"Error searching employees: {str(e)}")
            return []
