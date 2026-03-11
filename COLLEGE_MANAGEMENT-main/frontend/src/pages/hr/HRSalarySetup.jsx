import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const HRSalarySetup = () => {
  const { moveToNextStep, moveToPreviousStep, onStepComplete } = useOutletContext();
  const [salaryData, setSalaryData] = useState({
    earnings: {
      basicSalary: 0,
      hra: 0,
      conveyanceAllowance: 0,
      medicalAllowance: 0,
      specialAllowance: 0,
      performanceBonus: 0
    },
    deductions: {
      providentFund: 0,
      professionalTax: 200,
      incomeTax: 0,
      otherDeductions: 0
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load existing data
    const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (existingData.salarySetup) {
      setSalaryData(existingData.salarySetup);
    }
  }, []);

  const calculateTotalEarnings = () => {
    const { earnings } = salaryData;
    return Object.values(earnings).reduce((total, amount) => total + amount, 0);
  };

  const calculateTotalDeductions = () => {
    const { deductions } = salaryData;
    return Object.values(deductions).reduce((total, amount) => total + amount, 0);
  };

  const calculateNetSalary = () => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  };

  const validateForm = () => {
    const newErrors = {};

    if (salaryData.earnings.basicSalary <= 0) {
      newErrors.basicSalary = 'Basic salary must be greater than 0';
    }

    if (calculateTotalEarnings() <= 0) {
      newErrors.earnings = 'Total earnings must be greater than 0';
    }

    if (calculateNetSalary() < 0) {
      newErrors.netSalary = 'Net salary cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEarningsChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setSalaryData(prev => ({
      ...prev,
      earnings: {
        ...prev.earnings,
        [field]: numValue
      }
    }));

    // Auto-calculate HRA (40% of basic salary) if basic salary changes
    if (field === 'basicSalary') {
      setSalaryData(prev => ({
        ...prev,
        earnings: {
          ...prev.earnings,
          basicSalary: numValue,
          hra: Math.round(numValue * 0.4)
        },
        deductions: {
          ...prev.deductions,
          providentFund: Math.round(numValue * 0.12) // 12% of basic salary
        }
      }));
    }

    // Clear errors
    if (errors[field] || errors.earnings || errors.netSalary) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
        earnings: '',
        netSalary: ''
      }));
    }
  };

  const handleDeductionsChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setSalaryData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [field]: numValue
      }
    }));

    // Clear errors
    if (errors[field] || errors.netSalary) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
        netSalary: ''
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSaveAndContinue = () => {
    if (validateForm()) {
      // Save salary data
      const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      localStorage.setItem('onboardingData', JSON.stringify({
        ...existingData,
        salarySetup: salaryData
      }));

      // Mark step as completed
      onStepComplete(5);
      moveToNextStep();
    }
  };

  const totalEarnings = calculateTotalEarnings();
  const totalDeductions = calculateTotalDeductions();
  const netSalary = calculateNetSalary();

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Salary Setup</h2>
        <p>Configure salary structure and compensation details</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveAndContinue(); }}>
        <div className="salary-grid">
          {/* Earnings Section */}
          <div className="salary-column earnings-column">
            <h3>Earnings</h3>
            
            <div className="salary-section">
              {Object.keys(salaryData.earnings).map(field => {
                const fieldLabels = {
                  basicSalary: 'Basic Salary',
                  hra: 'House Rent Allowance (HRA)',
                  conveyanceAllowance: 'Conveyance Allowance',
                  medicalAllowance: 'Medical Allowance',
                  specialAllowance: 'Special Allowance',
                  performanceBonus: 'Performance Bonus'
                };

                return (
                  <div key={field} className="salary-item">
                    <label className="salary-label">
                      {fieldLabels[field]}
                      {field === 'basicSalary' && <span className="required">*</span>}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={salaryData.earnings[field]}
                      onChange={(e) => handleEarningsChange(field, e.target.value)}
                      className={`salary-input ${errors[field] ? 'error' : ''}`}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deductions Section */}
          <div className="salary-column deductions-column">
            <h3>Deductions</h3>
            
            <div className="salary-section">
              {Object.keys(salaryData.deductions).map(field => {
                const fieldLabels = {
                  providentFund: 'Provident Fund (PF)',
                  professionalTax: 'Professional Tax',
                  incomeTax: 'Income Tax (TDS)',
                  otherDeductions: 'Other Deductions'
                };

                return (
                  <div key={field} className="salary-item">
                    <label className="salary-label">
                      {fieldLabels[field]}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={salaryData.deductions[field]}
                      onChange={(e) => handleDeductionsChange(field, e.target.value)}
                      className={`salary-input ${errors[field] ? 'error' : ''}`}
                      placeholder="0"
                      disabled={field === 'professionalTax'} // Professional tax is fixed
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.basicSalary && <div className="error-message">{errors.basicSalary}</div>}
        {errors.earnings && <div className="error-message">{errors.earnings}</div>}
        {errors.netSalary && <div className="error-message">{errors.netSalary}</div>}

        {/* Salary Summary */}
        <div className="salary-section" style={{ marginTop: '2rem' }}>
          <h3>Monthly Salary Breakdown</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.5rem', fontWeight: '600' }}>
                Total Earnings
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {formatCurrency(totalEarnings)}
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fef2f2', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem', fontWeight: '600' }}>
                Total Deductions
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                {formatCurrency(totalDeductions)}
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem', background: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#2563eb', marginBottom: '0.5rem', fontWeight: '600' }}>
                Net Salary
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
                {formatCurrency(netSalary)}
              </div>
            </div>
          </div>

          <div className="net-salary-summary">
            <div className="net-salary-label">Monthly Take-Home Salary</div>
            <div className="net-salary-value">{formatCurrency(netSalary)}</div>
            <div style={{ fontSize: '0.875rem', opacity: '0.9', marginTop: '0.5rem' }}>
              Annual CTC: {formatCurrency(netSalary * 12)}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="policy-section" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <h3>Salary Structure Notes</h3>
          <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <li>HRA is automatically calculated as 40% of basic salary</li>
            <li>Provident Fund is automatically calculated as 12% of basic salary</li>
            <li>Professional Tax is fixed at ₹200 per month as per state regulations</li>
            <li>Income Tax (TDS) will be calculated based on annual income slab</li>
            <li>All amounts are in Indian Rupees (INR)</li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => moveToPreviousStep()}
          >
            ← Back to Work Policy
          </button>
          
          <div className="form-actions-right">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                alert('Salary setup saved as draft!');
              }}
            >
              💾 Save Draft
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Save & Continue to System Access →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HRSalarySetup;
