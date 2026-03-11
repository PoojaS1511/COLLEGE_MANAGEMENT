"""
Finance Module Database Validation Script
Checks table existence, column names, and Supabase connectivity
"""

from flask import Blueprint, jsonify, request
from supabase_client import get_supabase
import logging

logger = logging.getLogger(__name__)

validation_bp = Blueprint('finance_validation', __name__)
supabase = get_supabase()

# Expected table structures based on frontend components
EXPECTED_TABLES = {
    'finance_studentfees': {
        'columns': [
            'id', 'student_id', 'student_name', 'department', 'academic_year',
            'total_fee', 'paid_amount', 'pending_amount', 'payment_date', 
            'payment_status', 'created_at', 'updated_at'
        ],
        'description': 'Student fee management table'
    },
    'finance_staffpayroll': {
        'columns': [
            'id', 'staff_id', 'staff_name', 'department', 'role',
            'base_salary', 'allowances', 'deductions', 'net_salary',
            'payment_date', 'payment_status', 'created_at', 'updated_at'
        ],
        'description': 'Staff payroll management table'
    },
    'finance_expense': {
        'columns': [
            'id', 'expense_id', 'expense_category', 'department', 'vendor',
            'amount', 'expense_date', 'payment_status', 'description',
            'created_at', 'updated_at'
        ],
        'description': 'Expense tracking table'
    },
    'finance_vendors': {
        'columns': [
            'id', 'vendor_id', 'vendor_name', 'service_type', 'contact_number',
            'email', 'amount_due', 'amount_paid', 'total_transactions',
            'created_at', 'updated_at'
        ],
        'description': 'Vendor management table'
    },
    'finance_budgetallocation': {
        'columns': [
            'id', 'budget_id', 'department', 'financial_year',
            'allocated_amount', 'used_amount', 'remaining_amount',
            'budget_status', 'created_at', 'updated_at'
        ],
        'description': 'Budget allocation table'
    },
    'finance_operationmaintenance': {
        'columns': [
            'id', 'request_id', 'asset_name', 'department', 'issue_description',
            'reported_date', 'resolved_date', 'maintenance_cost', 'status',
            'created_at', 'updated_at'
        ],
        'description': 'Maintenance operations table'
    }
}

@validation_bp.route('/api/finance/validate/tables', methods=['GET'])
def validate_all_tables():
    """Validate all finance tables exist and have correct columns"""
    results = {}
    
    for table_name, expected in EXPECTED_TABLES.items():
        try:
            # Check if table exists by trying to select from it
            response = supabase.table(table_name).select('*').limit(1).execute()
            
            if response.data is not None:
                # Get actual columns from the first row
                actual_columns = list(response.data[0].keys()) if response.data else []
                
                # Check for missing columns
                missing_columns = [col for col in expected['columns'] if col not in actual_columns]
                extra_columns = [col for col in actual_columns if col not in expected['columns']]
                
                # Try to fetch sample data
                sample_response = supabase.table(table_name).select('*').limit(5).execute()
                sample_data = sample_response.data if sample_response.data else []
                
                results[table_name] = {
                    'exists': True,
                    'accessible': True,
                    'expected_columns': expected['columns'],
                    'actual_columns': actual_columns,
                    'missing_columns': missing_columns,
                    'extra_columns': extra_columns,
                    'column_match': len(missing_columns) == 0,
                    'sample_data_count': len(sample_data),
                    'description': expected['description'],
                    'status': '✅ OK' if len(missing_columns) == 0 else '⚠️ COLUMN MISMATCH'
                }
            else:
                results[table_name] = {
                    'exists': False,
                    'accessible': False,
                    'error': 'Table not found or not accessible',
                    'status': '❌ NOT FOUND'
                }
                
        except Exception as e:
            results[table_name] = {
                'exists': False,
                'accessible': False,
                'error': str(e),
                'status': '❌ ERROR'
            }
    
    return jsonify({
        'success': True,
        'validation_results': results,
        'summary': {
            'total_tables': len(EXPECTED_TABLES),
            'accessible_tables': sum(1 for r in results.values() if r.get('accessible', False)),
            'tables_with_correct_columns': sum(1 for r in results.values() if r.get('column_match', False))
        }
    })

@validation_bp.route('/api/finance/validate/table/<table_name>', methods=['GET'])
def validate_specific_table(table_name):
    """Validate a specific table"""
    if table_name not in EXPECTED_TABLES:
        return jsonify({
            'success': False,
            'error': f'Table {table_name} not in expected finance tables'
        }), 400
    
    expected = EXPECTED_TABLES[table_name]
    
    try:
        # Test table access
        response = supabase.table(table_name).select('*').limit(1).execute()
        
        if response.data is None:
            return jsonify({
                'success': False,
                'table_name': table_name,
                'error': 'Table not accessible',
                'exists': False
            })
        
        # Get actual columns
        actual_columns = list(response.data[0].keys()) if response.data else []
        
        # Check column match
        missing_columns = [col for col in expected['columns'] if col not in actual_columns]
        extra_columns = [col for col in actual_columns if col not in expected['columns']]
        
        # Test data fetching
        sample_response = supabase.table(table_name).select('*').limit(10).execute()
        
        return jsonify({
            'success': True,
            'table_name': table_name,
            'exists': True,
            'accessible': True,
            'expected_columns': expected['columns'],
            'actual_columns': actual_columns,
            'missing_columns': missing_columns,
            'extra_columns': extra_columns,
            'column_match': len(missing_columns) == 0,
            'sample_data_count': len(sample_response.data) if sample_response.data else 0,
            'sample_data': sample_response.data[:3] if sample_response.data else [],
            'description': expected['description'],
            'validation_status': '✅ VALID' if len(missing_columns) == 0 else '⚠️ INVALID'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'table_name': table_name,
            'error': str(e),
            'exists': False,
            'accessible': False
        })

