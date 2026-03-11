"""
PostgreSQL Payroll Model
Handles all payroll operations with PostgreSQL database
Migrated from Supabase
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime, date
from typing import List, Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

class PostgresPayroll:
    """PostgreSQL model for payroll operations"""
    
    def __init__(self):
        self.table_name = 'payroll'
    
    def create_payroll_record(self, payroll_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new payroll record"""
        try:
            # Calculate derived fields
            payroll_data = self._calculate_payroll_fields(payroll_data)
            
            result = execute_insert(self.table_name, payroll_data)
            
            if result:
                logger.info(f"Created payroll record for faculty {payroll_data.get('faculty_id')}")
                return result
            else:
                logger.error(f"Failed to create payroll record")
                raise Exception("Failed to create payroll record")
                
        except Exception as e:
            logger.error(f"Error creating payroll record: {str(e)}")
            raise
    
    def get_all_payroll_records(self, limit: int = 50, offset: int = 0, 
                               status_filter: Optional[str] = None,
                               month_filter: Optional[str] = None) -> Dict[str, Any]:
        """Get all payroll records with pagination and filtering"""
        try:
            # Build query with filters
            query = f"SELECT * FROM {self.table_name} WHERE 1=1"
            params = []
            
            if status_filter:
                query += " AND status = %s"
                params.append(status_filter)
            
            if month_filter:
                query += " AND pay_month = %s"
                params.append(month_filter)
            
            # Get total count
            count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
            try:
                total_result = execute_query(count_query, params, fetch_all=False)
                total = total_result.get('count', 0) if total_result else 0
            except:
                total = 0
            
            # Add pagination and ordering
            query += f" ORDER BY pay_month DESC, created_at DESC LIMIT {limit} OFFSET {offset}"
            
            result = execute_query(query, params, fetch_all=True)
            
            return {
                'data': result or [],
                'total': total,
                'limit': limit,
                'offset': offset
            }
            
        except Exception as e:
            logger.error(f"Error fetching payroll records: {str(e)}")
            raise
    
    def get_payroll_by_id(self, payroll_id: int) -> Optional[Dict[str, Any]]:
        """Get payroll record by ID"""
        try:
            result = execute_query(
                f"SELECT * FROM {self.table_name} WHERE id = %s",
                [payroll_id], fetch_all=False
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching payroll record {payroll_id}: {str(e)}")
            raise
    
    def get_payroll_by_faculty_month(self, faculty_id: str, pay_month: str) -> Optional[Dict[str, Any]]:
        """Get payroll record by faculty ID and month"""
        try:
            result = execute_query(
                f"SELECT * FROM {self.table_name} WHERE faculty_id = %s AND pay_month = %s",
                [faculty_id, pay_month], fetch_all=False
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching payroll for faculty {faculty_id}, month {pay_month}: {str(e)}")
            raise
    
    def update_payroll_record(self, payroll_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update payroll record"""
        try:
            # Recalculate fields if salary or attendance is being updated
            if any(key in update_data for key in ['basic_salary', 'total_days', 'present_days', 'absent_days']):
                current_record = self.get_payroll_by_id(payroll_id)
                if current_record:
                    merged_data = {**current_record, **update_data}
                    update_data = self._calculate_payroll_fields(merged_data)
            
            result = execute_update(self.table_name, payroll_id, update_data)
            
            if result:
                logger.info(f"Updated payroll record {payroll_id}")
                return result
            else:
                logger.error(f"Failed to update payroll record {payroll_id}")
                raise Exception("Failed to update payroll record")
                
        except Exception as e:
            logger.error(f"Error updating payroll record {payroll_id}: {str(e)}")
            raise
    
    def approve_payroll(self, payroll_id: int) -> Dict[str, Any]:
        """Approve payroll record"""
        return self.update_payroll_record(payroll_id, {'status': 'Approved'})
    
    def mark_as_paid(self, payroll_id: int) -> Dict[str, Any]:
        """Mark payroll as paid"""
        return self.update_payroll_record(payroll_id, {'status': 'Paid'})
    
    def delete_payroll_record(self, payroll_id: int) -> bool:
        """Delete payroll record (soft delete by updating status)"""
        try:
            result = execute_update(self.table_name, payroll_id, {'status': 'Cancelled'})
            
            if result:
                logger.info(f"Cancelled payroll record {payroll_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting payroll record {payroll_id}: {str(e)}")
            raise
    
    def get_payroll_statistics(self) -> Dict[str, Any]:
        """Get payroll statistics for dashboard"""
        try:
            # Get all payroll records to calculate statistics
            all_records = execute_query(
                f"SELECT status, net_salary, pay_month FROM {self.table_name}",
                fetch_all=True
            )

            # Get current month data
            current_month = datetime.now().strftime('%Y-%m-01')
            current_month_result = execute_query(
                f"SELECT net_salary FROM {self.table_name} WHERE pay_month = %s",
                [current_month], fetch_all=True
            )

            # Calculate statistics
            status_counts = {}
            total_cost = 0
            current_month_cost = 0
            total_records = 0

            if all_records:
                total_records = len(all_records)
                for record in all_records:
                    # Count by status
                    status = record.get('status', 'Unknown')
                    status_counts[status] = status_counts.get(status, 0) + 1

                    # Sum total cost
                    total_cost += record.get('net_salary', 0) or 0

            if current_month_result:
                current_month_cost = sum(record.get('net_salary', 0) or 0 for record in current_month_result)

            return {
                'total_payroll_cost': total_cost,
                'current_month_cost': current_month_cost,
                'pending_payrolls': status_counts.get('Pending', 0),
                'approved_payrolls': status_counts.get('Approved', 0),
                'paid_payrolls': status_counts.get('Paid', 0),
                'total_records': total_records
            }

        except Exception as e:
            logger.error(f"Error fetching payroll statistics: {str(e)}")
            raise
    
    def calculate_monthly_payroll(self, faculty_id: str, pay_month: str, 
                                 basic_salary: float, total_days: int, 
                                 present_days: int, role: str) -> Dict[str, Any]:
        """Calculate payroll for a faculty for a specific month"""
        try:
            absent_days = total_days - present_days
            
            # Calculate per day salary
            per_day_salary = basic_salary / total_days if total_days > 0 else 0
            
            # Calculate LOP (Loss of Pay)
            lop_amount = per_day_salary * absent_days
            
            # Calculate deductions (PF 12%, ESI 1.75%, Tax estimate 10%, plus LOP)
            pf_deduction = basic_salary * 0.12  # 12% PF
            esi_deduction = basic_salary * 0.0175  # 1.75% ESI
            tax_deduction = basic_salary * 0.10  # 10% Tax (simplified)
            
            total_deductions = pf_deduction + esi_deduction + tax_deduction + lop_amount
            net_salary = basic_salary - total_deductions
            
            payroll_data = {
                'faculty_id': faculty_id,
                'pay_month': pay_month,
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'basic_salary': basic_salary,
                'deductions': total_deductions,
                'net_salary': net_salary,
                'role': role,
                'status': 'Pending'
            }
            
            return payroll_data
            
        except Exception as e:
            logger.error(f"Error calculating payroll: {str(e)}")
            raise
    
    def _calculate_payroll_fields(self, payroll_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate derived payroll fields"""
        try:
            total_days = payroll_data.get('total_days', 0)
            present_days = payroll_data.get('present_days', 0)
            basic_salary = float(payroll_data.get('basic_salary', 0))
            
            # Calculate absent days
            absent_days = total_days - present_days
            payroll_data['absent_days'] = absent_days
            
            # Calculate per day salary
            per_day_salary = basic_salary / total_days if total_days > 0 else 0
            
            # Calculate LOP
            lop_amount = per_day_salary * absent_days
            
            # Calculate standard deductions
            pf_deduction = basic_salary * 0.12  # 12% PF
            esi_deduction = basic_salary * 0.0175  # 1.75% ESI
            tax_deduction = basic_salary * 0.10  # 10% Tax (simplified)
            
            total_deductions = pf_deduction + esi_deduction + tax_deduction + lop_amount
            net_salary = basic_salary - total_deductions
            
            payroll_data['deductions'] = total_deductions
            payroll_data['net_salary'] = net_salary
            
            return payroll_data
            
        except Exception as e:
            logger.error(f"Error calculating payroll fields: {str(e)}")
            raise
    
    def bulk_approve_payroll(self, payroll_ids: List[int]) -> Dict[str, Any]:
        """Bulk approve multiple payroll records"""
        try:
            updated_records = []
            errors = []
            
            for payroll_id in payroll_ids:
                try:
                    result = self.approve_payroll(payroll_id)
                    updated_records.append(result)
                except Exception as e:
                    errors.append(f"Failed to approve payroll {payroll_id}: {str(e)}")
            
            return {
                'success_count': len(updated_records),
                'error_count': len(errors),
                'updated_records': updated_records,
                'errors': errors
            }
            
        except Exception as e:
            logger.error(f"Error in bulk approve payroll: {str(e)}")
            raise

# Singleton instance
payroll_model = PostgresPayroll()

