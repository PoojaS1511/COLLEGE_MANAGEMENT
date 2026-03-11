const Joi = require('joi');
const { logError } = require('../utils/logger');

// Common validation schemas
const schemas = {
  // Student validation
  student: Joi.object({
    first_name: Joi.string().required().min(2).max(100).label('First Name'),
    last_name: Joi.string().required().min(2).max(100).label('Last Name'),
    email: Joi.string().email().required().label('Email'),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).message('Phone number must be between 10-15 digits').label('Phone'),
    date_of_birth: Joi.date().max('now').required().label('Date of Birth'),
    gender: Joi.string().valid('male', 'female', 'other').label('Gender'),
    address: Joi.string().allow('').label('Address'),
    city: Joi.string().allow('').label('City'),
    state: Joi.string().allow('').label('State'),
    country: Joi.string().allow('').label('Country'),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).allow('').label('Pincode'),
    admission_date: Joi.date().required().label('Admission Date'),
    course_id: Joi.string().uuid().required().label('Course'),
    current_semester: Joi.number().integer().min(1).max(10).default(1).label('Current Semester'),
    register_number: Joi.string().required().label('Register Number'),
    roll_number: Joi.string().allow('').label('Roll Number'),
    blood_group: Joi.string().allow('').label('Blood Group'),
    parent_name: Joi.string().allow('').label('Parent Name'),
    parent_phone: Joi.string().pattern(/^[0-9]{10,15}$/).allow('').label('Parent Phone'),
    parent_email: Joi.string().email().allow('').label('Parent Email'),
    parent_occupation: Joi.string().allow('').label('Parent Occupation')
  }),
  
  // Course validation
  course: Joi.object({
    name: Joi.string().required().min(3).max(255).label('Course Name'),
    code: Joi.string().required().min(2).max(50).label('Course Code'),
    duration_years: Joi.number().integer().min(1).max(10).required().label('Duration (Years)'),
    department_id: Joi.string().uuid().required().label('Department'),
    description: Joi.string().allow('').label('Description')
  }),
  
  // Subject validation
  subject: Joi.object({
    name: Joi.string().required().min(3).max(255).label('Subject Name'),
    code: Joi.string().required().min(2).max(50).label('Subject Code'),
    course_id: Joi.string().uuid().required().label('Course'),
    semester: Joi.number().integer().min(1).max(10).required().label('Semester'),
    credits: Joi.number().integer().min(1).max(10).required().label('Credits')
  }),
  
  // Exam validation
  exam: Joi.object({
    name: Joi.string().required().min(3).max(255).label('Exam Name'),
    description: Joi.string().allow('').label('Description'),
    course_id: Joi.string().uuid().required().label('Course'),
    subject_id: Joi.string().uuid().required().label('Subject'),
    exam_date: Joi.date().required().label('Exam Date'),
    start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().label('Start Time'),
    end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().label('End Time'),
    max_marks: Joi.number().integer().min(1).required().label('Maximum Marks'),
    passing_marks: Joi.number().integer().min(0).max(Joi.ref('max_marks')).required().label('Passing Marks')
  }),
  
  // Attendance validation
  attendance: Joi.object({
    student_id: Joi.string().uuid().required().label('Student'),
    subject_id: Joi.string().uuid().required().label('Subject'),
    date: Joi.date().required().label('Date'),
    status: Joi.string().valid('present', 'absent', 'leave').required().label('Status'),
    remarks: Joi.string().allow('').label('Remarks')
  }),
  
  // Fees validation
  fee: Joi.object({
    name: Joi.string().required().min(3).max(255).label('Fee Name'),
    description: Joi.string().allow('').label('Description'),
    amount: Joi.number().precision(2).positive().required().label('Amount'),
    course_id: Joi.string().uuid().required().label('Course'),
    semester: Joi.number().integer().min(1).max(10).label('Semester'),
    is_one_time: Joi.boolean().default(false).label('Is One Time'),
    is_active: Joi.boolean().default(true).label('Is Active')
  }),
  
  // User authentication
  login: Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().required().label('Password')
  }),
  
  // User registration
  register: Joi.object({
    name: Joi.string().required().min(2).max(100).label('Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).required().label('Password'),
    role: Joi.string().valid('student', 'faculty', 'admin').default('student').label('Role'),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).allow('').label('Phone')
  })
};

// Validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(err => ({
        field: err.path[0],
        message: err.message.replace(/\"/g, "'")
      }));
      
      logError(`Validation error: ${JSON.stringify(errors)}`);
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    
    // Replace the request body with the validated and sanitized data
    if (property === 'body') {
      req.body = schema.validate(req.body, { stripUnknown: true }).value;
    }
    
    next();
  };
};

module.exports = {
  schemas,
  validate
};
