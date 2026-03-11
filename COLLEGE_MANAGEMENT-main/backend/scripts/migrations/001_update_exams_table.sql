-- Drop existing constraints
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_course_id_fkey;

-- Rename existing table
ALTER TABLE exams RENAME TO old_exams;

-- Create new exams table with correct schema
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate data from old table to new table
-- Note: This is a basic migration - you'll need to adjust based on your actual data
INSERT INTO exams (
  id,
  name,
  course_id,
  exam_date,
  created_at,
  updated_at,
  -- Default values for new required fields
  description,
  subject_id,
  start_time,
  end_time,
  max_marks,
  passing_marks
)
SELECT 
  gen_random_uuid(),
  exam_type || ' Exam',
  course_id,
  exam_date,
  created_at,
  NOW(),
  'Migrated from old exams table',
  -- Default values - you'll need to set these appropriately
  (SELECT id FROM subjects LIMIT 1), -- Default subject ID
  '09:00:00', -- Default start time
  '12:00:00', -- Default end time
  100,        -- Default max marks
  35          -- Default passing marks
FROM old_exams;

-- Drop old table
-- DROP TABLE old_exams;

-- Create indexes
CREATE INDEX idx_exams_course_id ON exams(course_id);
CREATE INDEX idx_exams_subject_id ON exams(subject_id);
CREATE INDEX idx_exams_exam_date ON exams(exam_date);

-- Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" 
ON exams FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for admins only" 
ON exams FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Enable update for admins only" 
ON exams FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Enable delete for admins only" 
ON exams FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
