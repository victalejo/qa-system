import React from 'react';

interface Step4Props {
  consoleErrors: string;
  queries: string;
  onConsoleErrorsChange: (errors: string) => void;
  onQueriesChange: (queries: string) => void;
}

const Step4TechnicalErrors: React.FC<Step4Props> = ({
  consoleErrors,
  queries,
  onConsoleErrorsChange,
  onQueriesChange
}) => {
  return (
    <div className="wizard-step">
      <h3 className="wizard-step-title">Errores Técnicos</h3>
      <p className="wizard-step-description">
        Proporciona errores de consola y consultas relacionadas con el bug (opcional)
      </p>

      <div className="form-group">
        <label htmlFor="consoleErrors" className="form-label">
          Errores de Consola
          <span className="optional-badge">Opcional</span>
        </label>
        <textarea
          id="consoleErrors"
          value={consoleErrors}
          onChange={(e) => onConsoleErrorsChange(e.target.value)}
          className="form-control code-input"
          rows={8}
          placeholder="Pega aquí los errores que aparecen en la consola del navegador&#10;&#10;Ejemplo:&#10;Uncaught TypeError: Cannot read property 'map' of undefined&#10;    at UserList.js:42&#10;    at Array.map (<anonymous>)"
          spellCheck={false}
        />
        <small className="form-hint">
          <strong>Tip:</strong> Abre la consola del navegador (F12), copia los errores en rojo y pégalos aquí
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="queries" className="form-label">
          Consultas/Queries
          <span className="optional-badge">Opcional</span>
        </label>
        <textarea
          id="queries"
          value={queries}
          onChange={(e) => onQueriesChange(e.target.value)}
          className="form-control code-input"
          rows={8}
          placeholder="Pega aquí las consultas SQL, llamadas a API u otras queries relacionadas&#10;&#10;Ejemplo:&#10;POST /api/users&#10;Body: { 'name': 'John Doe', 'email': 'john@example.com' }&#10;Response: 500 Internal Server Error"
          spellCheck={false}
        />
        <small className="form-hint">
          Incluye consultas SQL, llamadas a API, o cualquier query relacionada con el error
        </small>
      </div>

      <div className="info-box">
        <div className="info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div className="info-content">
          <strong>Estos campos son opcionales</strong> pero muy útiles para el equipo de desarrollo.
          Si no hay errores técnicos visibles, puedes dejar estos campos vacíos y continuar.
        </div>
      </div>
    </div>
  );
};

export default Step4TechnicalErrors;
