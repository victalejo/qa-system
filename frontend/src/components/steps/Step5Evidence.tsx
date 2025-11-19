import React from 'react';
import ImageUploader from '../ImageUploader';

interface Step5Props {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

const Step5Evidence: React.FC<Step5Props> = ({
  images,
  onImagesChange
}) => {
  return (
    <div className="wizard-step">
      <h3 className="wizard-step-title">Evidencias Visuales</h3>
      <p className="wizard-step-description">
        Sube capturas de pantalla o imágenes que muestren el bug (opcional)
      </p>

      <div className="form-group">
        <label className="form-label">
          Screenshots
          <span className="optional-badge">Opcional</span>
        </label>
        <ImageUploader
          images={images}
          onImagesChange={onImagesChange}
          maxImages={10}
          maxSizeMB={5}
        />
      </div>

      <div className="tips-box">
        <h4 className="tips-title">
          <svg className="tips-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Tips para buenas capturas
        </h4>
        <ul className="tips-list">
          <li>
            <strong>Captura el error completo:</strong> Asegúrate de que el error sea claramente visible
          </li>
          <li>
            <strong>Incluye contexto:</strong> Muestra la URL, mensajes de error y elementos relevantes
          </li>
          <li>
            <strong>Usa múltiples capturas:</strong> Si el bug tiene varios pasos, toma una captura de cada uno
          </li>
          <li>
            <strong>Resalta áreas importantes:</strong> Si es posible, resalta o marca las áreas con el problema
          </li>
          <li>
            <strong>Formatos aceptados:</strong> JPG, PNG, GIF, WEBP (máximo 5MB cada una)
          </li>
        </ul>
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
          Las imágenes son opcionales pero muy recomendadas. Una buena captura de pantalla puede
          ayudar al equipo a entender y resolver el problema mucho más rápido.
        </div>
      </div>
    </div>
  );
};

export default Step5Evidence;
