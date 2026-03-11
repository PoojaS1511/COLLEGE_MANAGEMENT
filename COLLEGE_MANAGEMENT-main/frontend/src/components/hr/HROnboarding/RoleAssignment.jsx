import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const RoleAssignment = () => {
  const { moveToNextStep, moveToPreviousStep, onStepComplete } = useOutletContext();
  const [roleData, setRoleData] = useState({
    academicRole: '',
    reportingManager: '',
    departmentMapping: '',
    permissions: {
      attendanceAccess: false,
      leaveManagement: false,
      payrollView: false,
      studentManagement: false
    }
  });

  const [errors, setErrors] = useState({});
  const [availableManagers, setAvailableManagers] = useState([]);

  const academicRoles = [
    'Professor',
    'Assistant Professor', 
    'Associate Professor',
    'Lecturer',
    'Lab Instructor',
    'Lab Staff',
    'Department Head',
    'Program Coordinator'
  ];

  const systemPermissions = [
    {
      key: 'attendanceAccess',
      label: 'Attendance Access',
      description: 'View and manage attendance records'
    },
    {
      key: 'leaveManagement',
      label: 'Leave Management',
      description: 'Approve/reject leave requests'
    },
    {
      key: 'payrollView',
      label: 'Payroll View',
      description: 'Access salary and payroll information'
    },
    {
      key: 'studentManagement',
      label: 'Student Management',
      description: 'Manage student records and academic data'
    }
  ];

  useEffect(() => {
    // Mock data for available managers - in real app, this would come from API
    setAvailableManagers([
      { id: 1, name: 'Dr. Sarah Johnson', department: 'Computer Science', role: 'Department Head' },
      { id: 2, name: 'Prof. Michael Chen', department: 'Information Technology', role: 'Department Head' },
      { id: 3, name: 'Dr. Emily Davis', department: 'Electronics & Communication', role: 'Department Head' },
      { id: 4, name: 'Prof. Robert Wilson', department: 'Mechanical Engineering', role: 'Department Head' },
      { id: 5, name: 'Dr. Lisa Anderson', department: 'Business Administration', role: 'Department Head' }
    ]);

    // Load existing data
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (existingData.department) {
      setRoleData(prev => ({
        ...prev,
        departmentMapping: existingData.department
      }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!roleData.academicRole) {
      newErrors.academicRole = 'Academic role is required';
    }

    if (!roleData.reportingManager) {
      newErrors.reportingManager = 'Reporting manager is required';
    }

    if (!roleData.departmentMapping) {
      newErrors.departmentMapping = 'Department mapping is required';
    }

    // At least one permission should be selected
    const hasPermission = Object.values(roleData.permissions).some(permission => permission);
    if (!hasPermission) {
      newErrors.permissions = 'At least one system permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData(prev => ({
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
  };

  const handlePermissionChange = (permissionKey) => {
    setRoleData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions[permissionKey]
      }
    }));

    // Clear permission error if any permission is selected
    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
  };

  const handleSaveAndContinue = () => {
    if (validateForm()) {
      // Save role data
      const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      localStorage.setItem('onboardingData', JSON.stringify({
        ...existingData,
        roleAssignment: roleData
      }));

      // Mark step as completed
      onStepComplete(3);
      
      // Move to next step
      moveToNextStep();
    }
  };

  const getFilteredManagers = () => {
    if (!roleData.departmentMapping) return availableManagers;
    return availableManagers.filter(manager => 
      manager.department.toLowerCase().includes(roleData.departmentMapping.toLowerCase())
    );
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Role Assignment</h2>
        <p>Assign institutional and system roles for the employee</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveAndContinue(); }}>
        {/* Academic Role Section */}
        <div className="role-section">
          <h3>Academic Role Assignment</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Academic Role <span className="required">*</span>
              </label>
              <select
                name="academicRole"
                value={roleData.academicRole}
                onChange={handleInputChange}
                className={`form-select ${errors.academicRole ? 'error' : ''}`}
              >
                <option value="">Select academic role</option>
                {academicRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.academicRole && <div className="error-message">{errors.academicRole}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Reporting Manager <span className="required">*</span>
              </label>
              <select
                name="reportingManager"
                value={roleData.reportingManager}
                onChange={handleInputChange}
                className={`form-select ${errors.reportingManager ? 'error' : ''}`}
              >
                <option value="">Select reporting manager</option>
                {getFilteredManagers().map(manager => (
                  <option key={manager.id} value={manager.name}>
                    {manager.name} - {manager.role}
                  </option>
                ))}
              </select>
              {errors.reportingManager && <div className="error-message">{errors.reportingManager}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Department Mapping <span className="required">*</span>
              </label>
              <select
                name="departmentMapping"
                value={roleData.departmentMapping}
                onChange={handleInputChange}
                className={`form-select ${errors.departmentMapping ? 'error' : ''}`}
              >
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Library Science">Library Science</option>
              </select>
              {errors.departmentMapping && <div className="error-message">{errors.departmentMapping}</div>}
            </div>
          </div>
        </div>

        {/* System Permissions Section */}
        <div className="role-section">
          <h3>System Permissions</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Select the ERP system modules and permissions this employee should have access to
          </p>
          
          <div className="permission-grid">
            {systemPermissions.map(permission => (
              <div key={permission.key} className="permission-item">
                <input
                  type="checkbox"
                  id={permission.key}
                  className="permission-checkbox"
                  checked={roleData.permissions[permission.key]}
                  onChange={() => handlePermissionChange(permission.key)}
                />
                <label htmlFor={permission.key} className="permission-label">
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {permission.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {permission.description}
                  </div>
                </label>
              </div>
            ))}
          </div>
          
          {errors.permissions && <div className="error-message">{errors.permissions}</div>}
        </div>

        {/* Role Summary */}
        <div className="role-section" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <h3>Role Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Academic Role</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {roleData.academicRole || 'Not selected'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Reporting Manager</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {roleData.reportingManager || 'Not selected'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Department</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {roleData.departmentMapping || 'Not selected'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Permissions</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {Object.values(roleData.permissions).filter(p => p).length} modules assigned
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => alert('No previous step')}
          >
            ← Back to Documents
          </button>
          
          <div className="form-actions-right">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                alert('Role assignment saved as draft!');
              }}
            >
              💾 Save Draft
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Save & Continue to Work Policy →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RoleAssignment;
