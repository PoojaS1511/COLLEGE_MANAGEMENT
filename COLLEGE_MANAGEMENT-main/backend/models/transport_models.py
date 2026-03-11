"""
Transport Models for ST College Transport Management System
"""

import sqlite3
import json
from datetime import datetime, date
from typing import List, Dict, Optional, Any
import os

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'student_management.db')

class TransportModel:
    """Base model for transport operations"""
    
    def __init__(self):
        self.db_path = DB_PATH
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def dict_from_row(self, row) -> Dict:
        """Convert sqlite3.Row to dictionary"""
        return dict(row) if row else None

class TransportStudent(TransportModel):
    """Transport Student Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport students"""
        conn = self.get_connection()
        try:
            query = "SELECT * FROM transport_students"
            params = []
            
            if filters:
                conditions = []
                if filters.get('route_id'):
                    conditions.append("route_id = ?")
                    params.append(filters['route_id'])
                if filters.get('status'):
                    conditions.append("status = ?")
                    params.append(filters['status'])
                if filters.get('fee_status'):
                    conditions.append("fee_status = ?")
                    params.append(filters['fee_status'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY name"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def get_by_id(self, student_id: str) -> Optional[Dict]:
        """Get student by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM transport_students WHERE student_id = ?", 
                (student_id,)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create new transport student"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO transport_students 
                (student_id, name, email, phone, address, route_id, route_name, 
                 pickup_point, status, fee_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['student_id'], data['name'], data['email'], data.get('phone'),
                data.get('address'), data.get('route_id'), data.get('route_name'),
                data.get('pickup_point'), data.get('status', 'Active'),
                data.get('fee_status', 'Pending')
            ))
            conn.commit()
            
            # Return created student
            return self.get_by_id(data['student_id'])
        except sqlite3.IntegrityError as e:
            raise Exception(f"Student with ID {data['student_id']} already exists")
        finally:
            conn.close()
    
    def update(self, student_id: str, data: Dict) -> Dict:
        """Update transport student"""
        conn = self.get_connection()
        try:
            # Build dynamic update query
            update_fields = []
            params = []
            
            for field in ['name', 'email', 'phone', 'address', 'route_id', 
                         'route_name', 'pickup_point', 'status', 'fee_status']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if update_fields:
                params.append(student_id)
                query = f"UPDATE transport_students SET {', '.join(update_fields)} WHERE student_id = ?"
                conn.execute(query, params)
                conn.commit()
            
            return self.get_by_id(student_id)
        finally:
            conn.close()
    
    def delete(self, student_id: str) -> bool:
        """Delete transport student"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "DELETE FROM transport_students WHERE student_id = ?", 
                (student_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

class TransportFaculty(TransportModel):
    """Transport Faculty Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport faculty"""
        conn = self.get_connection()
        try:
            query = "SELECT id, faculty_id, name, email, phone as phone_number, department, route_id, route_name, status, created_at, updated_at FROM transport_faculty"
            params = []
            
            if filters:
                conditions = []
                if filters.get('route_id'):
                    conditions.append("route_id = ?")
                    params.append(filters['route_id'])
                if filters.get('status'):
                    conditions.append("status = ?")
                    params.append(filters['status'])
                if filters.get('department'):
                    conditions.append("department = ?")
                    params.append(filters['department'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY name"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def get_by_id(self, faculty_id: str) -> Optional[Dict]:
        """Get faculty by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT id, faculty_id, name, email, phone as phone_number, department, route_id, route_name, status, created_at, updated_at FROM transport_faculty WHERE faculty_id = ?", 
                (faculty_id,)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create new transport faculty"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO transport_faculty 
                (faculty_id, name, email, phone, department, route_id, route_name, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['faculty_id'], data['name'], data['email'], data.get('phone'),
                data.get('department'), data.get('route_id'), data.get('route_name'),
                data.get('status', 'Active')
            ))
            conn.commit()
            
            return self.get_by_id(data['faculty_id'])
        except sqlite3.IntegrityError as e:
            raise Exception(f"Faculty with ID {data['faculty_id']} already exists")
        finally:
            conn.close()
    
    def update(self, faculty_id: str, data: Dict) -> Dict:
        """Update transport faculty"""
        conn = self.get_connection()
        try:
            update_fields = []
            params = []
            
            for field in ['name', 'email', 'phone', 'department', 'route_id', 
                         'route_name', 'status']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if update_fields:
                params.append(faculty_id)
                query = f"UPDATE transport_faculty SET {', '.join(update_fields)} WHERE faculty_id = ?"
                conn.execute(query, params)
                conn.commit()
            
            return self.get_by_id(faculty_id)
        finally:
            conn.close()
    
    def delete(self, faculty_id: str) -> bool:
        """Delete transport faculty"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "DELETE FROM transport_faculty WHERE faculty_id = ?", 
                (faculty_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

class Bus(TransportModel):
    """Bus Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all buses"""
        conn = self.get_connection()
        try:
            query = "SELECT * FROM buses"
            params = []
            
            if filters:
                conditions = []
                if filters.get('route_id'):
                    conditions.append("route_id = ?")
                    params.append(filters['route_id'])
                if filters.get('status'):
                    conditions.append("status = ?")
                    params.append(filters['status'])
                if filters.get('driver_id'):
                    conditions.append("driver_id = ?")
                    params.append(filters['driver_id'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY bus_number"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def get_by_id(self, bus_id: int) -> Optional[Dict]:
        """Get bus by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM buses WHERE id = ?", 
                (bus_id,)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create new bus"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO buses 
                (bus_number, route_id, route_name, capacity, driver_id, driver_name, 
                 status, last_service, next_service)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['bus_number'], data.get('route_id'), data.get('route_name'),
                data['capacity'], data.get('driver_id'), data.get('driver_name'),
                data.get('status', 'Active'), data.get('last_service'), data.get('next_service')
            ))
            conn.commit()
            
            return self.get_by_id(cursor.lastrowid)
        except sqlite3.IntegrityError as e:
            raise Exception(f"Bus with number {data['bus_number']} already exists")
        finally:
            conn.close()
    
    def update(self, bus_id: int, data: Dict) -> Dict:
        """Update bus"""
        conn = self.get_connection()
        try:
            update_fields = []
            params = []
            
            for field in ['bus_number', 'route_id', 'route_name', 'capacity', 
                         'driver_id', 'driver_name', 'status', 'last_service', 'next_service']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if update_fields:
                params.append(bus_id)
                query = f"UPDATE buses SET {', '.join(update_fields)} WHERE id = ?"
                conn.execute(query, params)
                conn.commit()
            
            return self.get_by_id(bus_id)
        finally:
            conn.close()
    
    def delete(self, bus_id: int) -> bool:
        """Delete bus"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "DELETE FROM buses WHERE id = ?", 
                (bus_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

class Driver(TransportModel):
    """Driver Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all drivers"""
        conn = self.get_connection()
        try:
            query = "SELECT * FROM drivers"
            params = []
            
            if filters:
                conditions = []
                if filters.get('status'):
                    conditions.append("status = ?")
                    params.append(filters['status'])
                if filters.get('shift'):
                    conditions.append("shift = ?")
                    params.append(filters['shift'])
                if filters.get('assigned_bus'):
                    conditions.append("assigned_bus = ?")
                    params.append(filters['assigned_bus'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY name"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def get_by_id(self, driver_id: str) -> Optional[Dict]:
        """Get driver by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM drivers WHERE driver_id = ?", 
                (driver_id,)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create new driver"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO drivers 
                (driver_id, name, phone, license_number, license_expiry, blood_group,
                 emergency_contact, experience_years, shift, working_hours, 
                 assigned_bus, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['driver_id'], data['name'], data['phone'], data['license_number'],
                data['license_expiry'], data.get('blood_group'), data.get('emergency_contact'),
                data.get('experience_years', 0), data.get('shift', 'Morning'),
                data.get('working_hours', '8 hours'), data.get('assigned_bus'),
                data.get('status', 'Active')
            ))
            conn.commit()
            
            return self.get_by_id(data['driver_id'])
        except sqlite3.IntegrityError as e:
            raise Exception(f"Driver with ID {data['driver_id']} already exists")
        finally:
            conn.close()
    
    def update(self, driver_id: str, data: Dict) -> Dict:
        """Update driver"""
        conn = self.get_connection()
        try:
            update_fields = []
            params = []
            
            for field in ['name', 'phone', 'license_number', 'license_expiry', 'blood_group',
                         'emergency_contact', 'experience_years', 'shift', 'working_hours',
                         'assigned_bus', 'status']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if update_fields:
                params.append(driver_id)
                query = f"UPDATE drivers SET {', '.join(update_fields)} WHERE driver_id = ?"
                conn.execute(query, params)
                conn.commit()
            
            return self.get_by_id(driver_id)
        finally:
            conn.close()
    
    def delete(self, driver_id: str) -> bool:
        """Delete driver"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "DELETE FROM drivers WHERE driver_id = ?", 
                (driver_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

class Route(TransportModel):
    """Route Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all routes"""
        conn = self.get_connection()
        try:
            query = "SELECT * FROM routes"
            params = []
            
            if filters:
                conditions = []
                if filters.get('status'):
                    conditions.append("status = ?")
                    params.append(filters['status'])
                if filters.get('assigned_bus'):
                    conditions.append("assigned_bus = ?")
                    params.append(filters['assigned_bus'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY route_id"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            
            # Parse JSON stops for each route
            routes = []
            for row in rows:
                route = self.dict_from_row(row)
                if route.get('stops'):
                    try:
                        route['stops'] = json.loads(route['stops'])
                    except:
                        route['stops'] = []
                routes.append(route)
            
            return routes
        finally:
            conn.close()
    
    def get_by_id(self, route_id: str) -> Optional[Dict]:
        """Get route by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM routes WHERE route_id = ?", 
                (route_id,)
            )
            row = cursor.fetchone()
            route = self.dict_from_row(row)
            if route and route.get('stops'):
                try:
                    route['stops'] = json.loads(route['stops'])
                except:
                    route['stops'] = []
            return route
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create new route"""
        conn = self.get_connection()
        try:
            # Convert stops to JSON
            stops_json = json.dumps(data.get('stops', []))
            
            cursor = conn.execute("""
                INSERT INTO routes 
                (route_id, route_name, stops, pickup_time, drop_time, total_students,
                 assigned_bus, assigned_driver, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['route_id'], data['route_name'], stops_json,
                data['pickup_time'], data['drop_time'], data.get('total_students', 0),
                data.get('assigned_bus'), data.get('assigned_driver'),
                data.get('status', 'Active')
            ))
            conn.commit()
            
            return self.get_by_id(data['route_id'])
        except sqlite3.IntegrityError as e:
            raise Exception(f"Route with ID {data['route_id']} already exists")
        finally:
            conn.close()
    
    def update(self, route_id: str, data: Dict) -> Dict:
        """Update route"""
        conn = self.get_connection()
        try:
            update_fields = []
            params = []
            
            for field in ['route_name', 'pickup_time', 'drop_time', 'total_students',
                         'assigned_bus', 'assigned_driver', 'status']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if 'stops' in data:
                update_fields.append("stops = ?")
                params.append(json.dumps(data['stops']))
            
            if update_fields:
                params.append(route_id)
                query = f"UPDATE routes SET {', '.join(update_fields)} WHERE route_id = ?"
                conn.execute(query, params)
                conn.commit()
            
            return self.get_by_id(route_id)
        finally:
            conn.close()
    
    def delete(self, route_id: str) -> bool:
        """Delete route"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "DELETE FROM routes WHERE route_id = ?", 
                (route_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

class TransportFee(TransportModel):
    """Transport Fee Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport fees"""
        conn = self.get_connection()
        try:
            query = "SELECT * FROM transport_fees"
            params = []
            
            if filters:
                conditions = []
                if filters.get('payment_status'):
                    conditions.append("payment_status = ?")
                    params.append(filters['payment_status'])
                if filters.get('route_id'):
                    conditions.append("route_id = ?")
                    params.append(filters['route_id'])
                if filters.get('student_id'):
                    conditions.append("student_id = ?")
                    params.append(filters['student_id'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY due_date"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def get_by_id(self, fee_id: int) -> Optional[Dict]:
        """Get fee by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM transport_fees WHERE id = ?", 
                (fee_id,)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create new transport fee"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO transport_fees 
                (student_id, student_name, amount, due_date, payment_status, 
                 payment_date, payment_mode, route_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['student_id'], data['student_name'], data.get('amount', 2500.00),
                data['due_date'], data.get('payment_status', 'Pending'),
                data.get('payment_date'), data.get('payment_mode'), data.get('route_id')
            ))
            conn.commit()
            
            return self.get_by_id(cursor.lastrowid)
        finally:
            conn.close()
    
    def update(self, fee_id: int, data: Dict) -> Dict:
        """Update transport fee"""
        conn = self.get_connection()
        try:
            update_fields = []
            params = []
            
            for field in ['student_name', 'amount', 'due_date', 'payment_status',
                         'payment_date', 'payment_mode', 'route_id']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    params.append(data[field])
            
            if update_fields:
                params.append(fee_id)
                query = f"UPDATE transport_fees SET {', '.join(update_fields)} WHERE id = ?"
                conn.execute(query, params)
                conn.commit()
            
            return self.get_by_id(fee_id)
        finally:
            conn.close()
    
    def delete(self, fee_id: int) -> bool:
        """Delete transport fee"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "DELETE FROM transport_fees WHERE id = ?", 
                (fee_id,)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

class TransportAttendance(TransportModel):
    """Transport Attendance Model"""
    
    def get_all(self, filters: Dict = None) -> List[Dict]:
        """Get all transport attendance records"""
        conn = self.get_connection()
        try:
            query = "SELECT * FROM transport_attendance"
            params = []
            
            if filters:
                conditions = []
                if filters.get('date'):
                    conditions.append("date = ?")
                    params.append(filters['date'])
                if filters.get('entity_type'):
                    conditions.append("entity_type = ?")
                    params.append(filters['entity_type'])
                if filters.get('entity_id'):
                    conditions.append("entity_id = ?")
                    params.append(filters['entity_id'])
                if filters.get('route_id'):
                    conditions.append("route_id = ?")
                    params.append(filters['route_id'])
                if filters.get('status'):
                    conditions.append("status = ?")
                    params.append(filters['status'])
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY date DESC, entity_type, entity_name"
            
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def create(self, data: Dict) -> Dict:
        """Create attendance record"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO transport_attendance 
                (date, entity_type, entity_id, entity_name, route_id, bus_number, status, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['date'], data['entity_type'], data['entity_id'], data['entity_name'],
                data.get('route_id'), data.get('bus_number'), data.get('status', 'Present'),
                data.get('remarks')
            ))
            conn.commit()
            
            return self.get_by_id(cursor.lastrowid)
        finally:
            conn.close()
    
    def get_by_id(self, attendance_id: int) -> Optional[Dict]:
        """Get attendance by ID"""
        conn = self.get_connection()
        try:
            cursor = conn.execute(
                "SELECT * FROM transport_attendance WHERE id = ?", 
                (attendance_id,)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()

class LiveLocation(TransportModel):
    """Live Location Model"""
    
    def get_all(self) -> List[Dict]:
        """Get all live locations"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                SELECT * FROM live_locations 
                ORDER BY last_update DESC
            """)
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def update_location(self, data: Dict) -> Dict:
        """Update bus location"""
        conn = self.get_connection()
        try:
            # Check if bus exists in live_locations
            cursor = conn.execute(
                "SELECT id FROM live_locations WHERE bus_id = ?", 
                (data['bus_id'],)
            )
            existing = cursor.fetchone()
            
            if existing:
                # Update existing record
                conn.execute("""
                    UPDATE live_locations 
                    SET latitude = ?, longitude = ?, speed = ?, status = ?, 
                        last_update = CURRENT_TIMESTAMP, driver_name = ?
                    WHERE bus_id = ?
                """, (
                    data['latitude'], data['longitude'], data.get('speed', 0),
                    data.get('status', 'Moving'), data.get('driver_name'), data['bus_id']
                ))
            else:
                # Insert new record
                conn.execute("""
                    INSERT INTO live_locations 
                    (bus_id, bus_number, route_id, latitude, longitude, speed, status, driver_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data['bus_id'], data['bus_number'], data.get('route_id'),
                    data['latitude'], data['longitude'], data.get('speed', 0),
                    data.get('status', 'Moving'), data.get('driver_name')
                ))
            
            conn.commit()
            
            # Return updated record
            cursor = conn.execute(
                "SELECT * FROM live_locations WHERE bus_id = ?", 
                (data['bus_id'],)
            )
            row = cursor.fetchone()
            return self.dict_from_row(row)
        finally:
            conn.close()

class TransportActivity(TransportModel):
    """Transport Activity Model"""
    
    def create(self, activity_type: str, message: str, user_id: str = None, metadata: Dict = None):
        """Create activity log"""
        conn = self.get_connection()
        try:
            conn.execute("""
                INSERT INTO transport_activities 
                (type, message, user_id, metadata)
                VALUES (?, ?, ?, ?)
            """, (
                activity_type, message, user_id, json.dumps(metadata) if metadata else None
            ))
            conn.commit()
        finally:
            conn.close()
    
    def get_recent(self, limit: int = 10) -> List[Dict]:
        """Get recent activities"""
        conn = self.get_connection()
        try:
            cursor = conn.execute("""
                SELECT * FROM transport_activities 
                ORDER BY time DESC 
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [self.dict_from_row(row) for row in rows]
        finally:
            conn.close()
