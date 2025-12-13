import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { SortDirection } from '../../hooks/useTableSort'
import './SortableHeader.css'

interface SortableHeaderProps {
  label: string
  sortKey: string
  direction: SortDirection
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({
  label,
  sortKey,
  direction,
  onSort,
  className = '',
}: SortableHeaderProps) {
  return (
    <th
      className={`sortable-header ${direction ? 'sorted' : ''} ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="sortable-header-content">
        <span>{label}</span>
        <span className="sort-icon">
          {direction === 'asc' ? (
            <ArrowUp size={14} />
          ) : direction === 'desc' ? (
            <ArrowDown size={14} />
          ) : (
            <ArrowUpDown size={14} className="sort-icon-inactive" />
          )}
        </span>
      </div>
    </th>
  )
}

export default SortableHeader
