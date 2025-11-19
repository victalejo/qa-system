import React from 'react';

interface Step2Props {
  description: string;
  stepsToReproduce: string;
  onDescriptionChange: (description: string) => void;
  onStepsChange: (steps: string) => void;
}

const Step2Description: React.FC<Step2Props> = ({
  description,
  stepsToReproduce,
  onDescriptionChange,
  onStepsChange
}) => {
  return (
    <div className="wizard-step">
      <h3 className="wizard-step-title">Descripción del Problema</h3>
      <p className="wizard-step-description">
        Describe el bug y proporciona los pasos para reproducirlo
      </p>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción Detallada <span className="required">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="form-control"
          rows={5}
          placeholder="Describe detalladamente el bug que encontraste..."
          required
        />
        <small className="form-hint">
          Incluye todos los detalles relevantes sobre el problema
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="stepsToReproduce" className="form-label">
          Pasos para Reproducir <span className="required">*</span>
        </label>
        <textarea
          id="stepsToReproduce"
          value={stepsToReproduce}
          onChange={(e) => onStepsChange(e.target.value)}
          className="form-control"
          rows={6}
          placeholder="1. Ir a la página de registro&#10;2. Completar el formulario con datos válidos&#10;3. Hacer clic en el botón 'Guardar'&#10;4. Observar el error"
          required
        />
        <small className="form-hint">
          Lista los pasos exactos para reproducir el bug, uno por línea
        </small>
      </div>
    </div>
  );
};

export default Step2Description;
