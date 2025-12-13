import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bug,
  Moon,
  Sun,
  LogOut,
  BarChart3,
  Users,
  AppWindow,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcuts'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import './CommandPalette.css'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  category: 'navigation' | 'action' | 'settings'
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (path: string) => void
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { theme, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()

  // Definir comandos disponibles
  const commands: CommandItem[] = useMemo(() => {
    const baseCommands: CommandItem[] = [
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
        description: 'Alternar entre tema claro y oscuro',
        icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
        action: () => {
          toggleTheme()
          onClose()
        },
        keywords: ['tema', 'theme', 'dark', 'light', 'oscuro', 'claro'],
        category: 'settings',
      },
      {
        id: 'logout',
        label: 'Cerrar sesión',
        description: 'Salir de la cuenta actual',
        icon: <LogOut size={18} />,
        action: () => {
          logout()
          onClose()
        },
        keywords: ['logout', 'salir', 'cerrar', 'sesion'],
        category: 'action',
      },
    ]

    // Comandos específicos para admin
    if (user?.role === 'admin') {
      baseCommands.push(
        {
          id: 'nav-apps',
          label: 'Ir a Aplicaciones',
          description: 'Gestionar aplicaciones',
          icon: <AppWindow size={18} />,
          action: () => {
            onNavigate?.('applications')
            onClose()
          },
          keywords: ['aplicaciones', 'apps', 'gestionar'],
          category: 'navigation',
        },
        {
          id: 'nav-reports',
          label: 'Ir a Reportes de Bugs',
          description: 'Ver todos los reportes',
          icon: <Bug size={18} />,
          action: () => {
            onNavigate?.('reports')
            onClose()
          },
          keywords: ['reportes', 'bugs', 'errores'],
          category: 'navigation',
        },
        {
          id: 'nav-qa-users',
          label: 'Ir a Usuarios QA',
          description: 'Gestionar usuarios QA',
          icon: <Users size={18} />,
          action: () => {
            onNavigate?.('qa-users')
            onClose()
          },
          keywords: ['usuarios', 'qa', 'testers'],
          category: 'navigation',
        },
        {
          id: 'nav-stats',
          label: 'Ir a Estadísticas',
          description: 'Ver estadísticas y gráficos',
          icon: <BarChart3 size={18} />,
          action: () => {
            onNavigate?.('statistics')
            onClose()
          },
          keywords: ['estadisticas', 'graficos', 'stats', 'analytics'],
          category: 'navigation',
        }
      )
    }

    // Comandos específicos para QA
    if (user?.role === 'qa') {
      baseCommands.push({
        id: 'new-report',
        label: 'Nuevo Reporte de Bug',
        description: 'Crear un nuevo reporte',
        icon: <Bug size={18} />,
        action: () => {
          onNavigate?.('new-report')
          onClose()
        },
        keywords: ['nuevo', 'reporte', 'bug', 'crear'],
        category: 'action',
      })
    }

    return baseCommands
  }, [theme, user, toggleTheme, logout, onClose, onNavigate])

  // Filtrar comandos según la búsqueda
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const lowerQuery = query.toLowerCase()
    return commands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(lowerQuery)
      const matchDescription = cmd.description?.toLowerCase().includes(lowerQuery)
      const matchKeywords = cmd.keywords?.some((kw) => kw.includes(lowerQuery))
      return matchLabel || matchDescription || matchKeywords
    })
  }, [commands, query])

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Reset selected index cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands.length])

  // Scroll al elemento seleccionado
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const selectedElement = list.children[selectedIndex] as HTMLElement
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  // Agrupar comandos por categoría
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      settings: [],
    }

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })

    return groups
  }, [filteredCommands])

  const categoryLabels: Record<string, string> = {
    navigation: 'Navegación',
    action: 'Acciones',
    settings: 'Configuración',
  }

  let globalIndex = -1

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="command-palette-header">
              <Search size={20} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar comandos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="command-palette-input"
              />
              <kbd className="shortcut-hint">ESC</kbd>
            </div>

            <div className="command-palette-list" ref={listRef}>
              {filteredCommands.length === 0 ? (
                <div className="command-palette-empty">
                  <FileText size={40} />
                  <p>No se encontraron comandos</p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => {
                  if (items.length === 0) return null

                  return (
                    <div key={category} className="command-group">
                      <div className="command-group-label">{categoryLabels[category]}</div>
                      {items.map((command) => {
                        globalIndex++
                        const currentIndex = globalIndex

                        return (
                          <div
                            key={command.id}
                            className={`command-item ${selectedIndex === currentIndex ? 'selected' : ''}`}
                            onClick={() => command.action()}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                          >
                            <div className="command-item-icon">{command.icon}</div>
                            <div className="command-item-content">
                              <span className="command-item-label">{command.label}</span>
                              {command.description && (
                                <span className="command-item-description">{command.description}</span>
                              )}
                            </div>
                            <ArrowRight size={16} className="command-item-arrow" />
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            <div className="command-palette-footer">
              <span>
                <kbd>↑</kbd> <kbd>↓</kbd> navegar
              </span>
              <span>
                <kbd>↵</kbd> seleccionar
              </span>
              <span>
                <kbd>ESC</kbd> cerrar
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para usar el Command Palette fácilmente
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useKeyboardShortcut('k', () => setIsOpen(true), { meta: true })

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return { isOpen, open, close, toggle }
}

export default CommandPalette
