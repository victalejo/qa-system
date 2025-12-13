import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './StepIndicator.css';

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  completedSteps?: number[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Un paso está completado si está en el array o si su índice es menor al paso actual
  const isStepCompleted = (index: number) => {
    return completedSteps.includes(index) || index < currentStep;
  };

  // Solo se puede hacer clic en pasos completados
  const canClickStep = (index: number) => {
    return onStepClick && isStepCompleted(index) && index !== currentStep;
  };

  return (
    <div className="step-indicator">
      <div className="step-indicator-header">
        <span className="step-counter">Paso {currentStep + 1} de {steps.length}</span>
        <span className="step-percentage">{Math.round(progress)}%</span>
      </div>
      <div className="step-indicator-progress">
        <motion.div
          className="step-indicator-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="step-indicator-steps">
        {steps.map((step, index) => {
          const completed = isStepCompleted(index);
          const active = index === currentStep;
          const clickable = canClickStep(index);

          return (
            <motion.div
              key={step.number}
              className={`step-item ${active ? 'active' : ''} ${completed ? 'completed' : ''} ${clickable ? 'clickable' : ''}`}
              onClick={() => clickable && onStepClick?.(index)}
              whileHover={clickable ? { scale: 1.05 } : {}}
              whileTap={clickable ? { scale: 0.95 } : {}}
            >
              <motion.div
                className="step-number"
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {completed ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span>{step.number}</span>
                )}
              </motion.div>
              <div className="step-title">{step.title}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
