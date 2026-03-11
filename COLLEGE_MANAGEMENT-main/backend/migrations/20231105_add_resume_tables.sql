-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    metadata JSONB,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_active_resume UNIQUE (student_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create resume_analytics table
CREATE TABLE IF NOT EXISTS resume_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL,
    student_id UUID NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    skills JSONB,
    experience_years NUMERIC(4,1),
    education JSONB,
    certifications TEXT[],
    languages JSONB,
    score_overall NUMERIC(5,2),
    score_ats_compatibility NUMERIC(5,2),
    score_readability NUMERIC(5,2),
    score_impact NUMERIC(5,2),
    score_skills NUMERIC(5,2),
    analysis_summary TEXT,
    raw_analysis JSONB,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create resume_recommendations table
CREATE TABLE IF NOT EXISTS resume_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL,
    student_id UUID NOT NULL,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recommendations JSONB,
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_student_id ON resumes(student_id);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_resume_id ON resume_analytics(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_student_id ON resume_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_resume_recommendations_resume_id ON resume_recommendations(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_recommendations_student_id ON resume_recommendations(student_id);

-- Add comments for documentation
COMMENT ON TABLE resumes IS 'Stores information about student resumes';
COMMENT ON TABLE resume_analytics IS 'Stores analysis results for resumes';
COMMENT ON TABLE resume_recommendations IS 'Stores recommendations for improving resumes';

-- Add sample data (optional)
-- INSERT INTO resumes (student_id, file_name, file_path, file_url, file_size, file_type)
-- VALUES 
--     ('550e8400-e29b-41d4-a716-446655440002', 'john_doe_resume.pdf', '/uploads/resumes/john_doe.pdf', 'https://example.com/resumes/john_doe.pdf', 1024, 'application/pdf');

-- INSERT INTO resume_analytics (resume_id, student_id, skills, experience_years, score_overall, analysis_summary)
-- VALUES 
--     ((SELECT id FROM resumes WHERE student_id = '550e8400-e29b-41d4-a716-446655440002'), 
--      '550e8400-e29b-41d4-a716-446655440002',
--      '{"programming": ["Python", "JavaScript"], "tools": ["Git", "Docker"]}',
--      2.5, 85.5, 'Strong technical skills with room for improvement in leadership experience.');

-- INSERT INTO resume_recommendations (resume_id, student_id, recommendations, priority, status)
-- VALUES 
--     ((SELECT id FROM resumes WHERE student_id = '550e8400-e29b-41d4-a716-446655440002'),
--      '550e8400-e29b-41d4-a716-446655440002',
--      '{"Add more quantifiable achievements": "Include specific metrics and results in your experience section.",
--        "Improve action verbs": "Start bullet points with strong action verbs like \"Developed\", \"Led\", \"Implemented\"."}',
--      'high', 'pending');
