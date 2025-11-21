import { useState } from 'react'
import api from '../lib/api'

interface UpdateVersionModalProps {
  application: {
    _id: string
    name: string
    version: string
  }
  onClose: () => void
  onUpdate: () => void
}

export default function UpdateVersionModal({ application, onClose, onUpdate }: UpdateVersionModalProps) {
  const [version, setVersion] = useState('')
  const [changelog, setChangelog] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.patch(`/applications/${application._id}/version`, {
        version,
        changelog
      })
      alert('Version actualizada. Se han enviado notificaciones a los QAs asignados.')
      onUpdate()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar version')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Actualizar Version</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Aplicacion: <strong>{application.name}</strong>
        </p>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Version actual: <strong>{application.version}</strong>
        </p>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nueva Version</label>
            <input
              type="text"
              className="form-control"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ej: 2.0.0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notas de la Version (Changelog)</label>
            <textarea
              className="form-control"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe los cambios realizados en esta version..."
              rows={5}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar y Notificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
