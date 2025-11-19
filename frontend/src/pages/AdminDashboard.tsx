import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import BugReportDetailModal from '../components/BugReportDetailModal'
import BugReportFilters, { FilterValues } from '../components/BugReportFilters'
import Pagination from '../components/Pagination'
import BugReportStats from '../components/BugReportStats'
import './AdminDashboard.css'

interface Application {
  _id: string
  name: string
  description: string
  version: string
  platform: string
  assignedQAs: any[]
}

interface QAUser {
  _id: string
  name: string
  email: string
}

interface BugReport {
  _id: string
  title: string
  severity: string
  status: string
  application: { name: string; version: string }
  reportedBy: { name: string }
  createdAt: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'applications' | 'reports' | 'qa-users' | 'statistics'>('applications')
  const [applications, setApplications] = useState<Application[]>([])
  const [qaUsers, setQAUsers] = useState<QAUser[]>([])
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showQAModal, setShowQAModal] = useState(false)
  const [showAppsModal, setShowAppsModal] = useState(false)
  const [selectedQAApps, setSelectedQAApps] = useState<Application[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  // Estados para filtros y paginación
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    severity: [],
    status: [],
    application: '',
    dateFrom: '',
    dateTo: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    platform: '',
    assignedQAs: [] as string[],
  })
  const [qaFormData, setQAFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    loadApplications()
    loadQAUsers()
    loadBugReports()
  }, [])

  const loadApplications = async () => {
    try {
      const response = await api.get('/applications')
      setApplications(response.data)
    } catch (error) {
      console.error('Error al cargar aplicaciones', error)
    }
  }

  const loadQAUsers = async () => {
    try {
      const response = await api.get('/qa-users')
      setQAUsers(response.data)
    } catch (error) {
      console.error('Error al cargar usuarios QA', error)
    }
  }

  const loadBugReports = async () => {
    try {
      const response = await api.get('/bug-reports')
      setBugReports(response.data)
    } catch (error) {
      console.error('Error al cargar reportes', error)
    }
  }

  // Filtrar y paginar reportes
  const filteredAndPaginatedReports = useMemo(() => {
    let filtered = [...bugReports]

    // Búsqueda por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchLower) ||
          (report as any).description?.toLowerCase().includes(searchLower) ||
          (report as any).consoleErrors?.toLowerCase().includes(searchLower) ||
          (report as any).queries?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por severidad
    if (filters.severity.length > 0) {
      filtered = filtered.filter((report) =>
        filters.severity.includes(report.severity)
      )
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter((report) =>
        filters.status.includes(report.status)
      )
    }

    // Filtro por aplicación
    if (filters.application) {
      filtered = filtered.filter(
        (report) => (report.application as any)._id === filters.application
      )
    }

    // Filtro por fecha
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (report) => new Date(report.createdAt) >= new Date(filters.dateFrom)
      )
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      filtered = filtered.filter(
        (report) => new Date(report.createdAt) <= dateTo
      )
    }

    // Paginación
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedReports = filtered.slice(startIndex, endIndex)

    return {
      reports: paginatedReports,
      totalItems: filtered.length,
      totalPages
    }
  }, [bugReports, filters, currentPage, itemsPerPage])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      severity: [],
      status: [],
      application: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/applications', formData)
      setShowModal(false)
      setFormData({ name: '', description: '', version: '', platform: '', assignedQAs: [] })
      loadApplications()
    } catch (error) {
      console.error('Error al crear aplicación', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta aplicación?')) {
      try {
        await api.delete(`/applications/${id}`)
        loadApplications()
      } catch (error) {
        console.error('Error al eliminar aplicación', error)
      }
    }
  }

  const updateBugStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bug-reports/${id}/status`, { status })
      loadBugReports()
    } catch (error) {
      console.error('Error al actualizar estado', error)
    }
  }

  const handleQASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { ...qaFormData, role: 'qa' })
      setShowQAModal(false)
      setQAFormData({ name: '', email: '', password: '' })
      loadQAUsers()
      alert('Usuario QA registrado exitosamente')
    } catch (error: any) {
      console.error('Error al registrar QA', error)
      alert(error.response?.data?.message || 'Error al registrar usuario QA')
    }
  }

  const handleDeleteQA = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario QA? Se removerá de todas las aplicaciones asignadas.')) {
      try {
        await api.delete(`/qa-users/${id}`)
        loadQAUsers()
        loadApplications() // Recargar aplicaciones para actualizar contadores
        alert('Usuario QA eliminado exitosamente')
      } catch (error: any) {
        console.error('Error al eliminar QA', error)
        alert(error.response?.data?.message || 'Error al eliminar usuario QA')
      }
    }
  }

  const viewQAApplications = (qaId: string) => {
    const assignedApps = applications.filter(app =>
      app.assignedQAs.some((qa: any) => qa._id === qaId || qa === qaId)
    )
    setSelectedQAApps(assignedApps)
    setShowAppsModal(true)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel Administrativo</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.name}</span>
          <button onClick={logout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Aplicaciones
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reportes de Bugs
          </button>
          <button
            className={`tab ${activeTab === 'qa-users' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa-users')}
          >
            Usuarios QA
          </button>
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Estadísticas
          </button>
        </div>

        {activeTab === 'applications' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2>Gestión de Aplicaciones</h2>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                  Nueva Aplicación
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Versión</th>
                    <th>Plataforma</th>
                    <th>QAs Asignados</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.name}</td>
                      <td>{app.version}</td>
                      <td>{app.platform}</td>
                      <td>{app.assignedQAs?.length || 0}</td>
                      <td>
                        <button onClick={() => handleDelete(app._id)} className="btn btn-danger btn-sm">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="card">
              <h2>Todos los Reportes de Bugs</h2>

              {/* Filtros */}
              <BugReportFilters
                filters={filters}
                applications={applications}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                resultsCount={filteredAndPaginatedReports.totalItems}
              />

              <table className="table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Aplicación</th>
                    <th>Reportado por</th>
                    <th>Severidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndPaginatedReports.reports.map((report) => (
                    <tr key={report._id}>
                      <td>{report.title}</td>
                      <td>{report.application.name} v{report.application.version}</td>
                      <td>{report.reportedBy.name}</td>
                      <td>
                        <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${report.status}`}>{report.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedReportId(report._id)}
                          className="btn btn-primary btn-sm"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Ver Detalles
                        </button>
                        <select
                          value={report.status}
                          onChange={(e) => updateBugStatus(report._id, e.target.value)}
                          className="form-control"
                          style={{ display: 'inline-block', width: 'auto' }}
                        >
                          <option value="open">Abierto</option>
                          <option value="in-progress">En Progreso</option>
                          <option value="resolved">Resuelto</option>
                          <option value="pending-test">Por Testear</option>
                          <option value="closed">Cerrado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              {filteredAndPaginatedReports.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={filteredAndPaginatedReports.totalPages}
                  totalItems={filteredAndPaginatedReports.totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'qa-users' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2>Gestión de Usuarios QA</h2>
                <button onClick={() => setShowQAModal(true)} className="btn btn-primary">
                  Registrar QA
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Aplicaciones Asignadas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {qaUsers.map((qa) => {
                    const assignedAppsCount = applications.filter(app =>
                      app.assignedQAs.some((assignedQA: any) => assignedQA._id === qa._id || assignedQA === qa._id)
                    ).length
                    return (
                      <tr key={qa._id}>
                        <td>{qa.name}</td>
                        <td>{qa.email}</td>
                        <td>{assignedAppsCount}</td>
                        <td>
                          <button
                            onClick={() => viewQAApplications(qa._id)}
                            className="btn btn-info btn-sm"
                            style={{ marginRight: '8px' }}
                          >
                            Ver Apps
                          </button>
                          <button
                            onClick={() => handleDeleteQA(qa._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dashboard de Estadísticas */}
        {activeTab === 'statistics' && (
          <div className="tab-content">
            <BugReportStats />
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Nueva Aplicación</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <label className="form-label">Versión</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plataforma</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Asignar QAs</label>
                  <select
                    multiple
                    className="form-control"
                    value={formData.assignedQAs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedQAs: Array.from(e.target.selectedOptions, (option) => option.value),
                      })
                    }
                  >
                    {qaUsers.map((qa) => (
                      <option key={qa._id} value={qa._id}>
                        {qa.name} ({qa.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showQAModal && (
          <div className="modal-overlay" onClick={() => setShowQAModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Registrar Nuevo Usuario QA</h2>
              <form onSubmit={handleQASubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={qaFormData.name}
                    onChange={(e) => setQAFormData({ ...qaFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={qaFormData.email}
                    onChange={(e) => setQAFormData({ ...qaFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={qaFormData.password}
                    onChange={(e) => setQAFormData({ ...qaFormData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <small className="form-text">Mínimo 6 caracteres</small>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowQAModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAppsModal && (
          <div className="modal-overlay" onClick={() => setShowAppsModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Aplicaciones Asignadas</h2>
              {selectedQAApps.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Versión</th>
                      <th>Plataforma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQAApps.map((app) => (
                      <tr key={app._id}>
                        <td>{app.name}</td>
                        <td>{app.version}</td>
                        <td>{app.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Este usuario QA no tiene aplicaciones asignadas.</p>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAppsModal(false)} className="btn btn-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles del Reporte */}
        {selectedReportId && (
          <BugReportDetailModal
            reportId={selectedReportId}
            onClose={() => setSelectedReportId(null)}
            onUpdate={loadBugReports}
          />
        )}
      </div>
    </div>
  )
}
