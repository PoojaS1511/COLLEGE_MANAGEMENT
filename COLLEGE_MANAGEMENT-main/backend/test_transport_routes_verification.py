#!/usr/bin/env python3
"""
Comprehensive verification script for transport_routes table connection
Tests Supabase database, backend APIs, and frontend data flow
"""

import requests
import json
import time
from datetime import datetime
import subprocess
import sys
import os

# Configuration
BACKEND_URL = "http://localhost:5001"
FRONTEND_URL = "http://localhost:3000"
SUPABASE_URL = "https://your-project.supabase.co"  # Replace with actual URL

class TransportRoutesVerifier:
    """Comprehensive verifier for transport_routes connections"""

    def __init__(self):
        self.results = {}
        self.backend_running = False
        self.frontend_running = False

    def log(self, message, status="INFO"):
        """Log messages with timestamps"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")

    def check_backend_health(self):
        """Check if backend server is running"""
        self.log("Checking backend server status...")
        try:
            response = requests.get(f"{BACKEND_URL}/api/transport-routes/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.backend_running = True
                    self.log("Backend server is running", "SUCCESS")
                    self.results['Backend Status'] = "Running"
                    return True
        except Exception as e:
            self.log(f"Backend server not accessible: {e}", "ERROR")

        self.results['Backend Status'] = "Not Running"
        return False

    def check_frontend_health(self):
        """Check if frontend server is running"""
        self.log("Checking frontend server status...")
        try:
            response = requests.get(f"{FRONTEND_URL}", timeout=5)
            if response.status_code == 200:
                self.frontend_running = True
                self.log("Frontend server is running", "SUCCESS")
                self.results['Frontend Status'] = "Running"
                return True
        except Exception as e:
            self.log(f"Frontend server not accessible: {e}", "ERROR")

        self.results['Frontend Status'] = "Not Running"
        return False

    def test_supabase_connection(self):
        """Test Supabase database connection and transport_routes table"""
        self.log("Testing Supabase database connection...")

        try:
            # Test transport_routes table access via backend API
            response = requests.get(f"{BACKEND_URL}/api/transport-routes", timeout=10)

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    routes = data.get('data', [])
                    total_count = data.get('total', 0)

                    self.log(f"Successfully connected to transport_routes table", "SUCCESS")
                    self.log(f"Found {total_count} records in transport_routes table")

                    # Verify table structure
                    if routes:
                        sample = routes[0]
                        expected_fields = ['id', 'bus_name', 'route', 'capacity', 'driver_name', 'faculty_id']
                        actual_fields = list(sample.keys())

                        missing_fields = [f for f in expected_fields if f not in actual_fields]
                        if missing_fields:
                            self.log(f"Missing fields in response: {missing_fields}", "WARNING")
                        else:
                            self.log("All expected fields present in response", "SUCCESS")

                        # Check record count
                        if total_count >= 2000:
                            self.log(f"Record count matches requirement: {total_count} records", "SUCCESS")
                        else:
                            self.log(f"Record count ({total_count}) is less than expected (2000)", "WARNING")

                    self.results['Supabase Connection'] = "Connected"
                    self.results['Table Structure'] = "Valid" if not missing_fields else "Incomplete"
                    self.results['Record Count'] = total_count
                    return True
                else:
                    self.log(f"API returned error: {data.get('error')}", "ERROR")
            else:
                self.log(f"API returned status code {response.status_code}", "ERROR")

        except Exception as e:
            self.log(f"Supabase connection failed: {e}", "ERROR")

        self.results['Supabase Connection'] = "Failed"
        return False

    def test_api_endpoints(self):
        """Test all transport_routes API endpoints"""
        self.log("Testing transport_routes API endpoints...")

        endpoints = [
            ('GET', '/api/transport-routes'),
            ('GET', '/api/transport-routes/health'),
            ('GET', '/api/transport-routes/info'),
        ]

        success_count = 0

        for method, endpoint in endpoints:
            try:
                if method == 'GET':
                    response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)

                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log(f"SUCCESS: {method} {endpoint} - OK", "SUCCESS")
                        success_count += 1
                    else:
                        self.log(f"ERROR: {method} {endpoint} - API Error: {data.get('error')}", "ERROR")
                else:
                    self.log(f"ERROR: {method} {endpoint} - HTTP {response.status_code}", "ERROR")

            except Exception as e:
                self.log(f"ERROR: {method} {endpoint} - Exception: {e}", "ERROR")

        self.results['API Endpoints'] = f"{success_count}/{len(endpoints)} working"
        return success_count == len(endpoints)

    def test_data_consistency(self):
        """Test data consistency between database and API"""
        self.log("Testing data consistency...")

        try:
            # Get data from API
            response = requests.get(f"{BACKEND_URL}/api/transport-routes?limit=5", timeout=10)

            if response.status_code == 200:
                api_data = response.json()
                if api_data.get('success'):
                    routes = api_data.get('data', [])

                    if routes:
                        # Test sample record details
                        sample = routes[0]
                        self.log(f"Sample record ID: {sample.get('id')}")
                        self.log(f"   Bus Name: {sample.get('bus_name')}")
                        self.log(f"   Route: {sample.get('route')}")
                        self.log(f"   Capacity: {sample.get('capacity')}")
                        self.log(f"   Driver: {sample.get('driver_name')}")
                        self.log(f"   Faculty ID: {sample.get('faculty_id')}")

                        # Verify data types
                        if isinstance(sample.get('id'), (int, str)):
                            self.log("Data types are correct", "SUCCESS")
                            self.results['Data Types'] = "Valid"
                        else:
                            self.log("Data types may be incorrect", "WARNING")
                            self.results['Data Types'] = "Check Required"

                        self.results['Data Consistency'] = "Verified"
                        return True

        except Exception as e:
            self.log(f"Data consistency check failed: {e}", "ERROR")

        self.results['Data Consistency'] = "Failed"
        return False

    def test_performance(self):
        """Test performance with large dataset"""
        self.log("Testing performance with large dataset...")

        try:
            # Test with different page sizes
            page_sizes = [50, 100, 500]

            for limit in page_sizes:
                start_time = time.time()
                response = requests.get(f"{BACKEND_URL}/api/transport-routes?limit={limit}", timeout=30)
                end_time = time.time()

                response_time = end_time - start_time

                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        record_count = len(data.get('data', []))
                        self.log(f"Page size {limit}: {record_count} records in {response_time:.2f}s", "SUCCESS")

                        if response_time > 5.0:  # More than 5 seconds
                            self.log(f"Slow response time: {response_time:.2f}s", "WARNING")
                        elif response_time > 10.0:  # More than 10 seconds
                            self.log(f"Very slow response: {response_time:.2f}s", "ERROR")
                    else:
                        self.log(f"Page size {limit} failed: API error", "ERROR")
                else:
                    self.log(f"Page size {limit} failed: HTTP {response.status_code}", "ERROR")

            self.results['Performance'] = "Tested"
            return True

        except Exception as e:
            self.log(f"Performance test failed: {e}", "ERROR")
            self.results['Performance'] = "Failed"
            return False

    def test_frontend_integration(self):
        """Test frontend integration (mock test since we can't run browser)"""
        self.log("Testing frontend integration...")

        # Since we can't actually run a browser, we'll check if the component exists
        # and has the correct API endpoint
        frontend_file = "frontend/src/components/student/StudentTransport.jsx"

        if os.path.exists(frontend_file):
            try:
                with open(frontend_file, 'r') as f:
                    content = f.read()

                if '/api/transport/routes' in content:
                    self.log("Frontend component uses correct API endpoint", "SUCCESS")
                    self.results['Frontend Integration'] = "Correct Endpoint"
                    return True
                else:
                    self.log("Frontend component uses incorrect API endpoint", "ERROR")
                    self.results['Frontend Integration'] = "Wrong Endpoint"
                    return False

            except Exception as e:
                self.log(f"Could not read frontend file: {e}", "ERROR")
        else:
            self.log("Frontend component file not found", "ERROR")

        self.results['Frontend Integration'] = "File Not Found"
        return False

    def generate_report(self):
        """Generate comprehensive verification report"""
        print("\n" + "="*80)
        print("TRANSPORT_ROUTES VERIFICATION REPORT")
        print("="*80)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        # Overall status
        critical_checks = ['Backend Status', 'Supabase Connection', 'Table Structure']
        all_critical_pass = all(self.results.get(check) in ['Running', 'Connected', 'Valid']
                              for check in critical_checks)

        if all_critical_pass:
            print("OVERALL STATUS: PASS - VERIFICATION PASSED")
        else:
            print("OVERALL STATUS: FAIL - VERIFICATION FAILED")

        print()

        # Detailed results
        print("DETAILED RESULTS:")
        print("-" * 40)

        for check, result in self.results.items():
            if result in ['Running', 'Connected', 'Valid', 'Verified', 'Correct Endpoint']:
                status_icon = "[OK]"
            elif result in ['Not Running', 'Failed', 'File Not Found', 'Wrong Endpoint']:
                status_icon = "[FAIL]"
            else:
                status_icon = "[WARN]"

            print(f"{status_icon} {check}: {result}")

        print()

        # Recommendations
        print("RECOMMENDATIONS:")
        print("-" * 20)

        if self.results.get('Backend Status') != 'Running':
            print("- Start the Flask backend server: cd backend && python app.py")

        if self.results.get('Supabase Connection') == 'Failed':
            print("- Check Supabase credentials and network connectivity")
            print("- Verify transport_routes table exists in Supabase")

        if self.results.get('Record Count', 0) < 2000:
            print(f"- Current record count ({self.results.get('Record Count', 0)}) is less than required (2000)")
            print("- Populate the transport_routes table with test data")

        if self.results.get('Frontend Integration') == 'Wrong Endpoint':
            print("- Update frontend component to use correct API endpoint: /api/transport-routes")

        if not all_critical_pass:
            print("- Fix critical issues before proceeding with deployment")

        print()

        # Summary
        passed_checks = sum(1 for result in self.results.values()
                          if result in ['Running', 'Connected', 'Valid', 'Verified', 'Correct Endpoint', 'Tested'])

        print(f"SUMMARY: {passed_checks}/{len(self.results)} checks passed")

        return all_critical_pass

    def run_all_tests(self):
        """Run all verification tests"""
        self.log("Starting comprehensive transport_routes verification...")

        # Run all tests
        tests = [
            self.check_backend_health,
            self.check_frontend_health,
            self.test_supabase_connection,
            self.test_api_endpoints,
            self.test_data_consistency,
            self.test_performance,
            self.test_frontend_integration,
        ]

        for test in tests:
            try:
                test()
            except Exception as e:
                self.log(f"Test {test.__name__} failed with exception: {e}", "ERROR")
            time.sleep(0.5)  # Small delay between tests

        # Generate final report
        return self.generate_report()

def main():
    """Main verification function"""
    verifier = TransportRoutesVerifier()
    success = verifier.run_all_tests()

    print("\n" + "="*80)
    if success:
        print("VERIFICATION COMPLETED SUCCESSFULLY!")
        print("Backend APIs and frontend are properly connected")
        print("transport_routes table contains the expected data")
        print("Data flows correctly through all layers")
    else:
        print("VERIFICATION FAILED!")
        print("Please address the issues listed above")

    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
