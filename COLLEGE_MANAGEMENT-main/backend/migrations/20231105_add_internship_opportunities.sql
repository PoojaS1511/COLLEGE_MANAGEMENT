-- Create internship_opportunities table
CREATE TABLE IF NOT EXISTS internship_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Full-time, Part-time, Remote, etc.
    duration VARCHAR(100), -- e.g., "3 months"
    min_stipend NUMERIC(10, 2),
    max_stipend NUMERIC(10, 2),
    is_unpaid BOOLEAN DEFAULT FALSE,
    apply_url TEXT,
    source VARCHAR(100), -- e.g., "Internshala", "The Muse"
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_internship_opportunities_company ON internship_opportunities(company);
CREATE INDEX IF NOT EXISTS idx_internship_opportunities_location ON internship_opportunities(location);
CREATE INDEX IF NOT EXISTS idx_internship_opportunities_type ON internship_opportunities(type);
CREATE INDEX IF NOT EXISTS idx_internship_opportunities_posted_date ON internship_opportunities(posted_date);

-- Add comments for better documentation
COMMENT ON TABLE internship_opportunities IS 'Stores internship opportunities from various sources';
COMMENT ON COLUMN internship_opportunities.min_stipend IS 'Minimum monthly stipend in local currency';
COMMENT ON COLUMN internship_opportunities.max_stipend IS 'Maximum monthly stipend in local currency';
COMMENT ON COLUMN internship_opportunities.is_unpaid IS 'Flag to indicate if this is an unpaid internship';
COMMENT ON COLUMN internship_opportunities.is_active IS 'Flag to mark if the opportunity is still available';

-- Add sample data (optional)
INSERT INTO internship_opportunities 
(title, company, location, type, duration, min_stipend, max_stipend, is_unpaid, source, description, deadline, posted_date)
VALUES
('Software Development Intern', 'Tech Corp', 'Remote', 'Full-time', '3 months', 15000.00, 20000.00, FALSE, 'Internshala', 'Looking for software development interns with Python experience', NOW() + INTERVAL '30 days', NOW() - INTERVAL '2 days'),
('Marketing Intern', 'Marketing Pro', 'Bangalore', 'Part-time', '6 months', 5000.00, 8000.00, FALSE, 'LinkedIn', 'Part-time marketing internship for college students', NOW() + INTERVAL '45 days', NOW() - INTERVAL '1 day');
