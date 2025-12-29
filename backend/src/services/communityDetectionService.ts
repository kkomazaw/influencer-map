import { Member, Relationship, Community, CommunityDetectionResult } from '@shared/types'
import { buildGraph } from '../utils/graphStructure.js'
import { louvainCommunityDetection } from '../algorithms/louvain.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * コミュニティ色のパレット
 * 視覚的に区別しやすい色を定義
 */
const COMMUNITY_COLORS = [
  '#FF6B6B', // 赤
  '#4ECDC4', // ターコイズ
  '#45B7D1', // 青
  '#FFA07A', // オレンジ
  '#98D8C8', // ミント
  '#F7DC6F', // 黄色
  '#BB8FCE', // 紫
  '#85C1E2', // 水色
  '#F8B4D1', // ピンク
  '#A8E6CF', // 緑
  '#FFD3B6', // ピーチ
  '#FFAAA5', // サーモン
  '#A0C4FF', // ライトブルー
  '#BDB2FF', // ラベンダー
  '#FFC6FF', // ライトピンク
]

/**
 * Louvainアルゴリズムを使用してコミュニティを検出
 *
 * @param mapId マップID
 * @param members メンバーリスト
 * @param relationships リレーションシップリスト
 * @returns 検出されたコミュニティのリスト
 */
export async function detectCommunities(
  mapId: string,
  members: Member[],
  relationships: Relationship[]
): Promise<CommunityDetectionResult> {
  // グラフを構築
  const graph = buildGraph(members, relationships)

  // Louvainアルゴリズムを実行
  const { assignment, modularity } = louvainCommunityDetection(graph)

  // コミュニティ割り当てをグループ化
  const communityGroups = groupByCommunity(assignment)

  // Communityオブジェクトに変換
  const communities: Community[] = Array.from(communityGroups.entries()).map(
    ([communityId, memberIds], index) => ({
      id: uuidv4(),
      mapId,
      name: `Community ${index + 1}`,
      memberIds,
      color: COMMUNITY_COLORS[index % COMMUNITY_COLORS.length],
      algorithm: 'louvain',
      modularity,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  )

  return {
    communities,
    algorithm: 'louvain',
    modularity,
  }
}

/**
 * コミュニティ割り当てをグループ化
 * Map<nodeId, communityId> -> Map<communityId, nodeId[]>
 */
function groupByCommunity(
  assignment: Map<string, number>
): Map<number, string[]> {
  const groups = new Map<number, string[]>()

  for (const [nodeId, communityId] of assignment.entries()) {
    if (!groups.has(communityId)) {
      groups.set(communityId, [])
    }
    groups.get(communityId)!.push(nodeId)
  }

  return groups
}

/**
 * コミュニティサイズでソート（大きい順）
 */
export function sortCommunitiesBySize(
  communities: Community[]
): Community[] {
  return communities.sort((a, b) => b.memberIds.length - a.memberIds.length)
}

/**
 * 小さいコミュニティをフィルタリング
 * @param communities コミュニティリスト
 * @param minSize 最小サイズ（デフォルト: 2）
 */
export function filterSmallCommunities(
  communities: Community[],
  minSize: number = 2
): Community[] {
  return communities.filter(c => c.memberIds.length >= minSize)
}

/**
 * コミュニティの統計情報を計算
 */
export interface CommunityStats {
  totalCommunities: number
  averageSize: number
  largestCommunitySize: number
  smallestCommunitySize: number
  modularity: number
}

export function calculateCommunityStats(
  result: CommunityDetectionResult
): CommunityStats {
  const { communities, modularity } = result

  if (communities.length === 0) {
    return {
      totalCommunities: 0,
      averageSize: 0,
      largestCommunitySize: 0,
      smallestCommunitySize: 0,
      modularity: modularity || 0,
    }
  }

  const sizes = communities.map(c => c.memberIds.length)
  const totalMembers = sizes.reduce((sum, size) => sum + size, 0)

  return {
    totalCommunities: communities.length,
    averageSize: totalMembers / communities.length,
    largestCommunitySize: Math.max(...sizes),
    smallestCommunitySize: Math.min(...sizes),
    modularity: modularity || 0,
  }
}
