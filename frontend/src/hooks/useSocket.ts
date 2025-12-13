import { useEffect, useCallback, useState } from 'react'
import { socketService, SocketEvents } from '../services/socketService'
import { useAuthStore } from '../store/authStore'

export function useSocket() {
  const { token } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token) {
      socketService.disconnect()
      setIsConnected(false)
      return
    }

    const socket = socketService.connect(token)

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    // Set initial state
    setIsConnected(socket.connected)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [token])

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ) => {
    socketService.on(event, callback)
  }, [])

  const off = useCallback(<K extends keyof SocketEvents>(
    event: K,
    callback?: SocketEvents[K]
  ) => {
    socketService.off(event, callback)
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data)
  }, [])

  return {
    isConnected,
    on,
    off,
    emit,
    socket: socketService.getSocket(),
  }
}

// Hook para suscribirse a actualizaciones de un bug específico
export function useBugRealtime(bugId: string | null) {
  const { isConnected } = useSocket()
  const [viewers, setViewers] = useState<any[]>([])

  useEffect(() => {
    if (!bugId || !isConnected) return

    socketService.joinBugRoom(bugId)

    // Suscribirse a eventos de presencia
    const handleViewers = (data: { bugId: string; viewers: any[] }) => {
      if (data.bugId === bugId) {
        setViewers(data.viewers)
      }
    }

    socketService.on('presence:viewers', handleViewers)

    return () => {
      socketService.leaveBugRoom(bugId)
      socketService.off('presence:viewers', handleViewers)
      setViewers([])
    }
  }, [bugId, isConnected])

  return { viewers, isConnected }
}

export default useSocket
