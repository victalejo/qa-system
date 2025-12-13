import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import QADashboard from './pages/QADashboard'

function App() {
  const { user } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    // Aplicar tema al documento
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    // Detectar preferencia del sistema solo al inicio si no hay preferencia guardada
    const savedTheme = localStorage.getItem('theme-storage')
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [setTheme])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <QADashboard />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
