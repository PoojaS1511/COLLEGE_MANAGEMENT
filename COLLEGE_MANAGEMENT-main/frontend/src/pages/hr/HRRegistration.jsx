import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const HRRegistration = () => {
  const { moveToNextStep, moveToPreviousStep, onStepComplete } = useOutletContext();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeType: '',
    department: '',
    designation: '',
    joiningDate: '',
    systemRole: ''
  });

  const [errors, setErrors] = useState({});
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState('');

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Business Administration',
    'Human Resources',
    'Finance & Accounting',
    'Library Science'
  ];

  const designations = {
    'Faculty': [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'Lab Instructor'
    ],
    'Staff': [
      'System Administrator',
      'Network Engineer',
      'Database Administrator',
      'Technical Support',
      'Administrative Assistant',
      'Accountant',
      'Librarian',
      'Lab Technician',
      'Maintenance Engineer',
      'Security Officer'
    ]
  };

  const systemRoles = ['Faculty', 'Staff', 'Admin'];

  useEffect(() => {
    // Auto-generate employee ID
    const generateEmployeeId = () => {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `EMP${year}${random}`;
    };
    
    setGeneratedEmployeeId(generateEmployeeId());
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.employeeType) {
      newErrors.employeeType = 'Employee type is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Date of joining is required';
    }

    if (!formData.systemRole) {
      newErrors.systemRole = 'System role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset designation when employee type changes
    if (name === 'employeeType') {
      setFormData(prev => ({
        ...prev,
        designation: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const employeeData = {
        employeeId: generatedEmployeeId,
        ...formData
      };

      // Save to localStorage (in real app, this would be API call)
      localStorage.setItem('onboardingData', JSON.stringify(employeeData));

      // Registration completed
      onStepComplete(1);
      moveToNextStep();
    }
  };

  const handleSaveAndContinue = () => {
    handleSubmit(new Event('submit'));
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Employee Registration</h2>
        <p>Create basic employee profile and generate system credentials</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Generated Employee ID */}
          <div className="form-group full-width">
            <label className="form-label">Employee ID</label>
            <div style={{ 
              padding: '0.75rem 1rem', 
              background: '#f3f4f6', 
              borderRadius: '8px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {generatedEmployeeId}
            </div>
            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Auto-generated employee identification number
            </small>
          </div>

          {/* Full Name */}
          <div className="form-group full-width">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter employee's full name"
            />
            {errors.fullName && <div className="error-message">{errors.fullName}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="employee@college.edu"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="10-digit mobile number"
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          {/* Employee Type */}
          <div className="form-group">
            <label className="form-label">
              Employee Type <span className="required">*</span>
            </label>
            <select
              name="employeeType"
              value={formData.employeeType}
              onChange={handleInputChange}
              className={`form-select ${errors.employeeType ? 'error' : ''}`}
            >
              <option value="">Select employee type</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
            {errors.employeeType && <div className="error-message">{errors.employeeType}</div>}
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="form-label">
              Department <span className="required">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className={`form-select ${errors.department ? 'error' : ''}`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <div className="error-message">{errors.department}</div>}
          </div>

          {/* Designation */}
          <div className="form-group">
            <label className="form-label">
              Designation <span className="required">*</span>
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              className={`form-select ${errors.designation ? 'error' : ''}`}
              disabled={!formData.employeeType}
            >
              <option value="">Select designation</option>
              {formData.employeeType && designations[formData.employeeType]?.map(designation => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>
            {errors.designation && <div className="error-message">{errors.designation}</div>}
            {!formData.employeeType && (
              <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                Select employee type first
              </small>
            )}
          </div>

          {/* Date of Joining */}
          <div className="form-group">
            <label className="form-label">
              Date of Joining <span className="required">*</span>
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleInputChange}
              className={`form-input ${errors.joiningDate ? 'error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.joiningDate && <div className="error-message">{errors.joiningDate}</div>}
          </div>

          {/* System Role */}
          <div className="form-group">
            <label className="form-label">
              System Role <span className="required">*</span>
            </label>
            <select
              name="systemRole"
              value={formData.systemRole}
              onChange={handleInputChange}
              className={`form-select ${errors.systemRole ? 'error' : ''}`}
            >
              <option value="">Select system role</option>
              {systemRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.systemRole && <div className="error-message">{errors.systemRole}</div>}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => alert('No previous step')}
            disabled={true} // Disabled on first step
          >
            ← Previous
          </button>
          
          <div className="form-actions-right">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                // Save as draft functionality
                alert('Draft saved successfully!');
              }}
            >
              💾 Save Draft
            </button>
            
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSaveAndContinue}
            >
              Save & Continue →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HRRegistration;