@validation_bp.route('/api/finance/validate/supabase-connection', methods=['GET'])
def validate_supabase_connection():
    """Test Supabase connection and permissions"""
    try:
        # Test basic connection
        auth_response = supabase.auth.get_session()
        
        # Test table access
        test_results = {}
        for table_name in ['finance_studentfees', 'finance_expense']:
            try:
                response = supabase.table(table_name).select('count').execute()
                test_results[table_name] = {
                    'connected': True,
                    'accessible': True,
                    'error': None
                }
            except Exception as e:
                test_results[table_name] = {
                    'connected': False,
                    'accessible': False,
                    'error': str(e)
                }
        
        return jsonify({
            'success': True,
            'supabase_connected': True,
            'auth_session': auth_response is not None,
            'table_access_tests': test_results,
            'connection_status': '✅ CONNECTED'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'supabase_connected': False,
            'error': str(e),
            'connection_status': '❌ DISCONNECTED'
        })

@validation_bp.route('/api/finance/validate/payment-date-check', methods=['GET'])
def validate_payment_date_columns():
    """Specifically check payment_date columns in relevant tables"""
    tables_to_check = {
        'finance_studentfees': 'payment_date',
        'finance_staffpayroll': 'payment_date',
        'finance_expense': 'expense_date'
    }
    
    results = {}
    
    for table_name, date_column in tables_to_check.items():
        try:
            # Check if column exists by trying to select it
            response = supabase.table(table_name).select(date_column).limit(1).execute()
            
            if response.data is not None:
                # Get sample data with date column
                sample_response = supabase.table(table_name).select(date_column).limit(5).execute()
                date_values = [row.get(date_column) for row in sample_response.data] if sample_response.data else []
                
                results[table_name] = {
                    'column_exists': True,
                    'column_name': date_column,
                    'sample_values': date_values,
                    'has_data': len(date_values) > 0,
                    'status': '✅ OK'
                }
            else:
                results[table_name] = {
                    'column_exists': False,
                    'column_name': date_column,
                    'status': '❌ NOT FOUND'
                }
                
        except Exception as e:
            results[table_name] = {
                'column_exists': False,
                'column_name': date_column,
                'error': str(e),
                'status': '❌ ERROR'
            }
    
    return jsonify({
        'success': True,
        'payment_date_validation': results,
        'summary': {
            'tables_checked': len(tables_to_check),
            'columns_found': sum(1 for r in results.values() if r.get('column_exists', False))
        }
    })

# Frontend validation functions (to be added to frontend)
FRONTEND_VALIDATION_CODE = """
// Frontend Validation Script
// Add this to your finance components to validate backend data

const validateFinanceData = async () => {
    try {
        // Check all tables
        const tablesResponse = await fetch('/api/finance/validate/tables');
        const tablesData = await tablesResponse.json();
        
        console.log('=== FINANCE TABLES VALIDATION ===');
        console.table(tablesData.validation_results);
        
        // Check specific tables
        const studentFeesResponse = await fetch('/api/finance/validate/table/finance_studentfees');
        const studentFeesData = await studentFeesResponse.json();
        
        console.log('=== STUDENT FEES TABLE ===');
        console.log('Table exists:', studentFeesData.exists);
        console.log('Columns match:', studentFeesData.column_match);
        console.log('Sample data:', studentFeesData.sample_data);
        
        // Check payment dates
        const paymentDateResponse = await fetch('/api/finance/validate/payment-date-check');
        const paymentDateData = await paymentDateResponse.json();
        
        console.log('=== PAYMENT DATE COLUMNS ===');
        console.table(paymentDateData.payment_date_validation);
        
        // Check Supabase connection
        const connectionResponse = await fetch('/api/finance/validate/supabase-connection');
        const connectionData = await connectionResponse.json();
        
        console.log('=== SUPABASE CONNECTION ===');
        console.log('Connected:', connectionData.supabase_connected);
        console.log('Table access:', connectionData.table_access_tests);
        
        return {
            tables: tablesData,
            studentFees: studentFeesData,
            paymentDates: paymentDateData,
            connection: connectionData
        };
        
    } catch (error) {
        console.error('Validation failed:', error);
        return { error: error.message };
    }
};

// Usage in your component:
// useEffect(() => {
//     validateFinanceData().then(results => {
//         if (results.error) {
//             console.error('Validation error:', results.error);
//         } else {
//             console.log('Validation completed successfully');
//         }
//     });
// }, []);
"""

if __name__ == '__main__':
    print("Finance Validation Script Ready")
    print("Add this blueprint to your Flask app:")
    print("app.register_blueprint(validation_bp)")
    print("\nExpected Tables:")
    for table, info in EXPECTED_TABLES.items():
        print(f"- {table}: {info['description']}")
