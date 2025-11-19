import React from 'react';
import './StepIndicator.css';

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="step-indicator">
      <div className="step-indicator-header">
        <span className="step-counter">Paso {currentStep + 1} de {steps.length}</span>
      </div>
      <div className="step-indicator-progress">
        <div
          className="step-indicator-progress-bar"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="step-indicator-steps">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-number">
              {index < currentStep ? (
                <svg className="step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
