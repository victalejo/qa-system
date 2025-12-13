import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { modalOverlay, modalContent } from '../../lib/animations'
import { X } from 'lucide-react'

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-width: 400px',
  md: 'max-width: 500px',
  lg: 'max-width: 700px',
  xl: 'max-width: 900px',
  full: 'max-width: 95vw',
}

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          variants={modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={closeOnOverlayClick ? onClose : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <motion.div
            className={`modal-content ${className}`}
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              ...(sizeClasses[size] ? { maxWidth: sizeClasses[size].split(': ')[1] } : {}),
            }}
          >
            {(title || showCloseButton) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) var(--space-6)',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                {title && (
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                    aria-label="Cerrar"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            <div style={{ padding: 'var(--space-6)' }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedModal
