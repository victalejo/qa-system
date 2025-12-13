import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'
import './DraggableWidget.css'

export interface WidgetProps {
  id: string
  title: string
  children: ReactNode
  onRemove?: (id: string) => void
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function DraggableWidget({
  id,
  title,
  children,
  onRemove,
  collapsible = true,
  defaultCollapsed = false
}: WidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`draggable-widget ${isDragging ? 'is-dragging' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}
      layout
    >
      <div className="widget-header">
        <button
          className="widget-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Arrastrar widget"
        >
          <GripVertical size={16} />
        </button>
        <h3 className="widget-title">{title}</h3>
        <div className="widget-actions">
          {collapsible && (
            <button
              className="widget-action-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
            >
              {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
          )}
          {onRemove && (
            <button
              className="widget-action-btn widget-remove"
              onClick={() => onRemove(id)}
              aria-label="Eliminar widget"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <motion.div
          className="widget-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

export default DraggableWidget
