import React from 'react';

interface Application {
  _id: string;
  name: string;
  version: string;
}

interface Step6Props {
  severity: string;
  environment: string;
  onSeverityChange: (severity: string) => void;
  onEnvironmentChange: (environment: string) => void;
  // Datos para revisión
  selectedApp: Application | null;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  consoleErrors: string;
  queries: string;
  images: File[];
}

const Step6Review: React.FC<Step6Props> = ({
  severity,
  environment,
  onSeverityChange,
  onEnvironmentChange,
  selectedApp,
  title,
  description,
  stepsToReproduce,
  expectedBehavior,
  actualBehavior,
  consoleErrors,
  queries,
  images
}) => {
  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[sev] || '#6c757d';
  };

  const getSeverityLabel = (sev: string) => {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[sev] || sev;
  };

  return (
    <div className="wizard-step">
      <h3 className="wizard-step-title">Revisión y Finalización</h3>
      <p className="wizard-step-description">
        Completa la información final y revisa tu reporte antes de enviarlo
      </p>

      <div className="form-group">
        <label htmlFor="severity" className="form-label">
          Severidad <span className="required">*</span>
        </label>
        <select
          id="severity"
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="form-control"
          required
        >
          <option value="low">Baja - Problema menor que no afecta funcionalidad</option>
          <option value="medium">Media - Afecta funcionalidad pero hay alternativa</option>
          <option value="high">Alta - Afecta funcionalidad sin alternativa</option>
          <option value="critical">Crítica - Bloquea funcionalidad principal</option>
        </select>
        <div
          className="severity-indicator"
          style={{ backgroundColor: getSeverityColor(severity) }}
        >
          Severidad: {getSeverityLabel(severity)}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="environment" className="form-label">
          Entorno <span className="required">*</span>
        </label>
        <input
          type="text"
          id="environment"
          value={environment}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          className="form-control"
          placeholder="Ej: Windows 10, Chrome 120"
          required
        />
        <small className="form-hint">
          Especifica el sistema operativo, navegador y versión
        </small>
      </div>

      <div className="review-summary">
        <h4 className="review-summary-title">Resumen del Reporte</h4>

        <div className="review-item">
          <div className="review-label">Aplicación:</div>
          <div className="review-value">
            {selectedApp ? `${selectedApp.name} v${selectedApp.version}` : 'No seleccionada'}
          </div>
        </div>

        <div className="review-item">
          <div className="review-label">Título:</div>
          <div className="review-value">{title || 'Sin título'}</div>
        </div>

        <div className="review-item">
          <div className="review-label">Descripción:</div>
          <div className="review-value preview-text">{description || 'Sin descripción'}</div>
        </div>

        <div className="review-item">
          <div className="review-label">Pasos para reproducir:</div>
          <div className="review-value preview-text">{stepsToReproduce || 'Sin pasos'}</div>
        </div>

        <div className="review-item">
          <div className="review-label">Comportamiento esperado:</div>
          <div className="review-value preview-text">{expectedBehavior || 'Sin especificar'}</div>
        </div>

        <div className="review-item">
          <div className="review-label">Comportamiento actual:</div>
          <div className="review-value preview-text">{actualBehavior || 'Sin especificar'}</div>
        </div>

        {consoleErrors && (
          <div className="review-item">
            <div className="review-label">Errores de consola:</div>
            <div className="review-value preview-code">{consoleErrors}</div>
          </div>
        )}

        {queries && (
          <div className="review-item">
            <div className="review-label">Consultas:</div>
            <div className="review-value preview-code">{queries}</div>
          </div>
        )}

        <div className="review-item">
          <div className="review-label">Screenshots:</div>
          <div className="review-value">
            {images.length > 0 ? `${images.length} imagen(es)` : 'Sin imágenes'}
          </div>
        </div>

        <div className="review-item">
          <div className="review-label">Severidad:</div>
          <div className="review-value">
            <span
              className="severity-badge"
              style={{ backgroundColor: getSeverityColor(severity) }}
            >
              {getSeverityLabel(severity)}
            </span>
          </div>
        </div>

        <div className="review-item">
          <div className="review-label">Entorno:</div>
          <div className="review-value">{environment || 'Sin especificar'}</div>
        </div>
      </div>

      <div className="final-message">
        <div className="final-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="final-content">
          <strong>¿Todo listo?</strong>
          <p>Revisa la información y haz clic en "Enviar Reporte" para crear el reporte de bug.</p>
        </div>
      </div>
    </div>
  );
};

export default Step6Review;
