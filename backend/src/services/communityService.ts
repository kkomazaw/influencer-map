/**
 * Community Service
 *
 * コミュニティ検出とデータ管理を統合するサービス層
 */

import { Community, CommunityDetectionResult, CreateCommunityInput } from '@shared/types'
import { communityRepository } from '../repositories/FirestoreCommunityRepository.js'
import { memberRepository } from '../repositories/FirestoreMemberRepository.js'
import { relationshipRepository } from '../repositories/FirestoreRelationshipRepository.js'
import {
  detectCommunities,
  sortCommunitiesBySize,
  filterSmallCommunities,
  calculateCommunityStats,
} from './communityDetectionService.js'

/**
 * マップのコミュニティを再分析
 * 既存のコミュニティを削除し、新しい分析結果を保存
 */
export async function refreshCommunities(mapId: string): Promise<CommunityDetectionResult> {
  // メンバーとリレーションシップを取得
  const members = await memberRepository.findByMapId(mapId)
  const relationships = await relationshipRepository.findByMapId(mapId)

  // コミュニティ検出を実行
  const result = await detectCommunities(mapId, members, relationships)

  // 既存のコミュニティを削除
  await communityRepository.deleteAll(mapId)

  // 新しいコミュニティを保存
  const sortedCommunities = sortCommunitiesBySize(result.communities)
  const filteredCommunities = filterSmallCommunities(sortedCommunities, 2) // 最小サイズ2

  if (filteredCommunities.length > 0) {
    const communityInputs: CreateCommunityInput[] = filteredCommunities.map((c) => ({
      mapId: c.mapId,
      name: c.name,
      memberIds: c.memberIds,
      color: c.color,
      algorithm: c.algorithm,
      modularity: c.modularity,
    }))

    const savedCommunities = await communityRepository.batchCreate(mapId, communityInputs)

    return {
      communities: savedCommunities,
      algorithm: result.algorithm,
      modularity: result.modularity,
    }
  }

  return {
    communities: [],
    algorithm: result.algorithm,
    modularity: result.modularity,
  }
}

/**
 * マップの全コミュニティを取得
 */
export async function getAllCommunities(mapId: string): Promise<Community[]> {
  return await communityRepository.findByMapId(mapId)
}

/**
 * 最新のコミュニティ分析結果を取得
 */
export async function getLatestCommunities(mapId: string): Promise<Community[]> {
  return await communityRepository.findLatest(mapId)
}

/**
 * IDでコミュニティを取得
 */
export async function getCommunityById(mapId: string, id: string): Promise<Community | null> {
  return await communityRepository.findById(mapId, id)
}

/**
 * コミュニティを更新（名前変更等）
 */
export async function updateCommunity(
  mapId: string,
  id: string,
  data: { name?: string; color?: string }
): Promise<Community> {
  return await communityRepository.update(mapId, id, data)
}

/**
 * コミュニティを削除
 */
export async function deleteCommunity(mapId: string, id: string): Promise<void> {
  await communityRepository.delete(mapId, id)
}

/**
 * コミュニティ統計情報を取得
 */
export async function getCommunityStats(mapId: string) {
  const communities = await communityRepository.findByMapId(mapId)

  if (communities.length === 0) {
    return {
      totalCommunities: 0,
      averageSize: 0,
      largestCommunitySize: 0,
      smallestCommunitySize: 0,
      modularity: 0,
    }
  }

  // モジュラリティは最新のコミュニティから取得
  const latestModularity = communities[0]?.modularity || 0

  return calculateCommunityStats({
    communities,
    algorithm: 'louvain',
    modularity: latestModularity,
  })
}
