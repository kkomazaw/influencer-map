export interface Map {
  id: string
  name: string
  description?: string
  thumbnail?: string
  ownerId: string  // マップ作成者のUID（Firebase Auth）
  createdAt: Date
  updatedAt: Date
}

export interface CreateMapInput {
  name: string
  description?: string
  thumbnail?: string
  ownerId: string  // マップ作成者のUID（Firebase Auth）
}

export interface UpdateMapInput {
  name?: string
  description?: string
  thumbnail?: string
}
