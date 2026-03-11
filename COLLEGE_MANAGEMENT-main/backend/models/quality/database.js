// Quality & Accreditation Management Database Schema
// This file contains the SQL schema for all quality management tables

const createQualityTables = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'faculty', 'staff', 'student')),
    department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty table for faculty performance data
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    performance_rating DECIMAL(5,2) DEFAULT 0 CHECK (performance_rating >= 0 AND performance_rating <= 100),
    research_output INTEGER DEFAULT 0,
    student_feedback_score DECIMAL(5,2) DEFAULT 0 CHECK (student_feedback_score >= 0 AND student_feedback_score <= 100),
    teaching_hours INTEGER DEFAULT 0,
    publications INTEGER DEFAULT 0,
    projects INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audits table for audit records
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    department VARCHAR(255) NOT NULL,
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('internal', 'external')),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    auditor VARCHAR(255) NOT NULL,
    findings TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grievances table for grievance reports
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    submitted_by UUID REFERENCES users(id),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('student', 'faculty', 'staff')),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_date TIMESTAMP WITH TIME ZONE,
    resolution_time_hours INTEGER,
    ai_classification VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies table for policy compliance
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    compliance_status VARCHAR(50) NOT NULL DEFAULT 'pending_review' CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_review')),
    due_date DATE NOT NULL,
    last_reviewed DATE NOT NULL,
    next_review_date DATE NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    compliance_score DECIMAL(5,2) DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    documents TEXT[], -- Array of document URLs/paths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation reports table
CREATE TABLE IF NOT EXISTS accreditation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accreditation_body VARCHAR(50) NOT NULL CHECK (accreditation_body IN ('NAAC', 'NBA', 'Other')),
    academic_year VARCHAR(20) NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    criteria_scores JSONB NOT NULL, -- JSON object for criteria-wise scores
    department_scores JSONB NOT NULL, -- JSON object for department-wise scores
    readiness_level VARCHAR(50) NOT NULL CHECK (readiness_level IN ('excellent', 'good', 'average', 'poor')),
    recommendations TEXT[], -- Array of recommendations
    strengths TEXT[], -- Array of strengths
    weaknesses TEXT[], -- Array of weaknesses
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_audits_department ON audits(department);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_policies_department ON policies(department);
CREATE INDEX IF NOT EXISTS idx_policies_compliance_status ON policies(compliance_status);
CREATE INDEX IF NOT EXISTS idx_accreditation_reports_academic_year ON accreditation_reports(academic_year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faculty_updated_at ON faculty;
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audits_updated_at ON audits;
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_grievances_updated_at ON grievances;
CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON grievances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accreditation_reports_updated_at ON accreditation_reports;
CREATE TRIGGER update_accreditation_reports_updated_at BEFORE UPDATE ON accreditation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (email, password, name, role, department) VALUES
('admin@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'Administration'),
('john.faculty@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', 'faculty', 'Computer Science'),
('jane.staff@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Doe', 'staff', 'Quality Assurance'),
('student@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Student User', 'student', 'Computer Science')
ON CONFLICT (email) DO NOTHING;

-- Insert sample faculty data
INSERT INTO faculty (employee_id, name, email, department, designation, performance_rating, research_output, student_feedback_score, teaching_hours, publications, projects) VALUES
('EMP001', 'Dr. John Smith', 'john.faculty@university.edu', 'Computer Science', 'Professor', 85.5, 12, 88.2, 20, 8, 3),
('EMP002', 'Dr. Sarah Johnson', 'sarah.j@university.edu', 'Computer Science', 'Associate Professor', 78.3, 8, 82.1, 18, 5, 2),
('EMP003', 'Dr. Michael Brown', 'michael.b@university.edu', 'Electrical Engineering', 'Professor', 92.1, 15, 91.5, 22, 12, 5)
ON CONFLICT (email) DO NOTHING;

-- Insert sample audit data
INSERT INTO audits (title, department, audit_type, scheduled_date, status, compliance_score, auditor, findings, recommendations) VALUES
('Quality Assurance Audit - Computer Science', 'Computer Science', 'internal', CURRENT_DATE + INTERVAL '7 days', 'pending', NULL, 'Dr. Quality Lead', NULL, NULL),
('Infrastructure Audit - Electrical Engineering', 'Electrical Engineering', 'external', CURRENT_DATE - INTERVAL '10 days', 'completed', 85.7, 'External Auditor', 'Lab equipment needs upgrade', 'Allocate budget for equipment upgrade'),
('Academic Standards Audit', 'Computer Science', 'internal', CURRENT_DATE + INTERVAL '14 days', 'in_progress', NULL, 'Internal Audit Team', 'Some curriculum gaps identified', 'Update curriculum as per industry standards')
ON CONFLICT DO NOTHING;

-- Insert sample grievance data
INSERT INTO grievances (title, description, category, priority, status, submitted_by, user_type, submitted_date) VALUES
('Lab Equipment Issue', 'Computers in Lab 201 are not working properly', 'Infrastructure', 'medium', 'pending', (SELECT id FROM users WHERE email = 'student@university.edu'), 'student', CURRENT_DATE - INTERVAL '2 days'),
('Course Registration Problem', 'Unable to register for advanced courses', 'Academic', 'high', 'in_progress', (SELECT id FROM users WHERE email = 'student@university.edu'), 'student', CURRENT_DATE - INTERVAL '5 days'),
('Research Funding Delay', 'Research grant approval is taking too long', 'Administrative', 'medium', 'resolved', (SELECT id FROM users WHERE email = 'john.faculty@university.edu'), 'faculty', CURRENT_DATE - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert sample policy data
INSERT INTO policies (title, description, category, department, due_date, last_reviewed, next_review_date, responsible_person, compliance_score) VALUES
('Academic Integrity Policy', 'Policy regarding academic honesty and plagiarism prevention', 'Academic', 'Computer Science', CURRENT_DATE + INTERVAL '90 days', CURRENT_DATE - INTERVAL '275 days', CURRENT_DATE + INTERVAL '90 days', 'Dr. John Smith', 92.5),
('Research Ethics Policy', 'Guidelines for ethical research conduct', 'Research', 'All Departments', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE - INTERVAL '305 days', CURRENT_DATE + INTERVAL '60 days', 'Research Committee', 88.3),
('Student Conduct Policy', 'Rules and regulations for student behavior', 'Student Affairs', 'All Departments', CURRENT_DATE + INTERVAL '120 days', CURRENT_DATE - INTERVAL '245 days', CURRENT_DATE + INTERVAL '120 days', 'Student Affairs Office', 95.1)
ON CONFLICT DO NOTHING;

-- Insert sample accreditation report
INSERT INTO accreditation_reports (accreditation_body, academic_year, overall_score, criteria_scores, department_scores, readiness_level, recommendations, strengths, weaknesses, status) VALUES
('NAAC', '2023-2024', 82.5, 
'{"Curriculum": 85, "Teaching-Learning": 80, "Research": 78, "Infrastructure": 88, "Student Support": 82, "Governance": 85, "Innovative Practices": 80}',
'{"Computer Science": 85, "Electrical Engineering": 80, "Mechanical Engineering": 82}',
'good',
ARRAY['Improve research output', 'Enhance industry collaboration', 'Upgrade laboratory facilities'],
ARRAY['Strong faculty performance', 'Good infrastructure', 'Effective governance'],
ARRAY['Limited industry interaction', 'Need more research publications', 'Curriculum needs regular updates'],
'submitted')
ON CONFLICT DO NOTHING;
`;

module.exports = { createQualityTables };
