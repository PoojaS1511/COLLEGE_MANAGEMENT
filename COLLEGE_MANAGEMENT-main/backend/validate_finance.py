"""
Finance Module Validation Report Generator
Run this script to generate a complete validation report
"""

import requests
import json
from datetime import datetime

def generate_validation_report(base_url="http://localhost:5000"):
    """Generate complete validation report for finance module"""
    
    report = {
        "generated_at": datetime.now().isoformat(),
        "base_url": base_url,
        "validation_results": {}
    }
    
    # Test endpoints
    endpoints = [
        {
            "name": "Supabase Connection",
            "url": f"{base_url}/api/finance/validate/supabase-connection",
            "key": "supabase_connection"
        },
        {
            "name": "All Tables Validation",
            "url": f"{base_url}/api/finance/validate/tables",
            "key": "all_tables"
        },
        {
            "name": "Student Fees Table",
            "url": f"{base_url}/api/finance/validate/table/finance_studentfees",
            "key": "student_fees"
        },
        {
            "name": "Staff Payroll Table",
            "url": f"{base_url}/api/finance/validate/table/finance_staffpayroll",
            "key": "staff_payroll"
        },
        {
            "name": "Expense Table",
            "url": f"{base_url}/api/finance/validate/table/finance_expense",
            "key": "expense"
        },
        {
            "name": "Vendors Table",
            "url": f"{base_url}/api/finance/validate/table/finance_vendors",
            "key": "vendors"
        },
        {
            "name": "Budget Allocation Table",
            "url": f"{base_url}/api/finance/validate/table/finance_budgetallocation",
            "key": "budget_allocation"
        },
        {
            "name": "Maintenance Table",
            "url": f"{base_url}/api/finance/validate/table/finance_operationmaintenance",
            "key": "maintenance"
        },
        {
            "name": "Payment Date Columns",
            "url": f"{base_url}/api/finance/validate/payment-date-check",
            "key": "payment_dates"
        }
    ]
    
    print("🔍 Starting Finance Module Validation...")
    print(f"📍 Base URL: {base_url}")
    print("=" * 60)
    
    for endpoint in endpoints:
        try:
            print(f"\n📋 Testing: {endpoint['name']}")
            print(f"🔗 URL: {endpoint['url']}")
            
            response = requests.get(endpoint['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                report["validation_results"][endpoint['key']] = {
                    "status": "✅ SUCCESS",
                    "data": data,
                    "error": None
                }
                print(f"✅ Status: SUCCESS")
                
                # Print key results
                if endpoint['key'] == 'supabase_connection':
                    print(f"   Connected: {data.get('supabase_connected', 'Unknown')}")
                    print(f"   Tables Accessible: {len(data.get('table_access_tests', {}))}")
                
                elif endpoint['key'] == 'all_tables':
                    summary = data.get('summary', {})
                    print(f"   Total Tables: {summary.get('total_tables', 0)}")
                    print(f"   Accessible: {summary.get('accessible_tables', 0)}")
                    print(f"   Correct Columns: {summary.get('tables_with_correct_columns', 0)}")
                
                elif 'column_match' in data:
                    print(f"   Table Exists: {data.get('exists', False)}")
                    print(f"   Columns Match: {data.get('column_match', False)}")
                    print(f"   Sample Data: {data.get('sample_data_count', 0)} rows")
                
            else:
                report["validation_results"][endpoint['key']] = {
                    "status": "❌ FAILED",
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "data": None
                }
                print(f"❌ Status: FAILED ({response.status_code})")
                print(f"   Error: {response.text}")
                
        except requests.exceptions.RequestException as e:
            report["validation_results"][endpoint['key']] = {
                "status": "❌ ERROR",
                "error": str(e),
                "data": None
            }
            print(f"❌ Status: ERROR")
            print(f"   Exception: {str(e)}")
    
    # Generate summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    
    success_count = sum(1 for r in report["validation_results"].values() if "SUCCESS" in r["status"])
    total_count = len(report["validation_results"])
    
    print(f"Total Tests: {total_count}")
    print(f"Successful: {success_count}")
    print(f"Failed: {total_count - success_count}")
    print(f"Success Rate: {(success_count/total_count)*100:.1f}%")
    
    # Save report to file
    report_file = f"finance_validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n💾 Detailed report saved to: {report_file}")
    
    return report

if __name__ == "__main__":
    # Run validation
    report = generate_validation_report()
    
    print("\n🎉 Validation Complete!")
    print("\nNext Steps:")
    print("1. Fix any failed validations")
    print("2. Ensure all tables exist in Supabase")
    print("3. Verify column names match frontend expectations")
    print("4. Test data fetching in frontend components")
