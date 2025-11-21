import { useState, useEffect } from 'react'
import api from '../lib/api'

interface VersionHistory {
  _id: string
  version: string
  previousVersion: string
  changelog: string
  updatedBy: {
    name: string
    email: string
  }
  createdAt: string
}

interface VersionHistoryModalProps {
  application: {
    _id: string
    name: string
    version: string
  }
  onClose: () => void
}

export default function VersionHistoryModal({ application, onClose }: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<VersionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVersionHistory()
  }, [application._id])

  const loadVersionHistory = async () => {
    try {
      const response = await api.get(`/applications/${application._id}/versions`)
      setVersions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <h2>Historial de Versiones</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Aplicacion: <strong>{application.name}</strong> | Version actual: <strong>{application.version}</strong>
        </p>

        {loading && <p>Cargando historial...</p>}

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {!loading && !error && versions.length === 0 && (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No hay historial de versiones para esta aplicacion.
          </p>
        )}

        {!loading && versions.length > 0 && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {versions.map((vh, index) => (
              <div
                key={vh._id}
                style={{
                  borderLeft: '3px solid #2563eb',
                  paddingLeft: '1rem',
                  marginBottom: '1.5rem',
                  backgroundColor: index === 0 ? '#f0f9ff' : 'transparent',
                  padding: '1rem',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2563eb' }}>
                    v{vh.version}
                    {index === 0 && (
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Ultima
                      </span>
                    )}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {formatDate(vh.createdAt)}
                  </span>
                </div>

                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Anterior: v{vh.previousVersion} | Actualizado por: {vh.updatedBy?.name || 'Desconocido'}
                </div>

                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem'
                }}>
                  {vh.changelog}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
