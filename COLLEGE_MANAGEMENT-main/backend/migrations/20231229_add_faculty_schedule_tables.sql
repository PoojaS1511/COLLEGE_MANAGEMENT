-- Create faculty_subject_assignments table
CREATE TABLE IF NOT EXISTS faculty_subject_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  academic_year VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(faculty_id, subject_id, course_id, academic_year, semester)
);

-- Create faculty_schedule table
CREATE TABLE IF NOT EXISTS faculty_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES faculty_subject_assignments(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_faculty_schedule_assignment ON faculty_schedule(assignment_id);
CREATE INDEX IF NOT EXISTS idx_faculty_schedule_day_time ON faculty_schedule(day_of_week, start_time, end_time);

-- Add comments
COMMENT ON TABLE faculty_subject_assignments IS 'Maps faculty members to subjects they teach';
COMMENT ON TABLE faculty_schedule IS 'Stores faculty teaching schedules';

-- Update the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_faculty_subject_assignments_updated_at
BEFORE UPDATE ON faculty_subject_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_schedule_updated_at
BEFORE UPDATE ON faculty_schedule
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
