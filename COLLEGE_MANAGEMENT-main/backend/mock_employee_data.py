"""
Quick fix for HR modules - Mock data implementation
This will allow HR modules to work while database tables are being set up
"""

import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional

class MockEmployeeMaster:
    """Mock Employee Master Model for demonstration"""
    
    def __init__(self):
        # Generate sample employee data
        self.employees = [
            {
                'id': '550e8400-e29b-41d4-a716-446655440001',
                'employee_id': 'EMP2025CSE001',
                'name': 'Dr. Sarah Johnson',
                'email': 'sarah.johnson@college.edu',
                'phone_number': '+91 9876543210',
                'role': 'Faculty',
                'department': 'Computer Science Engineering',
                'designation': 'Professor',
                'employee_type': 'Faculty',
                'joining_date': '2020-01-15',
                'status': 'Active',
                'created_at': '2020-01-15T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z'
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440002',
                'employee_id': 'EMP2025CSE002',
                'name': 'John Smith',
                'email': 'john.smith@college.edu',
                'phone_number': '+91 9876543211',
                'role': 'Faculty',
                'department': 'Computer Science Engineering',
                'designation': 'Assistant Professor',
                'employee_type': 'Faculty',
                'joining_date': '2021-06-01',
                'status': 'Active',
                'created_at': '2021-06-01T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z'
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440003',
                'employee_id': 'EMP2025HR001',
                'name': 'Emily Davis',
                'email': 'emily.davis@college.edu',
                'phone_number': '+91 9876543212',
                'role': 'Staff',
                'department': 'Human Resources',
                'designation': 'HR Manager',
                'employee_type': 'Staff',
                'joining_date': '2019-03-10',
                'status': 'Active',
                'created_at': '2019-03-10T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z'
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440004',
                'employee_id': 'EMP2025FIN001',
                'name': 'Michael Wilson',
                'email': 'michael.wilson@college.edu',
                'phone_number': '+91 9876543213',
                'role': 'Staff',
                'department': 'Finance',
                'designation': 'Accountant',
                'employee_type': 'Staff',
                'joining_date': '2020-08-20',
                'status': 'Active',
                'created_at': '2020-08-20T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z'
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440005',
                'employee_id': 'EMP2025MEC001',
                'name': 'Dr. Robert Brown',
                'email': 'robert.brown@college.edu',
                'phone_number': '+91 9876543214',
                'role': 'Faculty',
                'department': 'Mechanical Engineering',
                'designation': 'Associate Professor',
                'employee_type': 'Faculty',
                'joining_date': '2018-02-01',
                'status': 'Active',
                'created_at': '2018-02-01T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z'
            }
        ]
    
    def get_all(self, filters: Dict = None, page: int = 1, limit: int = 50) -> Dict:
        """Get all employees with pagination and filters"""
        try:
            # Filter employees
            filtered_employees = self.employees.copy()
            
            if filters:
                if filters.get('department'):
                    filtered_employees = [e for e in filtered_employees if e['department'] == filters['department']]
                if filters.get('status'):
                    filtered_employees = [e for e in filtered_employees if e['status'] == filters['status']]
                if filters.get('role'):
                    filtered_employees = [e for e in filtered_employees if e['role'] == filters['role']]
                if filters.get('employee_type'):
                    filtered_employees = [e for e in filtered_employees if e['employee_type'] == filters['employee_type']]
            
            total = len(filtered_employees)
            
            # Apply pagination
            start = (page - 1) * limit
            end = start + limit
            paginated_employees = filtered_employees[start:end]
            
            return {
                'data': paginated_employees,
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': (total + limit - 1) // limit if total > 0 else 1
            }
            
        except Exception as e:
            print(f"Error fetching employees: {str(e)}")
            return {'data': [], 'total': 0, 'page': page, 'limit': limit, 'total_pages': 1}
    
    def get_by_id(self, employee_id: str) -> Optional[Dict]:
        """Get employee by ID"""
        try:
            for employee in self.employees:
                if employee['employee_id'] == employee_id:
                    return employee
            return None
        except Exception as e:
            print(f"Error fetching employee: {str(e)}")
            return None
    
    def get_by_uuid(self, uuid: str) -> Optional[Dict]:
        """Get employee by UUID"""
        try:
            for employee in self.employees:
                if employee['id'] == uuid:
                    return employee
            return None
        except Exception as e:
            print(f"Error fetching employee: {str(e)}")
            return None
    
    def create(self, employee_data: Dict) -> Optional[Dict]:
        """Create new employee (mock implementation)"""
        try:
            # Generate new ID
            import uuid as uuid_lib
            new_id = str(uuid_lib.uuid4())
            
            # Generate employee_id if not provided
            if 'employee_id' not in employee_data:
                dept_code = employee_data.get('department', 'GEN')[:3].upper()
                year = datetime.now().year
                employee_data['employee_id'] = f"EMP{year}{dept_code}001"
            
            # Set defaults
            employee_data['id'] = new_id
            employee_data.setdefault('status', 'Active')
            employee_data.setdefault('created_at', datetime.now().isoformat())
            employee_data.setdefault('updated_at', datetime.now().isoformat())
            
            # Add to mock database
            self.employees.append(employee_data)
            
            return employee_data
            
        except Exception as e:
            print(f"Error creating employee: {str(e)}")
            return None
    
    def update(self, employee_id: str, update_data: Dict) -> Optional[Dict]:
        """Update employee information (mock implementation)"""
        try:
            # Find employee
            for i, employee in enumerate(self.employees):
                if employee['employee_id'] == employee_id:
                    # Update fields
                    self.employees[i].update(update_data)
                    self.employees[i]['updated_at'] = datetime.now().isoformat()
                    return self.employees[i]
            
            return None
            
        except Exception as e:
            print(f"Error updating employee: {str(e)}")
            return None
    
    def delete(self, employee_id: str) -> bool:
        """Delete employee (mock implementation)"""
        try:
            # Find and remove employee
            for i, employee in enumerate(self.employees):
                if employee['employee_id'] == employee_id:
                    self.employees[i]['status'] = 'Inactive'
                    self.employees[i]['updated_at'] = datetime.now().isoformat()
                    return True
            
            return False
            
        except Exception as e:
            print(f"Error deleting employee: {str(e)}")
            return False
    
    def get_department_stats(self) -> Dict:
        """Get department-wise employee statistics"""
        try:
            stats = {}
            for employee in self.employees:
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
        """Search employees (mock implementation)"""
        try:
            query = query.lower()
            results = []
            
            for employee in self.employees:
                # Search in name, email, employee_id
                if (query in employee['name'].lower() or 
                    query in employee['email'].lower() or 
                    query in employee['employee_id'].lower()):
                    
                    # Apply filters
                    if filters:
                        match = True
                        if filters.get('department') and employee['department'] != filters['department']:
                            match = False
                        if filters.get('status') and employee['status'] != filters['status']:
                            match = False
                        if filters.get('role') and employee['role'] != filters['role']:
                            match = False
                        if filters.get('employee_type') and employee['employee_type'] != filters['employee_type']:
                            match = False
                        
                        if match:
                            results.append(employee)
                    else:
                        results.append(employee)
            
            return results
            
        except Exception as e:
            print(f"Error searching employees: {str(e)}")
            return []

# Create global mock instance
mock_employee_model = MockEmployeeMaster()

print("✅ Mock employee model initialized with sample data")
print(f"📊 Total employees: {len(mock_employee_model.employees)}")
print("🏢 Departments:", list(set(e['department'] for e in mock_employee_model.employees)))
print("👥 Roles:", list(set(e['role'] for e in mock_employee_model.employees)))
