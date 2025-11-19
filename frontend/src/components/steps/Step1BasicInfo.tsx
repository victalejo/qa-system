import React from 'react';

interface Application {
  _id: string;
  name: string;
  version: string;
}

interface Step1Props {
  selectedApp: string;
  title: string;
  applications: Application[];
  onAppChange: (appId: string) => void;
  onTitleChange: (title: string) => void;
}

const Step1BasicInfo: React.FC<Step1Props> = ({
  selectedApp,
  title,
  applications,
  onAppChange,
  onTitleChange
}) => {
  return (
    <div className="wizard-step">
      <h3 className="wizard-step-title">Información Básica</h3>
      <p className="wizard-step-description">
        Selecciona la aplicación y proporciona un título descriptivo para el bug
      </p>

      <div className="form-group">
        <label htmlFor="application" className="form-label">
          Aplicación <span className="required">*</span>
        </label>
        <select
          id="application"
          value={selectedApp}
          onChange={(e) => onAppChange(e.target.value)}
          className="form-control"
          required
        >
          <option value="">Selecciona una aplicación</option>
          {applications.map((app) => (
            <option key={app._id} value={app._id}>
              {app.name} v{app.version}
            </option>
          ))}
        </select>
        <small className="form-hint">
          Selecciona la aplicación donde encontraste el bug
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Título del Bug <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="form-control"
          placeholder="Ej: Error al guardar formulario de registro"
          maxLength={200}
          required
        />
        <small className="form-hint">
          Proporciona un título breve y descriptivo ({title.length}/200 caracteres)
        </small>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
