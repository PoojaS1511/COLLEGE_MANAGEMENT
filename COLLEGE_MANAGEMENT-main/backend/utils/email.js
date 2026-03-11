const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { logError } = require('./logger');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production' // Do not reject self-signed certs in development
  }
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    logError('SMTP connection error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// Function to render email template
const renderTemplate = async (templateName, data = {}) => {
  try {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.ejs`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  } catch (error) {
    logError(`Error rendering email template ${templateName}:`, error);
    throw new Error('Failed to render email template');
  }
};

// Send email function
const sendEmail = async (options) => {
  try {
    const { to, subject, template, context, text, attachments } = options;
    
    // Default from email
    const from = process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'Student Management'}" <noreply@example.com>`;
    
    // Prepare email options
    const mailOptions = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      attachments
    };
    
    // If template is provided, render it as HTML
    if (template) {
      mailOptions.html = await renderTemplate(template, context);
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    logError('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Common email templates
const emailTemplates = {
  // Password reset email
  sendPasswordReset: async (user, resetUrl) => {
    return sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        name: user.name || 'User',
        resetUrl,
        appName: process.env.APP_NAME || 'Student Management',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    });
  },
  
  // Welcome email
  sendWelcome: async (user, password = null) => {
    return sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.APP_NAME || 'Student Management'}`,
      template: 'welcome',
      context: {
        name: user.name || 'User',
        email: user.email,
        password: password ? `Your temporary password is: ${password}` : 'You can set your password using the forgot password feature.',
        loginUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '#',
        appName: process.env.APP_NAME || 'Student Management',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    });
  },
  
  // Account verification email
  sendVerificationEmail: async (user, verificationUrl) => {
    return sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'verify-email',
      context: {
        name: user.name || 'User',
        verificationUrl,
        appName: process.env.APP_NAME || 'Student Management',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    });
  },
  
  // General notification
  sendNotification: async (user, subject, message) => {
    return sendEmail({
      to: user.email,
      subject,
      template: 'notification',
      context: {
        name: user.name || 'User',
        message,
        appName: process.env.APP_NAME || 'Student Management',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
      }
    });
  }
};

module.exports = {
  transporter,
  sendEmail,
  emailTemplates
};
