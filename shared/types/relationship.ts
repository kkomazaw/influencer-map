export type RelationshipType = 'collaboration' | 'reporting' | 'mentoring' | 'other'
export type RelationshipStrength = 1 | 2 | 3 | 4 | 5

export interface Relationship {
  id: string
  mapId: string
  sourceId: string      // 関係の起点となるメンバーID
  targetId: string      // 関係の対象となるメンバーID
  type: RelationshipType
  strength: RelationshipStrength
  bidirectional: boolean  // 双方向か片方向か
  createdAt: Date
  updatedAt: Date
}

export interface CreateRelationshipInput {
  mapId: string
  sourceId: string
  targetId: string
  type: RelationshipType
  strength: RelationshipStrength
  bidirectional?: boolean
}

export interface UpdateRelationshipInput {
  type?: RelationshipType
  strength?: RelationshipStrength
  bidirectional?: boolean
}
