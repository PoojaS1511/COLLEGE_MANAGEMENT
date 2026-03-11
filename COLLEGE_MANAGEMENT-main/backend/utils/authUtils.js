const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { logError } = require('./logger');

// Generate JWT token
const generateToken = (userId, role = 'user') => {
  const payload = {
    id: userId,
    role,
    jti: uuidv4() // Unique identifier for the token
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    issuer: process.env.APP_NAME || 'student-management-api'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  const payload = {
    id: userId,
    jti: uuidv4(),
    type: 'refresh'
  };

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d',
    issuer: process.env.APP_NAME || 'student-management-api'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, options);
};

// Verify JWT token
const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh 
      ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET 
      : process.env.JWT_SECRET;
    
    return jwt.verify(token, secret);
  } catch (error) {
    logError('Token verification failed:', error);
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logError('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

// Compare password
const comparePasswords = async (candidatePassword, hashedPassword) => {
  try {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  } catch (error) {
    logError('Error comparing passwords:', error);
    throw new Error('Error comparing passwords');
  }
};

// Generate random password
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-=';
  let password = '';
  
  // Ensure at least one character from each required character set
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  
  // Add one character from each required set
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // Fill the rest of the password with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate a verification code
const generateVerificationCode = (length = 6) => {
  const numbers = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    code += numbers[randomIndex];
  }
  
  return code;
};

// Generate a reset token with expiry
const generateResetToken = () => {
  const token = uuidv4();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
  
  return {
    token,
    expires
  };
};

// Check if a token is expired
const isTokenExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  generateRandomPassword,
  generateVerificationCode,
  generateResetToken,
  isTokenExpired
};
