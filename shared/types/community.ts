export interface Community {
  id: string
  mapId: string
  name?: string
  memberIds: string[]
  color: string  // 可視化用の色 (例: "#FF5733")
  algorithm: string  // 使用アルゴリズム（例: "louvain"）
  modularity?: number  // コミュニティ分割の質を示す指標
  createdAt: Date
  updatedAt: Date
}

export interface CreateCommunityInput {
  mapId: string
  name?: string
  memberIds: string[]
  color: string
  algorithm: string
  modularity?: number
}

export interface UpdateCommunityInput {
  name?: string
  color?: string
}

export interface CommunityDetectionResult {
  communities: Community[]
  algorithm: 'louvain' | 'label-propagation' | 'modularity'
  modularity?: number  // コミュニティ分割の質を示す指標
}
