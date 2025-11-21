import { useState, useEffect } from 'react'
import api from '../lib/api'

interface UserProfile {
  _id: string
  name: string
  email: string
  whatsappNumber?: string
  notificationPreferences?: {
    email: boolean
    whatsapp: boolean
  }
}

interface NotificationPreferencesProps {
  onClose: () => void
}

export default function NotificationPreferences({ onClose }: NotificationPreferencesProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingWhatsapp, setTestingWhatsapp] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.get('/qa-users/profile')
      const user = response.data
      setProfile(user)
      setEmailEnabled(user.notificationPreferences?.email ?? true)
      setWhatsappEnabled(user.notificationPreferences?.whatsapp ?? true)
      setWhatsappNumber(user.whatsappNumber || '')
    } catch (error) {
      console.error('Error al cargar perfil', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      await api.patch('/qa-users/preferences', {
        email: emailEnabled,
        whatsapp: whatsappEnabled,
        whatsappNumber: whatsappNumber
      })
      setMessage('Preferencias guardadas correctamente')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error al guardar preferencias', error)
      setMessage('Error al guardar preferencias')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    setMessage('')

    try {
      const response = await api.post('/qa-users/test-email')
      setMessage(`Email enviado a: ${response.data.email}`)
      setTimeout(() => setMessage(''), 5000)
    } catch (error: any) {
      console.error('Error al enviar email de prueba', error)
      setMessage(error.response?.data?.message || 'Error al enviar email de prueba')
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestWhatsapp = async () => {
    setTestingWhatsapp(true)
    setMessage('')

    try {
      const response = await api.post('/qa-users/test-whatsapp')
      setMessage(`WhatsApp enviado a: ${response.data.whatsappNumber}`)
      setTimeout(() => setMessage(''), 5000)
    } catch (error: any) {
      console.error('Error al enviar WhatsApp de prueba', error)
      setMessage(error.response?.data?.message || 'Error al enviar WhatsApp de prueba')
    } finally {
      setTestingWhatsapp(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Preferencias de Notificacion</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Configura como deseas recibir las notificaciones del sistema.
        </p>

        {message && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: message.includes('Error') ? '#fee2e2' : '#d1fae5',
            color: message.includes('Error') ? '#dc2626' : '#059669'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#374151' }}>Canales de Notificacion</h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: '500' }}>Notificaciones por Email</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Recibir notificaciones en: {profile?.email}
                </div>
              </div>
            </label>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: testingEmail ? 'not-allowed' : 'pointer'
              }}
            >
              {testingEmail ? 'Enviando...' : 'Probar Email'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: '500' }}>Notificaciones por WhatsApp</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Recibir mensajes de WhatsApp con actualizaciones
                </div>
              </div>
            </label>
            <button
              type="button"
              onClick={handleTestWhatsapp}
              disabled={testingWhatsapp || !whatsappNumber}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: (testingWhatsapp || !whatsappNumber) ? 'not-allowed' : 'pointer'
              }}
            >
              {testingWhatsapp ? 'Enviando...' : 'Probar WhatsApp'}
            </button>
          </div>
        </div>

        {whatsappEnabled && (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Numero de WhatsApp</label>
            <input
              type="tel"
              className="form-control"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="573001234567"
            />
            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Formato: codigo pais + numero (ej: 573001234567)
            </small>
          </div>
        )}

        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          borderLeft: '4px solid #2563eb'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Recibiras notificaciones cuando:</div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#4b5563', fontSize: '0.875rem' }}>
            <li>Una aplicacion asignada a ti sea actualizada</li>
            <li>Un bug que reportaste este listo para testear</li>
          </ul>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Preferencias'}
          </button>
        </div>
      </div>
    </div>
  )
}
