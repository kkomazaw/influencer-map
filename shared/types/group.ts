export interface Group {
  id: string
  mapId: string
  name: string
  description?: string
  memberIds: string[]
  color?: string  // 枠の色
  createdAt: Date
  updatedAt: Date
}

export interface CreateGroupInput {
  mapId: string
  name: string
  description?: string
  memberIds?: string[]
  color?: string
}

export interface UpdateGroupInput {
  name?: string
  description?: string
  memberIds?: string[]
  color?: string
}
