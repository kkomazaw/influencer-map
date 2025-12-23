// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Socket.io Events
export type SocketEventType =
  | 'member:created'
  | 'member:updated'
  | 'member:deleted'
  | 'relationship:created'
  | 'relationship:updated'
  | 'relationship:deleted'
  | 'community:updated'
  | 'group:created'
  | 'group:updated'
  | 'group:deleted'

export interface SocketEvent<T = unknown> {
  type: SocketEventType
  data: T
  timestamp: Date
}
