import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

const HRSystemAccess = () => {
  const { moveToNextStep, moveToPreviousStep, onStepComplete } = useOutletContext();
  const navigate = useNavigate();
  const [systemData, setSystemData] = useState({
    credentials: {
      username: '',
      password: '',
      temporaryPassword: true
    },
    modules: {
      attendance: false,
      payroll: false,
      leaveManagement: false,
      academicDashboard: false
    },
    sendWelcomeEmail: true
  });

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const erpModules = [
    {
      key: 'attendance',
      name: 'Attendance',
      icon: '⏰',
      description: 'Mark and view attendance records'
    },
    {
      key: 'payroll',
      name: 'Payroll',
      icon: '💰',
      description: 'View salary slips and payment history'
    },
    {
      key: 'leaveManagement',
      name: 'Leave Management',
      icon: '📅',
      description: 'Apply and manage leave requests'
    },
    {
      key: 'academicDashboard',
      name: 'Academic Dashboard',
      icon: '📊',
      description: 'Access academic resources and tools'
    }
  ];

  useEffect(() => {
    // Load existing data
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (existingData.systemAccess) {
      setSystemData(existingData.systemAccess);
    } else {
      // Generate initial credentials
      generateCredentials();
    }
  }, []);

  const generateCredentials = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const employeeData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const name = employeeData.fullName || 'Employee';
      const employeeId = employeeData.employeeId || 'EMP0000';
      
      // Generate username from name and employee ID
      const nameParts = name.toLowerCase().replace(/\s+/g, '').split('');
      const username = `${nameParts.slice(0, 4).join('')}${employeeId.slice(-4)}`;
      
      // Generate random password
      const password = generateRandomPassword();
      
      setSystemData(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          username,
          password
        }
      }));
      
      setIsGenerating(false);
    }, 1000);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!systemData.credentials.username) {
      newErrors.username = 'Username is required';
    }

    if (!systemData.credentials.password) {
      newErrors.password = 'Password is required';
    } else if (systemData.credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    const selectedModules = Object.values(systemData.modules).filter(selected => selected).length;
    if (selectedModules === 0) {
      newErrors.modules = 'At least one ERP module must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCredentialsChange = (field, value) => {
    setSystemData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }));

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleModuleToggle = (moduleKey) => {
    setSystemData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: !prev.modules[moduleKey]
      }
    }));

    // Clear module error if any module is selected
    if (errors.modules) {
      setErrors(prev => ({
        ...prev,
        modules: ''
      }));
    }
  };

  const handleActivateEmployee = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsActivating(true);
      
      try {
        // Save system access data
        const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        const finalData = {
          ...existingData,
          systemAccess: systemData,
          status: 'ACTIVE',
          activatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('onboardingData', JSON.stringify(finalData));
        
        // Mark step as completed
        onStepComplete(6);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message and redirect
        alert('Employee activated successfully!');
        navigate('/admin/hr');
        
      } catch (error) {
        console.error('Error activating employee:', error);
        alert('Error activating employee. Please try again.');
      } finally {
        setIsActivating(false);
      }
    }
  };

  const getEmployeeSummary = () => {
    const data = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    return {
      name: data.fullName || 'Not specified',
      employeeId: data.employeeId || 'Not generated',
      email: data.email || 'Not specified',
      department: data.department || 'Not specified',
      designation: data.designation || 'Not specified',
      joiningDate: data.joiningDate || 'Not specified'
    };
  };

  const employeeSummary = getEmployeeSummary();

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>System Access & Activation</h2>
        <p>Generate login credentials and activate employee ERP access</p>
      </div>

      <form onSubmit={handleActivateEmployee}>
        {/* Employee Summary */}
        <div className="review-summary">
          <h3 className="review-title">Employee Information</h3>
          <div className="review-item">
            <span className="review-label">Name:</span>
            <span className="review-value">{employeeSummary.name}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Employee ID:</span>
            <span className="review-value">{employeeSummary.employeeId}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Email:</span>
            <span className="review-value">{employeeSummary.email}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Department:</span>
            <span className="review-value">{employeeSummary.department}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Designation:</span>
            <span className="review-value">{employeeSummary.designation}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Joining Date:</span>
            <span className="review-value">{employeeSummary.joiningDate}</span>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="credentials-section">
          <h3 style={{ marginBottom: '1rem' }}>Login Credentials</h3>
          
          <div className="credentials-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={systemData.credentials.username}
                onChange={(e) => handleCredentialsChange('username', e.target.value)}
                className={`credentials-input ${errors.username ? 'error' : ''}`}
                placeholder="System username"
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={systemData.credentials.password}
                  onChange={(e) => handleCredentialsChange('password', e.target.value)}
                  className={`credentials-input ${errors.password ? 'error' : ''}`}
                  placeholder="System password"
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ padding: '0.75rem' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              className="generate-credentials-btn"
              onClick={generateCredentials}
              disabled={isGenerating}
            >
              {isGenerating ? '🔄 Generating...' : '🔄 Regenerate Credentials'}
            </button>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={systemData.credentials.temporaryPassword}
                onChange={(e) => setSystemData(prev => ({
                  ...prev,
                  credentials: {
                    ...prev.credentials,
                    temporaryPassword: e.target.checked
                  }
                }))}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Force password change on first login
              </span>
            </label>
          </div>
        </div>

        {/* ERP Module Access */}
        <div className="role-section">
          <h3>Assign ERP Modules</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Select the ERP modules this employee should have access to
          </p>
          
          <div className="system-access-grid">
            {erpModules.map(module => (
              <div
                key={module.key}
                className={`module-card ${systemData.modules[module.key] ? 'selected' : ''}`}
                onClick={() => handleModuleToggle(module.key)}
              >
                <div className="module-icon">{module.icon}</div>
                <div className="module-name">{module.name}</div>
                <div className="module-description">{module.description}</div>
              </div>
            ))}
          </div>
          
          {errors.modules && <div className="error-message">{errors.modules}</div>}
        </div>

        {/* Welcome Email */}
        <div className="policy-section">
          <h3>Welcome Email</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={systemData.sendWelcomeEmail}
              onChange={(e) => setSystemData(prev => ({
                ...prev,
                sendWelcomeEmail: e.target.checked
              }))}
            />
            <span style={{ fontWeight: '500' }}>
              Send welcome email with login credentials to {employeeSummary.email}
            </span>
          </label>
          {systemData.sendWelcomeEmail && (
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              The employee will receive an email with their login credentials and a guide to access the ERP system.
            </p>
          )}
        </div>

        {/* Final Review */}
        <div className="review-summary" style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
          <h3 className="review-title">⚠️ Final Review</h3>
          <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1rem' }}>
            Please review all information carefully. Once activated, the onboarding data will be locked and the employee will gain system access.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Modules Assigned</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {Object.values(systemData.modules).filter(m => m).length} modules
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Welcome Email</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {systemData.sendWelcomeEmail ? 'Will be sent' : 'Not scheduled'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Password Policy</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {systemData.credentials.temporaryPassword ? 'Temporary' : 'Permanent'}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={moveToPreviousStep}
          >
            ← Back to Salary Setup
          </button>
          
          <div className="form-actions-right">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                alert('System access saved as draft!');
              }}
            >
              💾 Save Draft
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isActivating}
            >
              {isActivating ? '🔄 Activating...' : '🚀 Activate Employee'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HRSystemAccess;
