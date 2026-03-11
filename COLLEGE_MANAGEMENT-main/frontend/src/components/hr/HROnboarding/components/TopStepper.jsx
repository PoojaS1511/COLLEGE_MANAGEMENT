import React from 'react';

const TopStepper = ({ steps, currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="top-stepper">
      <div className="stepper-container">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div 
              className={`stepper-step ${onStepClick ? 'clickable' : ''}`}
              onClick={() => onStepClick && onStepClick(index)}
              style={{ cursor: onStepClick ? 'pointer' : 'default' }}
            >
              <div className={`step-number ${completedSteps.includes(index) ? 'completed' : ''} ${currentStep === index ? 'active' : ''}`}>
                {completedSteps.includes(index) ? '✓' : index + 1}
              </div>
              <div className={`step-label ${completedSteps.includes(index) ? 'completed' : ''} ${currentStep === index ? 'active' : ''}`}>
                {step}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${completedSteps.includes(index) ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TopStepper;
