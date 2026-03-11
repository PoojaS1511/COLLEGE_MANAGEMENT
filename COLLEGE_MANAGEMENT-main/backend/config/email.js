import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email configuration
const emailConfig = {
  // SMTP configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  
  // Email settings
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Student Management System',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@studentmanagement.com'
  },
  
  // Templates
  templates: {
    welcome: {
      subject: 'Welcome to Student Management System',
      template: 'welcome-email.html'
    },
    passwordReset: {
      subject: 'Password Reset Request',
      template: 'password-reset.html'
    },
    accountVerification: {
      subject: 'Verify Your Email Address',
      template: 'verify-email.html'
    }
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  }
};

// Create a test account if in development
if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
  (async () => {
    try {
      const testAccount = await nodemailer.createTestAccount();
      emailConfig.smtp = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      };
      console.log('Using Ethereal test account for emails:');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
    } catch (error) {
      console.error('Failed to create test email account:', error);
    }
  })();
}

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export { transporter, emailConfig };
