-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_uuid UUID NOT NULL REFERENCES students(student_uuid) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  subject_id UUID REFERENCES subjects(id),
  recorded_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_uuid, date, subject_id)
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_uuid UUID NOT NULL REFERENCES students(student_uuid) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(5,2),
  max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  grade VARCHAR(2),
  remarks TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_uuid, exam_id, subject_id)
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_uuid UUID NOT NULL REFERENCES students(student_uuid) ON DELETE CASCADE,
  fee_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial', 'waived')),
  payment_date DATE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  receipt_number VARCHAR(100),
  academic_year VARCHAR(20),
  semester VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create internships table
CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_uuid UUID NOT NULL REFERENCES students(student_uuid) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'in_progress', 'completed', 'rejected')),
  description TEXT,
  supervisor_name VARCHAR(255),
  supervisor_email VARCHAR(255),
  supervisor_phone VARCHAR(50),
  is_paid BOOLEAN DEFAULT false,
  stipend_amount DECIMAL(10,2),
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table if not exists
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_code VARCHAR(50) UNIQUE NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  course_id UUID REFERENCES courses(id),
  semester INT,
  credits INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_uuid, date);
CREATE INDEX IF NOT EXISTS idx_marks_student_subject ON marks(student_uuid, subject_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_status ON fees(student_uuid, status);
CREATE INDEX IF NOT EXISTS idx_internships_student_status ON internships(student_uuid, status);

-- Add comments for better documentation
COMMENT ON TABLE attendance IS 'Tracks student attendance records';
COMMENT ON TABLE marks IS 'Stores student marks for exams and assignments';
COMMENT ON TABLE fees IS 'Manages student fee payments and records';
COMMENT ON TABLE internships IS 'Tracks student internship applications and details';
COMMENT ON TABLE subjects IS 'Contains information about academic subjects';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marks_updated_at
BEFORE UPDATE ON marks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fees_updated_at
BEFORE UPDATE ON fees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at
BEFORE UPDATE ON internships
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
