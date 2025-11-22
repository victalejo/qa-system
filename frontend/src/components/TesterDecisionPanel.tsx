import React, { useState } from 'react';
import api from '../lib/api';
import './TesterDecisionPanel.css';

interface TesterDecisionPanelProps {
  bugId: string;
  onDecisionMade: () => void;
}

const TesterDecisionPanel: React.FC<TesterDecisionPanelProps> = ({ bugId, onDecisionMade }) => {
  const [selectedDecision, setSelectedDecision] = useState<'fixed' | 'regression' | 'not-fixed' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const decisions = [
    {
      value: 'fixed' as const,
      label: 'Completamente Solucionado',
      icon: '✅',
      color: 'success',
      description: 'El bug fue resuelto correctamente'
    },
    {
      value: 'regression' as const,
      label: 'Provocó Regresión',
      icon: '⚠️',
      color: 'warning',
      description: 'La solución causó nuevos problemas'
    },
    {
      value: 'not-fixed' as const,
      label: 'No se Solucionó',
      icon: '❌',
      color: 'danger',
      description: 'El bug persiste'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedDecision) {
      setError('Por favor, selecciona una decisión');
      return;
    }

    if (!comment.trim()) {
      setError('El comentario es obligatorio');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.patch(`/bug-reports/${bugId}/tester-decision`, {
        decision: selectedDecision,
        comment: comment.trim()
      });

      onDecisionMade();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al enviar la decisión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tester-decision-panel">
      <h3 className="decision-title">Evaluación del Bug</h3>
      <p className="decision-subtitle">
        Por favor, evalúa el bug y selecciona la opción que mejor describa el resultado de tus pruebas:
      </p>

      <div className="decision-options">
        {decisions.map((decision) => (
          <button
            key={decision.value}
            className={`decision-option ${selectedDecision === decision.value ? 'selected' : ''} decision-${decision.color}`}
            onClick={() => setSelectedDecision(decision.value)}
            disabled={isSubmitting}
          >
            <span className="decision-icon">{decision.icon}</span>
            <div className="decision-content">
              <span className="decision-label">{decision.label}</span>
              <span className="decision-description">{decision.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="decision-comment">
        <label htmlFor="tester-comment">
          Comentario <span className="required">*</span>
        </label>
        <textarea
          id="tester-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe detalladamente el resultado de tus pruebas..."
          rows={4}
          disabled={isSubmitting}
          className={error && !comment.trim() ? 'error' : ''}
        />
      </div>

      {error && <div className="decision-error">{error}</div>}

      <div className="decision-actions">
        <button
          className="btn-submit-decision"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedDecision || !comment.trim()}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Evaluación'}
        </button>
      </div>
    </div>
  );
};

export default TesterDecisionPanel;
