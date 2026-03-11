-- Add fee_per_semester column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS fee_per_semester DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing records with a default value if needed
UPDATE courses 
SET fee_per_semester = 0.00 
WHERE fee_per_semester IS NULL;
