"""
Supabase Transport Fee Model
Handles transport fee operations with Supabase database
"""

import os
import json
from datetime import datetime, date
from typing import List, Dict, Optional, Any
from supabase import create_client

class SupabaseTransportFee:
    """Transport Fee Model for Supabase"""

    def __init__(self, supabase_or_url, supabase_key=None):
        if supabase_key is None and hasattr(supabase_or_url, 'table'):
            # It's a supabase client
            self.supabase = supabase_or_url
        else:
            # It's URL and key
            self.supabase = create_client(supabase_or_url, supabase_key)
        self.table_name = 'transport_fee'
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport fees"""
        try:
            query = self.supabase.table(self.table_name).select('*')
            
            if filters:
                if filters.get('payment_status'):
                    query = query.eq('payment_status', filters['payment_status'])
                if filters.get('student_id'):
                    query = query.eq('student_id', filters['student_id'])
                if filters.get('academic_year'):
                    query = query.eq('academic_year', filters['academic_year'])
                if filters.get('search'):
                    search = filters['search']
                    # We don't have student_name in the fee table, but we might have it in processed records
                    # or we can search by student_id or bus_no/route_name
                    query = query.or_(f"student_id.ilike.%{search}%,bus_no.ilike.%{search}%,route_name.ilike.%{search}%")
            
            response = query.execute()
            
            if response.data:
                # Convert datetime strings to proper format and calculate due_amount
                processed_data = []
                for record in response.data:
                    processed_record = self._process_record(record)
                    processed_data.append(processed_record)
                return processed_data
            else:
                return []
                
        except Exception as e:
            print(f"Error fetching transport fees: {e}")
            return []
    
    def get_by_id(self, fee_id: str) -> Optional[Dict]:
        """Get fee by ID"""
        try:
            response = self.supabase.table(self.table_name).select('*').eq('id', fee_id).execute()
            
            if response.data and len(response.data) > 0:
                return self._process_record(response.data[0])
            else:
                return None
                
        except Exception as e:
            print(f"Error fetching fee by ID: {e}")
            return None
    
    def create(self, data: Dict) -> Dict:
        """Create new transport fee"""
        try:
            # Prepare data for Supabase - handle both schemas
            fee_data = {
                'student_id': data.get('student_id'),
                'route_name': data.get('route_name', data.get('route_id', '')),
                'bus_no': data.get('bus_no'),
                'fee_amount': float(data.get('fee_amount', data.get('amount', 2500.00))),
                'paid_amount': float(data.get('paid_amount', data.get('amount', 0.00) if data.get('payment_status') == 'Paid' else 0.00)),
                'payment_status': data.get('payment_status', 'Pending'),
                'payment_date': data.get('payment_date'),
                'academic_year': data.get('academic_year', '2023-24'),
                'payment_mode': data.get('payment_mode')
            }
            
            # Remove None values
            fee_data = {k: v for k, v in fee_data.items() if v is not None}
            
            response = self.supabase.table(self.table_name).insert(fee_data).execute()
            
            if response.data and len(response.data) > 0:
                return self._process_record(response.data[0])
            else:
                raise Exception("Failed to create transport fee record")
                
        except Exception as e:
            print(f"Error creating transport fee: {e}")
            raise e
    
    def update(self, fee_id: str, data: Dict) -> Dict:
        """Update transport fee"""
        try:
            # Prepare update data
            update_data = {}
            
            # Map fields from legacy to Supabase
            mapping = {
                'route_id': 'route_name',
                'amount': 'fee_amount',
            }
            
            for legacy_field, supabase_field in mapping.items():
                if legacy_field in data:
                    if legacy_field == 'amount':
                        update_data[supabase_field] = float(data[legacy_field])
                    else:
                        update_data[supabase_field] = data[legacy_field]

            for field in ['route_name', 'bus_no', 'fee_amount', 'paid_amount', 
                         'payment_status', 'payment_date', 'academic_year', 'payment_mode']:
                if field in data:
                    if field in ['fee_amount', 'paid_amount']:
                        update_data[field] = float(data[field])
                    else:
                        update_data[field] = data[field]
            
            # Special case: if status becomes Paid and paid_amount not set, set it to fee_amount
            if update_data.get('payment_status') == 'Paid' and 'paid_amount' not in update_data:
                # We might need to fetch the current fee_amount if not in update_data
                pass 
            
            response = self.supabase.table(self.table_name).update(update_data).eq('id', fee_id).execute()
            
            if response.data and len(response.data) > 0:
                return self._process_record(response.data[0])
            else:
                raise Exception("Failed to update transport fee record")
                
        except Exception as e:
            print(f"Error updating transport fee: {e}")
            raise e
    
    def delete(self, fee_id: str) -> bool:
        """Delete transport fee"""
        try:
            response = self.supabase.table(self.table_name).delete().eq('id', fee_id).execute()
            return len(response.data) > 0 if response.data else False
            
        except Exception as e:
            print(f"Error deleting transport fee: {e}")
            return False
    
    def get_by_student_id(self, student_id: str) -> List[Dict]:
        """Get fees by student ID"""
        try:
            response = self.supabase.table(self.table_name).select('*').eq('student_id', student_id).execute()
            
            if response.data:
                return [self._process_record(record) for record in response.data]
            else:
                return []
                
        except Exception as e:
            print(f"Error fetching fees by student ID: {e}")
            return []
    
    def get_payment_statistics(self) -> Dict:
        """Get payment statistics"""
        try:
            # Get counts by payment status
            response = self.supabase.table(self.table_name).select('payment_status, fee_amount, paid_amount').execute()
            
            if not response.data:
                return {
                    'total_records': 0,
                    'paid_count': 0,
                    'pending_count': 0,
                    'overdue_count': 0,
                    'total_amount': 0.0,
                    'collected_amount': 0.0,
                    'pending_amount': 0.0,
                    'collection_rate': 0.0
                }
            
            stats = {
                'total_records': len(response.data),
                'paid_count': 0,
                'pending_count': 0,
                'overdue_count': 0,
                'total_amount': 0.0,
                'collected_amount': 0.0,
                'pending_amount': 0.0
            }
            
            for record in response.data:
                status = record.get('payment_status', 'Pending')
                fee_amount = float(record.get('fee_amount', 0))
                paid_amount = float(record.get('paid_amount', 0))
                
                stats['total_amount'] += fee_amount
                stats['collected_amount'] += paid_amount
                
                if status == 'Paid':
                    stats['paid_count'] += 1
                elif status == 'Pending':
                    stats['pending_count'] += 1
                elif status == 'Overdue':
                    stats['overdue_count'] += 1
            
            stats['pending_amount'] = stats['total_amount'] - stats['collected_amount']
            stats['collection_rate'] = (stats['collected_amount'] / stats['total_amount'] * 100) if stats['total_amount'] > 0 else 0.0
            
            return stats
            
        except Exception as e:
            print(f"Error getting payment statistics: {e}")
            return {}
    
    def _process_record(self, record: Dict) -> Dict:
        """Process record for consistent format"""
        processed = record.copy()
        
        # Map Supabase fields to frontend expected fields
        if 'fee_amount' in processed:
            processed['amount'] = float(processed['fee_amount'])
        if 'paid_amount' in processed:
            processed['paid_amount'] = float(processed['paid_amount'])
        if 'route_name' in processed:
            processed['route_id'] = processed['route_name']
        
        # Calculate due_amount if not present (it's a generated column in Supabase)
        if 'due_amount' not in processed and 'fee_amount' in processed and 'paid_amount' in processed:
            processed['due_amount'] = processed['fee_amount'] - processed['paid_amount']
        elif 'due_amount' in processed:
            processed['due_amount'] = float(processed['due_amount'])
        
        # Add missing fields that frontend expects
        if 'student_name' not in processed:
            processed['student_name'] = f"Student {processed.get('student_id', 'Unknown')}"
        if 'due_date' not in processed:
            # Set due_date to 30 days from now if not present
            from datetime import timedelta
            processed['due_date'] = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        if 'payment_mode' not in processed:
            processed['payment_mode'] = 'Online' if processed.get('payment_status') == 'Paid' else None
        
        # Format dates
        for date_field in ['payment_date', 'created_at', 'due_date']:
            if date_field in processed and processed[date_field]:
                if isinstance(processed[date_field], str):
                    try:
                        processed[date_field] = datetime.fromisoformat(processed[date_field].replace('Z', '+00:00'))
                    except:
                        pass
        
        return processed
