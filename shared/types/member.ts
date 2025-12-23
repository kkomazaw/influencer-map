export interface Member {
  id: string
  mapId: string
  name: string
  email: string
  department?: string
  position?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMemberInput {
  mapId: string
  name: string
  email: string
  department?: string
  position?: string
  avatarUrl?: string
}

export interface UpdateMemberInput {
  name?: string
  email?: string
  department?: string
  position?: string
  avatarUrl?: string
}
