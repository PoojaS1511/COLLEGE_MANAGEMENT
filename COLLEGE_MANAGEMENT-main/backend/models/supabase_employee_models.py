"""
Supabase Employee Models
Contains all employee-related models for Supabase integration
"""

import uuid
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from pydantic import BaseModel


class SupabaseEmployeeDocuments:
    """Employee Documents Model for Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = "employee_documents"
    
    def upload_document(self, employee_id: str, document_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Upload a new document for an employee"""
        try:
            document_record = {
                'id': str(uuid.uuid4()),
                'employee_id': employee_id,
                'doc_type': document_data['doc_type'],
                'doc_name': document_data['doc_name'],
                'doc_url': document_data['doc_url'],
                'upload_date': datetime.now().isoformat(),
                'status': 'Active',
                'created_at': datetime.now().isoformat()
            }
            
            result = self.client.table(self.table_name).insert(document_record).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error uploading document: {e}")
            return None
    
    def get_employee_documents(self, employee_id: str) -> List[Dict[str, Any]]:
        """Get all documents for an employee"""
        try:
            result = self.client.table(self.table_name).select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return result.data
            return []
            
        except Exception as e:
            print(f"Error getting employee documents: {e}")
            return []
    
    def get_document_stats(self, employee_id: str) -> Dict[str, Any]:
        """Get document statistics for an employee"""
        try:
            documents = self.get_employee_documents(employee_id)
            
            stats = {
                'total_documents': len(documents),
                'active_documents': len([d for d in documents if d['status'] == 'Active']),
                'document_types': {}
            }
            
            for doc in documents:
                doc_type = doc['doc_type']
                stats['document_types'][doc_type] = stats['document_types'].get(doc_type, 0) + 1
            
            return stats
            
        except Exception as e:
            print(f"Error getting document stats: {e}")
            return {'total_documents': 0, 'active_documents': 0, 'document_types': {}}


class SupabaseSalaryStructure:
    """Salary Structure Model for Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = "salary_structure"
    
    def create_salary_structure(self, employee_id: str, salary_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create salary structure for an employee"""
        try:
            salary_record = {
                'id': str(uuid.uuid4()),
                'employee_id': employee_id,
                'basic_pay': float(salary_data['basic_pay']),
                'hra': float(salary_data.get('hra', 0)),
                'da': float(salary_data.get('da', 0)),
                'other_allowances': float(salary_data.get('other_allowances', 0)),
                'pf_deduction': float(salary_data.get('pf_deduction', 0)),
                'professional_tax': float(salary_data.get('professional_tax', 0)),
                'income_tax': float(salary_data.get('income_tax', 0)),
                'other_deductions': float(salary_data.get('other_deductions', 0)),
                'total_salary': float(salary_data.get('total_salary', 0)),
                'effective_from': salary_data['effective_from'],
                'status': 'Active',
                'created_at': datetime.now().isoformat()
            }
            
            # Calculate total salary if not provided
            if not salary_data.get('total_salary'):
                salary_record['total_salary'] = (
                    salary_record['basic_pay'] + 
                    salary_record['hra'] + 
                    salary_record['da'] + 
                    salary_record['other_allowances']
                )
            
            result = self.client.table(self.table_name).insert(salary_record).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error creating salary structure: {e}")
            return None
    
    def get_current_salary(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """Get current salary structure for an employee"""
        try:
            result = (self.client.table(self.table_name)
                     .select('*')
                     .eq('employee_id', employee_id)
                     .eq('status', 'Active')
                     .order('effective_from', desc=True)
                     .limit(1)
                     .execute())
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting current salary: {e}")
            return None


class SupabaseLeavePolicy:
    """Leave Policy Model for Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = "leave_policy"
    
    def create_leave_policy(self, employee_id: str, leave_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create leave policy for an employee"""
        try:
            leave_record = {
                'id': str(uuid.uuid4()),
                'employee_id': employee_id,
                'casual_leave': int(leave_data.get('casual_leave', 12)),
                'sick_leave': int(leave_data.get('sick_leave', 12)),
                'earned_leave': int(leave_data.get('earned_leave', 15)),
                'maternity_leave': int(leave_data.get('maternity_leave', 0)),
                'paternity_leave': int(leave_data.get('paternity_leave', 0)),
                'leave_encashment': leave_data.get('leave_encashment', False),
                'carry_forward': leave_data.get('carry_forward', False),
                'effective_from': leave_data['effective_from'],
                'status': 'Active',
                'created_at': datetime.now().isoformat()
            }
            
            result = self.client.table(self.table_name).insert(leave_record).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error creating leave policy: {e}")
            return None
    
    def get_current_leave_policy(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """Get current leave policy for an employee"""
        try:
            result = (self.client.table(self.table_name)
                     .select('*')
                     .eq('employee_id', employee_id)
                     .eq('status', 'Active')
                     .order('effective_from', desc=True)
                     .limit(1)
                     .execute())
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting current leave policy: {e}")
            return None


class SupabaseWorkPolicy:
    """Work Policy Model for Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = "work_policy"
    
    def create_work_policy(self, employee_id: str, work_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create work policy for an employee"""
        try:
            work_record = {
                'id': str(uuid.uuid4()),
                'employee_id': employee_id,
                'work_days': work_data.get('work_days', 'Monday-Friday'),
                'start_time': work_data.get('start_time', '09:00'),
                'end_time': work_data.get('end_time', '18:00'),
                'break_duration': int(work_data.get('break_duration', 60)),
                'work_from_home': work_data.get('work_from_home', False),
                'flexible_timing': work_data.get('flexible_timing', False),
                'overtime_policy': work_data.get('overtime_policy', 'Standard'),
                'effective_from': work_data['effective_from'],
                'status': 'Active',
                'created_at': datetime.now().isoformat()
            }
            
            result = self.client.table(self.table_name).insert(work_record).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error creating work policy: {e}")
            return None
    
    def get_current_work_policy(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """Get current work policy for an employee"""
        try:
            result = (self.client.table(self.table_name)
                     .select('*')
                     .eq('employee_id', employee_id)
                     .eq('status', 'Active')
                     .order('effective_from', desc=True)
                     .limit(1)
                     .execute())
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting current work policy: {e}")
            return None
