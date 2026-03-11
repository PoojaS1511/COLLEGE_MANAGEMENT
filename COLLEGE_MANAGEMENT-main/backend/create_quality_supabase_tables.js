#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://qkaaoeismqnhjyikgkme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables one by one using individual SQL statements
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'faculty', 'staff', 'student')),
    department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

const createAuditsTable = `
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
);`;

const createGrievancesTable = `
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
);`;

const createPoliciesTable = `
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
    documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

const createAccreditationReportsTable = `
CREATE TABLE IF NOT EXISTS accreditation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accreditation_body VARCHAR(50) NOT NULL CHECK (accreditation_body IN ('NAAC', 'NBA', 'Other')),
    academic_year VARCHAR(20) NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    criteria_scores JSONB NOT NULL,
    department_scores JSONB NOT NULL,
    readiness_level VARCHAR(50) NOT NULL CHECK (readiness_level IN ('excellent', 'good', 'average', 'poor')),
    recommendations TEXT[],
    strengths TEXT[],
    weaknesses TEXT[],
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

// Insert sample data
const insertSampleData = `
-- Insert sample users
INSERT INTO users (email, password, name, role, department) VALUES
('admin@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'Administration'),
('john.faculty@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', 'faculty', 'Computer Science'),
('jane.staff@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Doe', 'staff', 'Quality Assurance'),
('student@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Student User', 'student', 'Computer Science')
ON CONFLICT (email) DO NOTHING;

-- Insert sample audits
INSERT INTO audits (title, department, audit_type, scheduled_date, status, compliance_score, auditor, findings, recommendations) VALUES
('Quality Assurance Audit - Computer Science', 'Computer Science', 'internal', CURRENT_DATE + INTERVAL '7 days', 'pending', NULL, 'Dr. Quality Lead', NULL, NULL),
('Infrastructure Audit - Electrical Engineering', 'Electrical Engineering', 'external', CURRENT_DATE - INTERVAL '10 days', 'completed', 85.7, 'External Auditor', 'Lab equipment needs upgrade', 'Allocate budget for equipment upgrade'),
('Academic Standards Audit', 'Computer Science', 'internal', CURRENT_DATE + INTERVAL '14 days', 'in_progress', NULL, 'Internal Audit Team', 'Some curriculum gaps identified', 'Update curriculum as per industry standards')
ON CONFLICT DO NOTHING;

-- Insert sample grievances
INSERT INTO grievances (title, description, category, priority, status, submitted_by, user_type, submitted_date) VALUES
('Lab Equipment Issue', 'Computers in Lab 201 are not working properly', 'Infrastructure', 'medium', 'pending', (SELECT id FROM users WHERE email = 'student@university.edu' LIMIT 1), 'student', CURRENT_DATE - INTERVAL '2 days'),
('Course Registration Problem', 'Unable to register for advanced courses', 'Academic', 'high', 'in_progress', (SELECT id FROM users WHERE email = 'student@university.edu' LIMIT 1), 'student', CURRENT_DATE - INTERVAL '5 days'),
('Research Funding Delay', 'Research grant approval is taking too long', 'Administrative', 'medium', 'resolved', (SELECT id FROM users WHERE email = 'john.faculty@university.edu' LIMIT 1), 'faculty', CURRENT_DATE - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert sample policies
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

async function setupQualityTables() {
  try {
    console.log('🔧 Setting up Quality Management tables in Supabase...');
    
    // Create tables
    const tables = [
      { name: 'users', sql: createUsersTable },
      { name: 'audits', sql: createAuditsTable },
      { name: 'grievances', sql: createGrievancesTable },
      { name: 'policies', sql: createPoliciesTable },
      { name: 'accreditation_reports', sql: createAccreditationReportsTable }
    ];

    for (const table of tables) {
      console.log(`\n📋 Creating ${table.name} table...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: table.sql });
        
        if (error) {
          console.log(`⚠️  RPC failed for ${table.name}. This is expected - the tables should be created manually.`);
          console.log(`📝 Manual SQL required for ${table.name}:`);
          console.log(table.sql);
        } else {
          console.log(`✅ ${table.name} table created successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Could not create ${table.name} table automatically.`);
      }
    }

    console.log('\n📊 Inserting sample data...');
    console.log('📝 Manual SQL required for sample data:');
    console.log(insertSampleData);

    console.log('\n🔍 Checking table status...');
    const tableNames = ['users', 'faculty', 'audits', 'grievances', 'policies', 'accreditation_reports'];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase.from(tableName).select('count');
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          const count = data[0]?.count || 0;
          console.log(`✅ ${tableName}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Table does not exist`);
      }
    }

    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('1. Go to your Supabase project: https://qkaaoeismqnhjyikgkme.supabase.co');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and execute the SQL statements shown above for each missing table');
    console.log('4. Run the sample data insertion script');
    console.log('5. Verify all tables are created with data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupQualityTables();
