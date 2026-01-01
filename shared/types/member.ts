export interface Member {
  id: string
  mapId: string
  name: string
  email: string
  department?: string
  position?: string
  avatarUrl?: string
  centralityScore?: number  // 中心性スコア（計算後に設定）
  communityId?: string      // 所属コミュニティID（分析後に設定）
  x?: number                // グラフ上のX座標
  y?: number                // グラフ上のY座標
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
  x?: number
  y?: number
}

export interface UpdateMemberInput {
  name?: string
  email?: string
  department?: string
  position?: string
  avatarUrl?: string
  x?: number
  y?: number
}
