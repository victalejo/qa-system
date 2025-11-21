import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import ImageGallery from './ImageGallery';
import CommentSection from './CommentSection';
import TesterDecisionPanel from './TesterDecisionPanel';
import { useAuthStore } from '../store/authStore';
import './BugReportDetailModal.css';

interface BugReport {
  _id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending-test';
  application: {
    name: string;
    version: string;
  };
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  screenshots?: string[];
  environment: string;
  consoleErrors?: string;
  queries?: string;
  comments?: Array<{
    _id?: string;
    user: {
      name: string;
      email: string;
    };
    text: string;
    createdAt: string;
  }>;
  statusHistory?: Array<{
    status: string;
    changedBy: {
      name: string;
      email: string;
    };
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface BugReportDetailModalProps {
  reportId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const BugReportDetailModal: React.FC<BugReportDetailModalProps> = ({
  reportId,
  onClose,
  onUpdate
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [report, setReport] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/bug-reports/${reportId}`);
      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;

    setUpdatingStatus(true);
    try {
      const response = await api.patch(`/bug-reports/${report._id}/status`, {
        status: newStatus
      });
      setReport(response.data);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  const getSeverityLabel = (severity: string): string => {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[severity] || severity;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      open: 'Abierto',
      'in-progress': 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado',
      'pending-test': 'Por Testear'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-detail" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">
            <div className="spinner-large"></div>
            <p>Cargando reporte...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-detail" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">
            <p>{error || 'No se pudo cargar el reporte'}</p>
            <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-detail" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-detail-header">
          <div className="modal-detail-title-section">
            <h2>{report.title}</h2>
            <div className="modal-detail-badges">
              <span
                className="severity-badge"
                style={{ backgroundColor: getSeverityColor(report.severity) }}
              >
                {getSeverityLabel(report.severity)}
              </span>
              <span className={`status-badge status-${report.status}`}>
                {getStatusLabel(report.status)}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-detail-body">
          {/* Información General */}
          <section className="detail-section">
            <h3 className="detail-section-title">Información General</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Aplicación:</span>
                <span className="detail-value">
                  {report.application?.name || 'N/A'} v{report.application?.version || '?'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Reportado por:</span>
                <span className="detail-value">
                  {report.reportedBy?.name || 'Usuario desconocido'} ({report.reportedBy?.email || 'N/A'})
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Entorno:</span>
                <span className="detail-value">{report.environment}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de creación:</span>
                <span className="detail-value">{formatDate(report.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Última actualización:</span>
                <span className="detail-value">{formatDate(report.updatedAt)}</span>
              </div>
            </div>
          </section>

          {/* Descripción del Problema */}
          <section className="detail-section">
            <h3 className="detail-section-title">Descripción del Problema</h3>
            <div className="detail-content-box">
              <p>{report.description}</p>
            </div>
          </section>

          {/* Pasos para Reproducir */}
          <section className="detail-section">
            <h3 className="detail-section-title">Pasos para Reproducir</h3>
            <div className="detail-content-box">
              <pre className="detail-pre">{report.stepsToReproduce}</pre>
            </div>
          </section>

          {/* Comportamiento */}
          <section className="detail-section">
            <h3 className="detail-section-title">Comportamiento</h3>
            <div className="behavior-comparison">
              <div className="behavior-box expected">
                <h4>Esperado</h4>
                <p>{report.expectedBehavior}</p>
              </div>
              <div className="behavior-divider">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className="behavior-box actual">
                <h4>Actual</h4>
                <p>{report.actualBehavior}</p>
              </div>
            </div>
          </section>

          {/* Información Técnica */}
          {(report.consoleErrors || report.queries) && (
            <section className="detail-section">
              <h3 className="detail-section-title">Información Técnica</h3>

              {report.consoleErrors && (
                <div className="technical-block">
                  <h4 className="technical-title">Errores de Consola</h4>
                  <pre className="code-block">{report.consoleErrors}</pre>
                </div>
              )}

              {report.queries && (
                <div className="technical-block">
                  <h4 className="technical-title">Consultas/Queries</h4>
                  <pre className="code-block">{report.queries}</pre>
                </div>
              )}
            </section>
          )}

          {/* Evidencias */}
          {report.screenshots && report.screenshots.length > 0 && (
            <section className="detail-section">
              <h3 className="detail-section-title">Evidencias ({report.screenshots.length})</h3>
              <ImageGallery images={report.screenshots} />
            </section>
          )}

          {/* Gestión del Reporte */}
          <section className="detail-section">
            <h3 className="detail-section-title">Gestión del Reporte</h3>
            <div className="status-management">
              <label htmlFor="status-select" className="status-label">
                Cambiar Estado:
              </label>
              <select
                id="status-select"
                value={report.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus || currentUser?.role !== 'admin'}
                className="status-select"
              >
                <option value="open">Abierto</option>
                <option value="in-progress">En Progreso</option>
                <option value="resolved">Resuelto</option>
                {currentUser?.role === 'admin' && <option value="pending-test">Por Testear</option>}
                <option value="closed">Cerrado</option>
              </select>
              {updatingStatus && <span className="status-updating">Actualizando...</span>}
            </div>
          </section>

          {/* Panel de Decisión del Tester */}
          {report.status === 'pending-test' && currentUser?.id === report.reportedBy._id && (
            <section className="detail-section">
              <TesterDecisionPanel
                bugId={report._id}
                onDecisionMade={() => {
                  loadReport();
                  if (onUpdate) onUpdate();
                }}
              />
            </section>
          )}

          {/* Historial de Estados */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <section className="detail-section">
              <h3 className="detail-section-title">Historial de Estados</h3>
              <div className="status-timeline">
                {report.statusHistory.map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <span className={`timeline-status status-${history.status}`}>
                        {getStatusLabel(history.status)}
                      </span>
                      <span className="timeline-user">{history.changedBy?.name || 'Usuario desconocido'}</span>
                      <span className="timeline-date">{formatDate(history.changedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comentarios */}
          <section className="detail-section">
            <h3 className="detail-section-title">Comentarios</h3>
            <CommentSection
              reportId={report._id}
              comments={report.comments || []}
              onCommentAdded={loadReport}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="modal-detail-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BugReportDetailModal;
