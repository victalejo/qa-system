import React from 'react';

interface Step3Props {
  expectedBehavior: string;
  actualBehavior: string;
  onExpectedChange: (expected: string) => void;
  onActualChange: (actual: string) => void;
}

const Step3Behavior: React.FC<Step3Props> = ({
  expectedBehavior,
  actualBehavior,
  onExpectedChange,
  onActualChange
}) => {
  return (
    <div className="wizard-step">
      <h3 className="wizard-step-title">Comportamiento Esperado vs Actual</h3>
      <p className="wizard-step-description">
        Describe qué esperabas que sucediera y qué sucedió en realidad
      </p>

      <div className="form-group">
        <label htmlFor="expectedBehavior" className="form-label">
          Comportamiento Esperado <span className="required">*</span>
        </label>
        <textarea
          id="expectedBehavior"
          value={expectedBehavior}
          onChange={(e) => onExpectedChange(e.target.value)}
          className="form-control"
          rows={4}
          placeholder="Describe qué esperabas que sucediera..."
          required
        />
        <small className="form-hint">
          Explica el comportamiento correcto que debería ocurrir
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="actualBehavior" className="form-label">
          Comportamiento Actual <span className="required">*</span>
        </label>
        <textarea
          id="actualBehavior"
          value={actualBehavior}
          onChange={(e) => onActualChange(e.target.value)}
          className="form-control"
          rows={4}
          placeholder="Describe qué sucedió en realidad..."
          required
        />
        <small className="form-hint">
          Explica el comportamiento incorrecto que está ocurriendo
        </small>
      </div>

      <div className="comparison-info">
        <div className="comparison-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="comparison-text">
          Asegúrate de describir claramente la diferencia entre lo que esperabas y lo que realmente ocurrió
        </p>
      </div>
    </div>
  );
};

export default Step3Behavior;
