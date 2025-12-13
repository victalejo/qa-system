import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { pageTransition } from './lib/animations'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import QADashboard from './pages/QADashboard'

function AnimatedRoutes() {
  const location = useLocation()
  const { user } = useAuthStore()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            !user ? (
              <motion.div
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Login />
              </motion.div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : (
              <motion.div
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {user.role === 'admin' ? <AdminDashboard /> : <QADashboard />}
              </motion.div>
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
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
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4000}
        theme={theme}
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
      <AnimatedRoutes />
    </Router>
  )
}

export default App
