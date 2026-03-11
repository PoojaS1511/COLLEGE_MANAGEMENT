# Quality Module Database Setup Instructions

## Problem Identified
The Quality module is not storing data in the database because Supabase credentials are missing from the `.env` file.

## Solution Steps

### 1. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Project Settings > API
3. Copy the following:
   - Project URL (looks like: https://xxxxxxxx.supabase.co)
   - Service Role Key (starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

### 2. Update .env File
Replace the placeholder values in `backend/.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Configuration
VITE_API_BASE_URL=http://localhost
PORT=5001
```

### 3. Create Database Tables
Run the following to create Quality module tables:

```bash
cd backend
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fs = require('fs');
const schema = fs.readFileSync('./models/quality/database.js', 'utf8');
const createTables = schema.match(/const createQualityTables = `([\s\S]*?)`;/)[1];

supabase.rpc('exec_sql', { sql: createTables }).then(({data, error}) => {
  if(error) console.error('Error:', error);
  else console.log('Tables created successfully!');
}).catch(err => console.error('Connection error:', err));
"
```

### 4. Test the Connection
```bash
cd backend
node -e "
const { supabase } = require('./supabase_client');
supabase.from('policies').select('*').limit(1).then(({data, error}) => {
  if(error) console.error('Error:', error);
  else console.log('Database connected successfully!');
});
"
```

### 5. Start Backend Server
```bash
cd backend
npm start
# or
node app.js
```

### 6. Test Frontend Integration
1. Start frontend: `cd frontend && npm start`
2. Navigate to Quality > Policies
3. Try adding a new policy
4. Check if data appears in the database

## Expected Flow After Fix
1. User fills form in Quality sub-module
2. Frontend sends POST request to backend API
3. Backend validates and inserts into Supabase database
4. Success response returned to frontend
5. Data persists and appears in listings

## Troubleshooting
- If connection fails: Verify Supabase URL and keys
- If tables missing: Run the table creation script
- If API errors: Check backend console logs
- If CORS issues: Verify frontend URL in CORS config

## Quality Module Tables Created
- `users` - Authentication and user management
- `faculty` - Faculty performance data
- `audits` - Audit records and findings
- `grievances` - Grievance tracking and resolution
- `policies` - Policy compliance management
- `accreditation_reports` - Accreditation status and reports
