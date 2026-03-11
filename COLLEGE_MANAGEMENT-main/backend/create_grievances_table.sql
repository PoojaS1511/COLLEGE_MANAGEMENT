-- SQL script to create the grievances table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.grievances (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    user_type VARCHAR(20) DEFAULT 'student',
    submitted_date DATE DEFAULT CURRENT_DATE,
    ai_classification VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON public.grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON public.grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievances_submitted_date ON public.grievances(submitted_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your auth requirements)
-- Allow authenticated users to read grievances
CREATE POLICY "Enable read access for authenticated users" ON public.grievances
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert grievances
CREATE POLICY "Enable insert for authenticated users" ON public.grievances
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own grievances (if user_id column exists)
-- For now, allow all authenticated users to update
CREATE POLICY "Enable update for authenticated users" ON public.grievances
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.grievances (title, description, category, priority, status, user_type, submitted_date, ai_classification) VALUES
('Classroom Maintenance Issue', 'AC not working in Room 201 for the past week', 'Infrastructure', 'medium', 'resolved', 'student', '2024-01-10', 'Infrastructure'),
('Course Material Delay', 'Data Structures course material not available on time', 'Academic', 'high', 'in_progress', 'student', '2024-01-15', 'Academic'),
('Library Hours Extension', 'Request to extend library hours during exam period', 'Administrative', 'low', 'pending', 'student', '2024-01-20', 'Administrative'),
('Faculty Feedback System', 'Online feedback system not working properly', 'Academic', 'medium', 'resolved', 'student', '2024-01-25', 'Academic'),
('Transportation Service', 'Bus route timing needs adjustment for morning classes', 'Transportation', 'medium', 'pending', 'student', '2024-02-01', 'Transportation'),
('Canteen Food Quality', 'Food quality in college canteen needs improvement', 'Facilities', 'low', 'in_progress', 'student', '2024-02-05', 'Facilities'),
('WiFi Connectivity Issues', 'Poor WiFi signal in certain areas of the campus', 'Infrastructure', 'high', 'pending', 'student', '2024-02-10', 'Infrastructure'),
('Examination Schedule Conflict', 'Two major exams scheduled on the same day', 'Academic', 'high', 'resolved', 'student', '2024-02-15', 'Academic');
