import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import './MobileNav.css'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  active?: boolean
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  title?: string
}

export function MobileNav({ isOpen, onClose, items, title }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="mobile-nav"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mobile-nav-header">
              <div className="mobile-nav-handle" />
              {title && <h3 className="mobile-nav-title">{title}</h3>}
              <button className="mobile-nav-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-nav-items">
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`mobile-nav-item ${item.active ? 'active' : ''}`}
                  onClick={() => {
                    item.onClick()
                    onClose()
                  }}
                >
                  <span className="mobile-nav-item-icon">{item.icon}</span>
                  <span className="mobile-nav-item-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileNav
