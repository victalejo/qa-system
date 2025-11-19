import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import BugReportWizard from '../components/BugReportWizard'
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
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [showWizard, setShowWizard] = useState(false)

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

  const handleWizardSuccess = () => {
    loadMyReports()
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
            <button onClick={() => setShowWizard(true)} className="btn btn-primary">
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

        {showWizard && (
          <BugReportWizard
            applications={applications}
            onClose={() => setShowWizard(false)}
            onSuccess={handleWizardSuccess}
          />
        )}
      </div>
    </div>
  )
}
