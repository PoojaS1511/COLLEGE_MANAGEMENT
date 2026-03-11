import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './HROnboarding.css';

const HROnboardingLayout = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { id: 0, name: 'Dashboard', path: '/admin/hr', icon: '📊' },
    { id: 1, name: 'Registration', path: '/admin/hr/registration', icon: '📝' },
    { id: 2, name: 'Documents', path: '/admin/hr/documents', icon: '📂' },
    { id: 3, name: 'Role Assignment', path: '/admin/hr/role-assignment', icon: '👤' },
    { id: 4, name: 'Work Policy', path: '/admin/hr/work-policy', icon: '📜' },
    { id: 5, name: 'Salary Setup', path: '/admin/hr/salary-setup', icon: '💰' },
    { id: 6, name: 'System Access', path: '/admin/hr/system-access', icon: '🔐' }
  ];

  // Update current step based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const stepIndex = steps.findIndex(step => step.path === currentPath);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, [location.pathname]);

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const moveToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      navigate(steps[nextStep].path);
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigate(steps[prevStep].path);
    }
  };

  return (
    <div className="hr-onboarding-container-minimal">
      <div className="content-area-full">
        <Outlet
          context={{
            currentStep,
            completedSteps,
            onStepComplete: handleStepComplete,
            moveToNextStep,
            moveToPreviousStep
          }}
        />
      </div>
    </div>
  );
};

export default HROnboardingLayout;
