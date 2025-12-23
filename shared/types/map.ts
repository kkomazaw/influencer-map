export interface Map {
  id: string
  name: string
  description?: string
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMapInput {
  name: string
  description?: string
  thumbnail?: string
}

export interface UpdateMapInput {
  name?: string
  description?: string
  thumbnail?: string
}
