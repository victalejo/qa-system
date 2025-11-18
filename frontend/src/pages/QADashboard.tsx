import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import './QADashboard.css'

interface Application {
  _id: string
  name: string
  description: string
  version: string
  platform: string
}

interface BugReport {
  _id: string
  title: string
  severity: string
  status: string
  description: string
  createdAt: string
}

export default function QADashboard() {
  const { user, logout } = useAuthStore()
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState<string>('')
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium',
    environment: '',
  })

  useEffect(() => {
    loadMyApplications()
    loadMyReports()
  }, [])

  const loadMyApplications = async () => {
    try {
      const response = await api.get('/qa-users/my-applications')
      setApplications(response.data)
    } catch (error) {
      console.error('Error al cargar aplicaciones', error)
    }
  }

  const loadMyReports = async () => {
    try {
      const response = await api.get('/bug-reports')
      setBugReports(response.data)
    } catch (error) {
      console.error('Error al cargar reportes', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) {
      alert('Por favor selecciona una aplicación')
      return
    }

    try {
      await api.post('/bug-reports', {
        ...formData,
        application: selectedApp,
      })
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        severity: 'medium',
        environment: '',
      })
      loadMyReports()
    } catch (error) {
      console.error('Error al crear reporte', error)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel QA</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.name}</span>
          <button onClick={logout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2>Mis Aplicaciones Asignadas</h2>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Nuevo Reporte de Bug
            </button>
          </div>

          <div className="applications-grid">
            {applications.map((app) => (
              <div key={app._id} className="application-card">
                <h3>{app.name}</h3>
                <p>{app.description}</p>
                <div className="app-info">
                  <span>Versión: {app.version}</span>
                  <span>Plataforma: {app.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Mis Reportes de Bugs</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {bugReports.map((report) => (
                <tr key={report._id}>
                  <td>{report.title}</td>
                  <td>
                    <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.status}`}>{report.status}</span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Nuevo Reporte de Bug</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Aplicación</label>
                  <select
                    className="form-control"
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una aplicación</option>
                    {applications.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.name} v{app.version}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pasos para Reproducir</label>
                  <textarea
                    className="form-control"
                    value={formData.stepsToReproduce}
                    onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Comportamiento Esperado</label>
                  <textarea
                    className="form-control"
                    value={formData.expectedBehavior}
                    onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Comportamiento Actual</label>
                  <textarea
                    className="form-control"
                    value={formData.actualBehavior}
                    onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Severidad</label>
                  <select
                    className="form-control"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    required
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Entorno</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Windows 10, Chrome 120"
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear Reporte
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
