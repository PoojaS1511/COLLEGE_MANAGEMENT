const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { logError } = require('./logger');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create subdirectory based on file type
    let subDir = 'misc';
    if (file.fieldname === 'profile_picture') {
      subDir = 'profile_pictures';
    } else if (file.fieldname === 'assignment') {
      subDir = 'assignments';
    } else if (file.fieldname === 'document') {
      subDir = 'documents';
    }
    
    const dir = path.join(uploadDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD || '5') * 1024 * 1024 // 5MB default
  }
});

// Middleware to handle file uploads
const handleFileUpload = (fieldName, maxCount = 1) => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        logError(err);
        return res.status(400).json({
          status: 'error',
          message: `File upload error: ${err.message}`
        });
      } else if (err) {
        // An unknown error occurred
        logError(err);
        return res.status(500).json({
          status: 'error',
          message: 'An error occurred during file upload'
        });
      }
      
      // File was uploaded successfully
      if (req.file) {
        // Add file path to request object for further processing
        req.file.path = req.file.path.replace(/\\/g, '/'); // Convert Windows paths to forward slashes
      }
      
      next();
    });
  };
};

// Middleware to handle multiple file uploads
const handleMultipleFiles = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadHandler = upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logError(err);
        return res.status(400).json({
          status: 'error',
          message: `File upload error: ${err.message}`
        });
      } else if (err) {
        logError(err);
        return res.status(500).json({
          status: 'error',
          message: 'An error occurred during file upload'
        });
      }
      
      // Files were uploaded successfully
      if (req.files && req.files.length > 0) {
        // Convert Windows paths to forward slashes
        req.files = req.files.map(file => ({
          ...file,
          path: file.path.replace(/\\/g, '/')
        }));
      }
      
      next();
    });
  };
};

// Function to delete a file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logError(`Error deleting file ${filePath}: ${err.message}`);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

// Function to get file URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  const relativePath = filePath.replace(/^.*[\\/]uploads[\\/]/, 'uploads/');
  
  return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = {
  upload,
  handleFileUpload,
  handleMultipleFiles,
  deleteFile,
  getFileUrl
};
