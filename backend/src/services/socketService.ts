import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

interface UserPayload {
  id: string
  email: string
  role: string
  name: string
}

interface BugRoom {
  bugId: string
  viewers: Map<string, { id: string; name: string; email: string; joinedAt: Date }>
}

class SocketService {
  private io: Server | null = null
  private bugRooms: Map<string, BugRoom> = new Map()

  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
          : '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication required'))
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback-secret'
        ) as UserPayload

        socket.data.user = decoded
        next()
      } catch (error) {
        next(new Error('Invalid token'))
      }
    })

    this.io.on('connection', (socket) => {
      this.handleConnection(socket)
    })

    console.log('Socket.io initialized')
    return this.io
  }

  private handleConnection(socket: Socket): void {
    const user = socket.data.user as UserPayload
    console.log(`User connected: ${user.name} (${socket.id})`)

    // Join user to their personal room for notifications
    socket.join(`user:${user.id}`)

    // Bug room handlers
    socket.on('bug:join', ({ bugId }) => {
      this.joinBugRoom(socket, bugId)
    })

    socket.on('bug:leave', ({ bugId }) => {
      this.leaveBugRoom(socket, bugId)
    })

    socket.on('bug:comment', ({ bugId, comment }) => {
      this.broadcastComment(socket, bugId, comment)
    })

    socket.on('bug:typing', ({ bugId, isTyping }) => {
      socket.to(`bug:${bugId}`).emit('bug:userTyping', {
        bugId,
        userId: user.id,
        userName: user.name,
        isTyping
      })
    })

    socket.on('disconnect', () => {
      this.handleDisconnect(socket)
    })
  }

  private joinBugRoom(socket: Socket, bugId: string): void {
    const user = socket.data.user as UserPayload
    const roomName = `bug:${bugId}`

    socket.join(roomName)

    // Track viewers
    if (!this.bugRooms.has(bugId)) {
      this.bugRooms.set(bugId, {
        bugId,
        viewers: new Map()
      })
    }

    const room = this.bugRooms.get(bugId)!
    room.viewers.set(socket.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      joinedAt: new Date()
    })

    // Notify others in the room
    socket.to(roomName).emit('presence:userJoined', {
      bugId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

    // Send current viewers to the joining user
    this.broadcastViewers(bugId)
  }

  private leaveBugRoom(socket: Socket, bugId: string): void {
    const user = socket.data.user as UserPayload
    const roomName = `bug:${bugId}`

    socket.leave(roomName)

    const room = this.bugRooms.get(bugId)
    if (room) {
      room.viewers.delete(socket.id)

      if (room.viewers.size === 0) {
        this.bugRooms.delete(bugId)
      } else {
        // Notify others
        socket.to(roomName).emit('presence:userLeft', {
          bugId,
          userId: user.id
        })
        this.broadcastViewers(bugId)
      }
    }
  }

  private broadcastViewers(bugId: string): void {
    const room = this.bugRooms.get(bugId)
    if (!room || !this.io) return

    const viewers = Array.from(room.viewers.values())
    this.io.to(`bug:${bugId}`).emit('presence:viewers', {
      bugId,
      viewers
    })
  }

  private broadcastComment(socket: Socket, bugId: string, comment: string): void {
    const user = socket.data.user as UserPayload

    socket.to(`bug:${bugId}`).emit('bug:commented', {
      bugId,
      comment: {
        id: Date.now().toString(),
        text: comment,
        author: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        createdAt: new Date()
      }
    })
  }

  private handleDisconnect(socket: Socket): void {
    const user = socket.data.user as UserPayload
    console.log(`User disconnected: ${user.name} (${socket.id})`)

    // Remove from all bug rooms
    this.bugRooms.forEach((room, bugId) => {
      if (room.viewers.has(socket.id)) {
        room.viewers.delete(socket.id)

        if (room.viewers.size === 0) {
          this.bugRooms.delete(bugId)
        } else {
          this.io?.to(`bug:${bugId}`).emit('presence:userLeft', {
            bugId,
            userId: user.id
          })
          this.broadcastViewers(bugId)
        }
      }
    })
  }

  // Public methods for emitting events from other parts of the app
  emitBugCreated(bugData: { bugId: string; title: string; reportedBy: string }): void {
    this.io?.emit('bug:created', bugData)
  }

  emitBugUpdated(bugId: string, changes: Record<string, any>): void {
    this.io?.to(`bug:${bugId}`).emit('bug:updated', { bugId, changes })
  }

  emitBugStatusChanged(bugId: string, status: string, changedBy: string): void {
    this.io?.to(`bug:${bugId}`).emit('bug:statusChanged', { bugId, status, changedBy })
  }

  emitNotification(userId: string, notification: any): void {
    this.io?.to(`user:${userId}`).emit('notification:new', notification)
  }

  getIO(): Server | null {
    return this.io
  }
}

export const socketService = new SocketService()
export default socketService
