import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface UseTableSortOptions<T> {
  data: T[]
  initialSort?: SortConfig
}

export interface UseTableSortReturn<T> {
  sortedData: T[]
  sortConfig: SortConfig | null
  requestSort: (key: string) => void
  clearSort: () => void
  getSortDirection: (key: string) => SortDirection
}

export function useTableSort<T extends Record<string, any>>({
  data,
  initialSort,
}: UseTableSortOptions<T>): UseTableSortReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null)

  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.direction) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const dateA = new Date(aValue)
        const dateB = new Date(bValue)
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return sortConfig.direction === 'asc'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime()
        }
      }

      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'es', { sensitivity: 'base' })
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Default comparison
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const requestSort = useCallback((key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null // Third click clears sort
    })
  }, [])

  const clearSort = useCallback(() => {
    setSortConfig(null)
  }, [])

  const getSortDirection = useCallback(
    (key: string): SortDirection => {
      if (!sortConfig || sortConfig.key !== key) return null
      return sortConfig.direction
    },
    [sortConfig]
  )

  return {
    sortedData,
    sortConfig,
    requestSort,
    clearSort,
    getSortDirection,
  }
}

export default useTableSort
