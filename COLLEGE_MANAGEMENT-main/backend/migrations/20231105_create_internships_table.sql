-- Create the internships table
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Add index for faster lookups by student_id
CREATE INDEX IF NOT EXISTS idx_internships_student_id ON public.internships(student_id);

-- Add index for date-based queries
CREATE INDEX IF NOT EXISTS idx_internships_dates ON public.internships(start_date, end_date);

-- Add comments
COMMENT ON TABLE public.internships IS 'Stores student internship information';
COMMENT ON COLUMN public.internships.student_id IS 'Reference to the student';
COMMENT ON COLUMN public.internships.company_name IS 'Name of the company';
COMMENT ON COLUMN public.internships.position IS 'Position/title of the internship';
COMMENT ON COLUMN public.internships.description IS 'Detailed description of internship responsibilities';
COMMENT ON COLUMN public.internships.start_date IS 'Start date of the internship';
COMMENT ON COLUMN public.internships.end_date IS 'End date of the internship (NULL if ongoing)';
COMMENT ON COLUMN public.internships.is_current IS 'Flag indicating if this is the current/most recent internship';
