import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const WorkPolicy = () => {
  const { moveToNextStep, moveToPreviousStep, onStepComplete } = useOutletContext();
  const [policyData, setPolicyData] = useState({
    workingHours: {
      startTime: '09:00',
      endTime: '17:00'
    },
    shift: 'morning',
    weeklyOffDays: ['Saturday', 'Sunday'],
    probationPeriod: '6',
    leavePolicy: {
      casualLeave: 12,
      sickLeave: 10,
      earnedLeave: 15
    }
  });

  const [errors, setErrors] = useState({});

  const shifts = [
    { value: 'morning', label: 'Morning (9 AM - 5 PM)', start: '09:00', end: '17:00' },
    { value: 'evening', label: 'Evening (1 PM - 9 PM)', start: '13:00', end: '21:00' },
    { value: 'night', label: 'Night (9 PM - 5 AM)', start: '21:00', end: '05:00' }
  ];

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const probationOptions = [
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' }
  ];

  useEffect(() => {
    // Load existing data
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (existingData.workPolicy) {
      setPolicyData(existingData.workPolicy);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!policyData.workingHours.startTime || !policyData.workingHours.endTime) {
      newErrors.workingHours = 'Working hours are required';
    }

    if (policyData.weeklyOffDays.length === 0) {
      newErrors.weeklyOffDays = 'At least one weekly off day is required';
    }

    if (!policyData.probationPeriod) {
      newErrors.probationPeriod = 'Probation period is required';
    }

    // Validate leave policy
    const { casualLeave, sickLeave, earnedLeave } = policyData.leavePolicy;
    if (casualLeave < 0 || sickLeave < 0 || earnedLeave < 0) {
      newErrors.leavePolicy = 'Leave days cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWorkingHoursChange = (type, value) => {
    setPolicyData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [type]: value
      }
    }));

    if (errors.workingHours) {
      setErrors(prev => ({ ...prev, workingHours: '' }));
    }
  };

  const handleShiftChange = (shiftValue) => {
    const selectedShift = shifts.find(s => s.value === shiftValue);
    setPolicyData(prev => ({
      ...prev,
      shift: shiftValue,
      workingHours: {
        startTime: selectedShift.start,
        endTime: selectedShift.end
      }
    }));
  };

  const handleWeekdayToggle = (day) => {
    setPolicyData(prev => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(day)
        ? prev.weeklyOffDays.filter(d => d !== day)
        : [...prev.weeklyOffDays, day]
    }));

    if (errors.weeklyOffDays) {
      setErrors(prev => ({ ...prev, weeklyOffDays: '' }));
    }
  };

  const handleProbationChange = (value) => {
    setPolicyData(prev => ({
      ...prev,
      probationPeriod: value
    }));

    if (errors.probationPeriod) {
      setErrors(prev => ({ ...prev, probationPeriod: '' }));
    }
  };

  const handleLeavePolicyChange = (leaveType, value) => {
    const numValue = parseInt(value) || 0;
    setPolicyData(prev => ({
      ...prev,
      leavePolicy: {
        ...prev.leavePolicy,
        [leaveType]: numValue
      }
    }));

    if (errors.leavePolicy) {
      setErrors(prev => ({ ...prev, leavePolicy: '' }));
    }
  };

  const calculateTotalLeave = () => {
    const { casualLeave, sickLeave, earnedLeave } = policyData.leavePolicy;
    return casualLeave + sickLeave + earnedLeave;
  };

  const handleSaveAndContinue = () => {
    if (validateForm()) {
      // Save policy data
      const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      localStorage.setItem('onboardingData', JSON.stringify({
        ...existingData,
        workPolicy: policyData
      }));

      // Mark step as completed
      onStepComplete(4);
      
      // Move to next step
      moveToNextStep();
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Work Policy</h2>
        <p>Define working rules, hours, and leave policies for the employee</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveAndContinue(); }}>
        {/* Working Hours & Shift */}
        <div className="policy-section">
          <h3>Working Hours & Shift</h3>
          
          <div className="time-input-group">
            <label className="form-label">Working Hours</label>
            <input
              type="time"
              value={policyData.workingHours.startTime}
              onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
              className="time-input"
            />
            <span style={{ padding: '0 0.5rem' }}>to</span>
            <input
              type="time"
              value={policyData.workingHours.endTime}
              onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
              className="time-input"
            />
          </div>

          <div>
            <label className="form-label">Shift Selection</label>
            <div className="shift-buttons">
              {shifts.map(shift => (
                <button
                  key={shift.value}
                  type="button"
                  className={`shift-button ${policyData.shift === shift.value ? 'active' : ''}`}
                  onClick={() => handleShiftChange(shift.value)}
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>
          
          {errors.workingHours && <div className="error-message">{errors.workingHours}</div>}
        </div>

        {/* Weekly Off Days */}
        <div className="policy-section">
          <h3>Weekly Off Days</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Select the days that will be weekly offs (multiple selection allowed)
          </p>
          
          <div className="weekdays-grid">
            {weekdays.map(day => (
              <button
                key={day}
                type="button"
                className={`weekday-button ${policyData.weeklyOffDays.includes(day) ? 'selected' : ''}`}
                onClick={() => handleWeekdayToggle(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          
          {errors.weeklyOffDays && <div className="error-message">{errors.weeklyOffDays}</div>}
        </div>

        {/* Probation Period */}
        <div className="policy-section">
          <h3>Probation Period</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Select the probation period for the employee
          </p>
          
          <div className="probation-buttons">
            {probationOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`probation-button ${policyData.probationPeriod === option.value ? 'active' : ''}`}
                onClick={() => handleProbationChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {errors.probationPeriod && <div className="error-message">{errors.probationPeriod}</div>}
        </div>

        {/* Leave Policy */}
        <div className="policy-section">
          <h3>Leave Policy (Days per Year)</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Set the annual leave entitlement for the employee
          </p>
          
          <div className="leave-policy-grid">
            <div>
              <label className="form-label">Casual Leave (CL)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={policyData.leavePolicy.casualLeave}
                onChange={(e) => handleLeavePolicyChange('casualLeave', e.target.value)}
                className="leave-input"
              />
            </div>
            
            <div>
              <label className="form-label">Sick Leave (SL)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={policyData.leavePolicy.sickLeave}
                onChange={(e) => handleLeavePolicyChange('sickLeave', e.target.value)}
                className="leave-input"
              />
            </div>
            
            <div>
              <label className="form-label">Earned Leave (EL)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={policyData.leavePolicy.earnedLeave}
                onChange={(e) => handleLeavePolicyChange('earnedLeave', e.target.value)}
                className="leave-input"
              />
            </div>
          </div>
          
          <div className="total-leave-display">
            <div>Total Annual Leave: {calculateTotalLeave()} days</div>
          </div>
          
          {errors.leavePolicy && <div className="error-message">{errors.leavePolicy}</div>}
        </div>

        {/* Policy Summary */}
        <div className="policy-section" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <h3>Policy Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Working Hours</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {policyData.workingHours.startTime} - {policyData.workingHours.endTime}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Shift</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {shifts.find(s => s.value === policyData.shift)?.label}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Weekly Off</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {policyData.weeklyOffDays.join(', ')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Probation</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {policyData.probationPeriod} months
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Total Leave/Year</div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {calculateTotalLeave()} days
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
            ← Back to Role Assignment
          </button>
          
          <div className="form-actions-right">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                alert('Work policy saved as draft!');
              }}
            >
              💾 Save Draft
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Save & Continue to Salary Setup →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkPolicy;
