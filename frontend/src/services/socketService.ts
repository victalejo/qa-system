import { io, Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface SocketEvents {
  // Bug report events
  'bug:created': (data: { bugId: string; title: string; reportedBy: string }) => void
  'bug:updated': (data: { bugId: string; changes: Record<string, any> }) => void
  'bug:statusChanged': (data: { bugId: string; status: string; changedBy: string }) => void
  'bug:commented': (data: { bugId: string; comment: any }) => void

  // Presence events
  'presence:userJoined': (data: { bugId: string; user: any }) => void
  'presence:userLeft': (data: { bugId: string; userId: string }) => void
  'presence:viewers': (data: { bugId: string; viewers: any[] }) => void

  // Notification events
  'notification:new': (data: any) => void
}

class SocketService {
  private socket: Socket | null = null
  private currentBugId: string | null = null

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.currentBugId = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getSocket(): Socket | null {
    return this.socket
  }

  // Join a bug report room for real-time updates
  joinBugRoom(bugId: string): void {
    if (!this.socket?.connected) return

    // Leave previous room if any
    if (this.currentBugId && this.currentBugId !== bugId) {
      this.leaveBugRoom(this.currentBugId)
    }

    this.socket.emit('bug:join', { bugId })
    this.currentBugId = bugId
  }

  // Leave a bug report room
  leaveBugRoom(bugId: string): void {
    if (!this.socket?.connected) return

    this.socket.emit('bug:leave', { bugId })
    if (this.currentBugId === bugId) {
      this.currentBugId = null
    }
  }

  // Emit a new comment
  emitComment(bugId: string, comment: string): void {
    if (!this.socket?.connected) return

    this.socket.emit('bug:comment', { bugId, comment })
  }

  // Subscribe to an event
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    this.socket?.on(event, callback as any)
  }

  // Unsubscribe from an event
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (callback) {
      this.socket?.off(event, callback as any)
    } else {
      this.socket?.off(event)
    }
  }

  // Emit a custom event
  emit(event: string, data?: any): void {
    this.socket?.emit(event, data)
  }
}

// Singleton instance
export const socketService = new SocketService()

export default socketService
