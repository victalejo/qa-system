import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import './BulkActions.css'

interface BulkAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'danger' | 'success' | 'warning'
  onClick: () => void
}

interface BulkActionsProps {
  selectedCount: number
  onClear: () => void
  actions: BulkAction[]
}

const variantIcons = {
  primary: null,
  danger: <Trash2 size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
}

export function BulkActions({ selectedCount, onClear, actions }: BulkActionsProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          className="bulk-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bulk-actions-info">
            <span className="bulk-actions-count">{selectedCount}</span>
            <span className="bulk-actions-label">
              {selectedCount === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}
            </span>
            <button className="bulk-actions-clear" onClick={onClear} title="Limpiar selección">
              <X size={16} />
            </button>
          </div>

          <div className="bulk-actions-buttons">
            {actions.map((action) => (
              <button
                key={action.id}
                className={`bulk-action-btn bulk-action-${action.variant || 'primary'}`}
                onClick={action.onClick}
              >
                {action.icon || variantIcons[action.variant || 'primary']}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BulkActions
