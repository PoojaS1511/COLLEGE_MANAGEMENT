-- SQL script to create transport tables in Supabase
-- Run this in your Supabase SQL Editor

-- 1. Create transport_buses table
CREATE TABLE IF NOT EXISTS transport_buses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    route_id VARCHAR(20),
    route_name VARCHAR(100),
    capacity INTEGER NOT NULL DEFAULT 50,
    driver_id VARCHAR(20),
    driver_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    last_service DATE,
    next_service DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create transport_drivers table
CREATE TABLE IF NOT EXISTS transport_drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    experience_years INTEGER DEFAULT 0,
    shift VARCHAR(20) DEFAULT 'Morning',
    working_hours VARCHAR(50) DEFAULT '8 hours',
    assigned_bus VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create transport_routes table
CREATE TABLE IF NOT EXISTS transport_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id VARCHAR(20) UNIQUE NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    stops JSONB DEFAULT '[]'::jsonb,
    pickup_time TIME NOT NULL,
    drop_time TIME NOT NULL,
    total_students INTEGER DEFAULT 0,
    assigned_bus VARCHAR(50),
    assigned_driver VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create transport_students table
CREATE TABLE IF NOT EXISTS transport_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    address TEXT,
    route_id VARCHAR(20),
    route_name VARCHAR(100),
    pickup_point VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    fee_status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create transport_faculty table
CREATE TABLE IF NOT EXISTS transport_faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(50),
    route_id VARCHAR(20),
    route_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create transport_attendance table
CREATE TABLE IF NOT EXISTS transport_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    entity_type VARCHAR(20) NOT NULL, -- 'Student' or 'Faculty'
    entity_id VARCHAR(20) NOT NULL,
    entity_name VARCHAR(100),
    route_id VARCHAR(20),
    bus_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Present',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create transport_live_locations table
CREATE TABLE IF NOT EXISTS transport_live_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_id VARCHAR(50) UNIQUE NOT NULL,
    bus_number VARCHAR(50),
    route_id VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed DECIMAL(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Stationary',
    driver_name VARCHAR(100),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create transport_activities table
CREATE TABLE IF NOT EXISTS transport_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    user_id VARCHAR(50),
    metadata JSONB,
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create transport_fee table
CREATE TABLE IF NOT EXISTS transport_fee (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    route_name VARCHAR(100),
    bus_no VARCHAR(50),
    fee_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    due_amount DECIMAL(10, 2) GENERATED ALWAYS AS (fee_amount - paid_amount) STORED,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    academic_year VARCHAR(20),
    payment_mode VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transport_buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_fee ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Simplified for development)
CREATE POLICY "Public Access" ON transport_buses FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_drivers FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_routes FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_students FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_faculty FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_attendance FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_live_locations FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_activities FOR ALL USING (true);
CREATE POLICY "Public Access" ON transport_fee FOR ALL USING (true);
