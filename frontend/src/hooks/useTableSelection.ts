import { useState, useCallback, useMemo } from 'react'

export interface UseTableSelectionOptions<T> {
  data: T[]
  getItemId: (item: T) => string
}

export interface UseTableSelectionReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  isIndeterminate: boolean
  toggleItem: (id: string) => void
  toggleAll: () => void
  selectAll: () => void
  clearSelection: () => void
  selectItems: (ids: string[]) => void
  selectedCount: number
}

export function useTableSelection<T>({
  data,
  getItemId,
}: UseTableSelectionOptions<T>): UseTableSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allIds = useMemo(() => data.map(getItemId), [data, getItemId])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const isAllSelected = useMemo(
    () => allIds.length > 0 && allIds.every((id) => selectedIds.has(id)),
    [allIds, selectedIds]
  )

  const isIndeterminate = useMemo(
    () => selectedIds.size > 0 && !isAllSelected,
    [selectedIds.size, isAllSelected]
  )

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }, [isAllSelected, allIds])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds))
  }, [allIds])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectItems = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    selectAll,
    clearSelection,
    selectItems,
    selectedCount: selectedIds.size,
  }
}

export default useTableSelection
