import { createRequire } from 'module';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  {
    key: 'SUPABASE_URL',
    question: 'Enter your Supabase project URL: ',
    default: 'https://qkaaoeismqnhjyikgkme.supabase.co'
  },
  {
    key: 'SUPABASE_ANON_KEY',
    question: 'Enter your Supabase anon key: ',
    default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDI1NzQsImV4cCI6MjA2OTg3ODU3NH0.o3K8BNVZucbqFWsPzIZJ_H8_ApR3uu9Cvjm5C9HFKX0'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    question: 'Enter your Supabase service role key: ',
    default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw'
  },
  {
    key: 'JWT_SECRET',
    question: 'Enter a secret key for JWT (or press Enter to generate one): ',
    default: randomBytes(32).toString('hex')
  }
];

async function askQuestion(question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

async function setupEnv() {
  console.log('Setting up your environment variables...\n');
  
  let envContent = `# Supabase Configuration\n`;
  
  try {
    // Collect all environment variables
    const envVars = {};
    
    for (const item of questions) {
      const answer = await askQuestion(item.question, item.default);
      envVars[item.key] = answer.trim();
    }
    
    // Build the .env content
    envContent += `SUPABASE_URL=${envVars.SUPABASE_URL}\n`;
    envContent += `SUPABASE_ANON_KEY=${envVars.SUPABASE_ANON_KEY}\n`;
    envContent += `SUPABASE_SERVICE_ROLE_KEY=${envVars.SUPABASE_SERVICE_ROLE_KEY}\n\n`;
    
    envContent += `# Server Configuration\n`;
    envContent += `NODE_ENV=development\n`;
    envContent += `PORT=5000\n`;
    envContent += `JWT_SECRET=${envVars.JWT_SECRET || randomBytes(32).toString('hex')}\n`;
    envContent += `JWT_EXPIRES_IN=30d\n\n`;
    
    // Email Configuration
    envContent += `# Email Configuration (optional for development)\n`;
    envContent += `SMTP_HOST=smtp.ethereal.email\n`;
    envContent += `SMTP_PORT=587\n`;
    envContent += `SMTP_SECURE=false\n`;
    envContent += `SMTP_USER=your_ethereal_email\n`;
    envContent += `SMTP_PASS=your_ethereal_password\n`;
    envContent += `EMAIL_FROM=noreply@studentmanagement.com\n`;
    
    // Write to .env file
    writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file created successfully at:', envPath);
    console.log('\n🔒 Please review the settings in the .env file before continuing.');
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the setup
setupEnv().catch(error => {
  console.error('\n❌ An unexpected error occurred:', error.message);
  process.exit(1);
});
