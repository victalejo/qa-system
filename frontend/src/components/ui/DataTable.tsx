import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SortableHeader } from './SortableHeader'
import { BulkActions } from './BulkActions'
import { useTableSort } from '../../hooks/useTableSort'
import { useTableSelection } from '../../hooks/useTableSelection'
import { Skeleton } from './Skeleton'
import './DataTable.css'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render?: (item: T, index: number) => ReactNode
}

export interface BulkAction {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'primary' | 'danger' | 'success' | 'warning'
  onClick: (selectedIds: string[]) => void
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getRowId: (item: T) => string
  selectable?: boolean
  sortable?: boolean
  bulkActions?: BulkAction[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  rowClassName?: (item: T) => string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  selectable = false,
  sortable = true,
  bulkActions = [],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const { sortedData, requestSort, getSortDirection } = useTableSort({ data })

  const {
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection,
  } = useTableSelection({
    data: sortedData,
    getItemId: getRowId,
  })

  const handleBulkAction = (action: BulkAction) => {
    action.onClick(Array.from(selectedIds))
    clearSelection()
  }

  // Skeleton rows para loading
  if (loading) {
    return (
      <div className="data-table-container">
        <table className="table data-table">
          <thead>
            <tr>
              {selectable && <th style={{ width: '40px' }}></th>}
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  <Skeleton height={14} width="60%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {selectable && (
                  <td>
                    <Skeleton height={16} width={16} variant="rectangular" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key}>
                    <Skeleton height={16} width={col.key === columns[0].key ? '80%' : '60%'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="data-table-container">
      <table className="table data-table">
        <thead>
          <tr>
            {selectable && (
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate
                  }}
                  onChange={toggleAll}
                  className="table-checkbox"
                />
              </th>
            )}
            {columns.map((col) => {
              if (sortable && col.sortable !== false) {
                return (
                  <SortableHeader
                    key={col.key}
                    label={col.header}
                    sortKey={col.key}
                    direction={getSortDirection(col.key)}
                    onSort={requestSort}
                  />
                )
              }
              return (
                <th key={col.key} style={{ width: col.width }}>
                  {col.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="empty-message">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const id = getRowId(item)
                const selected = isSelected(id)
                const customClass = rowClassName?.(item) || ''

                return (
                  <motion.tr
                    key={id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`${selected ? 'selected' : ''} ${onRowClick ? 'clickable' : ''} ${customClass}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleItem(id)}
                          className="table-checkbox"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(item, index) : item[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                )
              })
            )}
          </AnimatePresence>
        </tbody>
      </table>

      {selectable && bulkActions.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.size}
          onClear={clearSelection}
          actions={bulkActions.map((action) => ({
            ...action,
            onClick: () => handleBulkAction(action),
          }))}
        />
      )}
    </div>
  )
}

export default DataTable
