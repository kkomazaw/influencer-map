export interface Community {
  id: string
  name?: string
  memberIds: string[]
  color: string  // 可視化用の色 (例: "#FF5733")
  detectedAt: Date
}

export interface CommunityDetectionResult {
  communities: Community[]
  algorithm: 'louvain' | 'label-propagation' | 'modularity'
  modularity?: number  // コミュニティ分割の質を示す指標
}
