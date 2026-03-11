const winston = require('winston');
const path = require('path');
const { format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const fs = require('fs');
const util = require('util');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const log = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  return log;
});

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'student-management-api' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      consoleFormat
    )
  }));
}

// Create a stream for morgan logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper function to log errors
const logError = (error) => {
  if (error instanceof Error) {
    logger.error(error.stack || error.message);
  } else if (typeof error === 'object') {
    logger.error(util.inspect(error, { depth: null }));
  } else {
    logger.error(String(error));
  }
};

// Helper function to log API requests
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.id : 'anonymous'
    });
  });
  
  next();
};

module.exports = {
  logger,
  logError,
  logRequest
};
