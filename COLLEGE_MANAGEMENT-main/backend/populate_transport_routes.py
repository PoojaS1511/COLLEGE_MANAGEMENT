#!/usr/bin/env python3
"""
Populate transport_routes table with sample data
"""

from supabase_client import get_supabase
import json
from datetime import datetime

def populate_transport_routes():
    """Populate transport_routes table with sample data"""
    try:
        supabase = get_supabase()
        print("Connected to Supabase")

        # Sample route data
        routes_data = [
            {
                'route_id': 'RT-01',
                'route_name': 'North City Route',
                'stops': [
                    {'name': 'College Campus', 'time': '07:30 AM', 'distance': '0 km'},
                    {'name': 'Bus Stop A', 'time': '07:35 AM', 'distance': '1 km'},
                    {'name': 'Bus Stop B', 'time': '07:45 AM', 'distance': '5 km'},
                    {'name': 'Terminal North', 'time': '08:00 AM', 'distance': '12 km'}
                ],
                'pickup_time': '07:30',
                'drop_time': '18:00',
                'total_students': 45,
                'assigned_bus': 'TN-09-AB-1234',
                'assigned_driver': 'DRV001',
                'status': 'Active'
            },
            {
                'route_id': 'RT-02',
                'route_name': 'South City Route',
                'stops': [
                    {'name': 'College Campus', 'time': '07:45 AM', 'distance': '0 km'},
                    {'name': 'Bus Stop C', 'time': '07:50 AM', 'distance': '2 km'},
                    {'name': 'Bus Stop D', 'time': '08:00 AM', 'distance': '7 km'},
                    {'name': 'Terminal South', 'time': '08:15 AM', 'distance': '18 km'}
                ],
                'pickup_time': '07:45',
                'drop_time': '18:15',
                'total_students': 38,
                'assigned_bus': 'TN-09-CD-5678',
                'assigned_driver': 'DRV002',
                'status': 'Active'
            },
            {
                'route_id': 'RT-03',
                'route_name': 'East City Route',
                'stops': [
                    {'name': 'College Campus', 'time': '08:00 AM', 'distance': '0 km'},
                    {'name': 'Bus Stop E', 'time': '08:05 AM', 'distance': '1.5 km'},
                    {'name': 'Bus Stop F', 'time': '08:15 AM', 'distance': '6 km'},
                    {'name': 'Terminal East', 'time': '08:30 AM', 'distance': '15 km'}
                ],
                'pickup_time': '08:00',
                'drop_time': '18:30',
                'total_students': 52,
                'assigned_bus': 'TN-09-EF-9012',
                'assigned_driver': 'DRV003',
                'status': 'Active'
            },
            {
                'route_id': 'RT-04',
                'route_name': 'West City Route',
                'stops': [
                    {'name': 'College Campus', 'time': '07:15 AM', 'distance': '0 km'},
                    {'name': 'Bus Stop G', 'time': '07:20 AM', 'distance': '1 km'},
                    {'name': 'Bus Stop H', 'time': '07:30 AM', 'distance': '4 km'},
                    {'name': 'Terminal West', 'time': '07:45 AM', 'distance': '10 km'}
                ],
                'pickup_time': '07:15',
                'drop_time': '17:45',
                'total_students': 29,
                'assigned_bus': 'TN-09-GH-3456',
                'assigned_driver': 'DRV004',
                'status': 'Active'
            },
            {
                'route_id': 'RT-05',
                'route_name': 'Central Route',
                'stops': [
                    {'name': 'College Campus', 'time': '08:15 AM', 'distance': '0 km'},
                    {'name': 'Bus Stop I', 'time': '08:20 AM', 'distance': '0.8 km'},
                    {'name': 'Bus Stop J', 'time': '08:25 AM', 'distance': '2 km'},
                    {'name': 'Central Terminal', 'time': '08:35 AM', 'distance': '5 km'}
                ],
                'pickup_time': '08:15',
                'drop_time': '18:35',
                'total_students': 67,
                'assigned_bus': 'TN-09-IJ-7890',
                'assigned_driver': 'DRV005',
                'status': 'Active'
            }
        ]

        # Insert routes
        inserted_count = 0
        for route in routes_data:
            try:
                # Check if route already exists
                existing = supabase.table('transport_routes').select('route_id').eq('route_id', route['route_id']).execute()
                if existing.data:
                    print(f"Route {route['route_id']} already exists, skipping...")
                    continue

                # Convert stops to JSON string for Supabase
                route_data = route.copy()
                route_data['stops'] = json.dumps(route['stops'])

                supabase.table('transport_routes').insert(route_data).execute()
                inserted_count += 1
                print(f"Inserted route: {route['route_name']}")
            except Exception as e:
                print(f"Failed to insert route {route['route_id']}: {str(e)}")

        print(f"\nSuccessfully inserted {inserted_count} routes")

        # Verify the data
        result = supabase.table('transport_routes').select('*').execute()
        print(f"Total routes in database: {len(result.data)}")

        return True

    except Exception as e:
        print(f"Error populating transport routes: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Populating transport_routes table...")
    success = populate_transport_routes()
    if success:
        print("✅ Transport routes populated successfully!")
    else:
        print("❌ Failed to populate transport routes")
