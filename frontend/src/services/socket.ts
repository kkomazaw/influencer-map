import { io, Socket } from 'socket.io-client'
import { SocketEvent } from '@shared/types'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    // Listen to all event types
    const eventTypes = [
      'member:created',
      'member:updated',
      'member:deleted',
      'relationship:created',
      'relationship:updated',
      'relationship:deleted',
      'community:updated',
    ]

    eventTypes.forEach((eventType) => {
      this.socket?.on(eventType, (event: SocketEvent) => {
        const listeners = this.listeners.get(eventType)
        if (listeners) {
          listeners.forEach((callback) => callback(event.data))
        }
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on<T = unknown>(eventType: string, callback: (data: T) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)?.add(callback as (data: unknown) => void)
  }

  off(eventType: string, callback: (data: unknown) => void) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(callback)
    }
  }
}

export const socketService = new SocketService()
