import React from 'react';

const Sidebar = ({ steps, currentStep, completedSteps, onStepClick }) => {
  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) {
      return 'completed';
    }
    if (stepId === currentStep) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🚀 HR Onboarding</h2>
      </div>

      <div className="sidebar-steps">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`sidebar-step ${getStepStatus(step.id) === 'active' ? 'active' : ''} ${getStepStatus(step.id) === 'completed' ? 'completed' : ''}`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="sidebar-step-icon">{step.icon}</div>
            <div className="sidebar-step-text">
              <div className="sidebar-step-name">{step.name}</div>
              <div className="sidebar-step-status">
                {getStepStatus(step.id) === 'completed' && <span className="step-check">✓</span>}
                {getStepStatus(step.id) === 'active' && 'In Progress'}
                {getStepStatus(step.id) === 'pending' && 'Pending'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
