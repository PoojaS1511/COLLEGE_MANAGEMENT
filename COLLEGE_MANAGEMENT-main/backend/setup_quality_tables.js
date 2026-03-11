#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://qkaaoeismqnhjyikgkme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw';

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.error('❌ Supabase URL not configured. Please update your .env file.');
  process.exit(1);
}

if (!supabaseKey || supabaseKey.includes('placeholder')) {
  console.error('❌ Supabase Key not configured. Please update your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Quality tables schema
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
    documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation reports table
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
);

-- Create indexes
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
`;

async function setupTables() {
  try {
    console.log('🔧 Setting up Quality module database tables...');
    
    // Split the SQL into individual statements and execute them
    const statements = createQualityTables
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          // Try direct SQL if RPC fails
          const { error: directError } = await supabase
            .from('information_schema.tables')
            .select('table_name');
          
          if (directError) {
            console.warn('⚠️  Could not execute SQL directly. You may need to run the SQL manually in Supabase SQL Editor.');
            console.log('SQL to execute manually:');
            console.log(statement + ';');
          }
        }
      }
    }

    // Test if tables were created
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'faculty', 'audits', 'grievances', 'policies', 'accreditation_reports']);

    if (tableError) {
      console.error('❌ Error checking tables:', tableError);
    } else {
      const createdTables = tables?.map(t => t.table_name) || [];
      console.log(`✅ Successfully created ${createdTables.length} Quality module tables:`, createdTables);
      
      if (createdTables.length === 6) {
        console.log('🎉 All Quality module tables are ready!');
      } else {
        console.log('⚠️  Some tables may not have been created. Please check your Supabase SQL Editor.');
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to your Supabase project > SQL Editor');
    console.log('2. Copy and run the SQL from backend/models/quality/database.js');
    console.log('3. Ensure all 6 tables are created: users, faculty, audits, grievances, policies, accreditation_reports');
  }
}

setupTables();
