import { useEffect, useCallback } from 'react'

type ShortcutHandler = () => void

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: ShortcutHandler
  description?: string
}

export function useKeyboardShortcut(
  key: string,
  handler: ShortcutHandler,
  options: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  const { ctrl = false, meta = false, shift = false, alt = false } = options

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      // Si se requiere ctrl/meta, verificar el modificador correcto
      if ((ctrl || meta) && !modifierKey) return
      if (shift && !event.shiftKey) return
      if (alt && !event.altKey) return

      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, handler, ctrl, meta, shift, alt])
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

      for (const shortcut of shortcuts) {
        const modifierKey = isMac ? event.metaKey : event.ctrlKey
        const needsModifier = shortcut.ctrl || shortcut.meta

        if (needsModifier && !modifierKey) continue
        if (shortcut.shift && !event.shiftKey) continue
        if (shortcut.alt && !event.altKey) continue

        if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export default useKeyboardShortcut
