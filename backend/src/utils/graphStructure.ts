import { Member, Relationship } from '@shared/types'

/**
 * グラフの隣接リスト表現
 * キー: ノードID、値: 隣接ノードIDと重みのマップ
 */
export type AdjacencyList = Map<string, Map<string, number>>

/**
 * ノードのコミュニティ割り当て
 * キー: ノードID、値: コミュニティID（数値）
 */
export type CommunityAssignment = Map<string, number>

/**
 * グラフの基本構造
 */
export interface Graph {
  nodes: string[] // ノードIDのリスト
  adjacencyList: AdjacencyList
  totalWeight: number // グラフ全体のエッジ重みの合計
}

/**
 * メンバーとリレーションシップからグラフを構築
 */
export function buildGraph(
  members: Member[],
  relationships: Relationship[]
): Graph {
  const adjacencyList: AdjacencyList = new Map()
  const nodes = members.map(m => m.id)
  let totalWeight = 0

  // すべてのノードを初期化
  for (const member of members) {
    adjacencyList.set(member.id, new Map())
  }

  // エッジを追加（無向グラフとして扱う）
  for (const rel of relationships) {
    const { sourceId, targetId, strength } = rel

    // sourceId -> targetId
    if (!adjacencyList.has(sourceId)) {
      adjacencyList.set(sourceId, new Map())
    }
    adjacencyList.get(sourceId)!.set(targetId, strength)

    // targetId -> sourceId (無向グラフ)
    if (!adjacencyList.has(targetId)) {
      adjacencyList.set(targetId, new Map())
    }
    adjacencyList.get(targetId)!.set(sourceId, strength)

    totalWeight += strength * 2 // 無向グラフなので両方向で計算
  }

  return {
    nodes,
    adjacencyList,
    totalWeight
  }
}

/**
 * ノードの次数（隣接ノードへのエッジ重みの合計）を計算
 */
export function getNodeDegree(
  nodeId: string,
  adjacencyList: AdjacencyList
): number {
  const neighbors = adjacencyList.get(nodeId)
  if (!neighbors) return 0

  let degree = 0
  for (const weight of neighbors.values()) {
    degree += weight
  }
  return degree
}

/**
 * 2つのノード間のエッジ重みを取得
 */
export function getEdgeWeight(
  nodeId1: string,
  nodeId2: string,
  adjacencyList: AdjacencyList
): number {
  const neighbors = adjacencyList.get(nodeId1)
  if (!neighbors) return 0
  return neighbors.get(nodeId2) || 0
}

/**
 * ノードと特定のコミュニティ間のエッジ重みの合計を計算
 */
export function getWeightToCommunity(
  nodeId: string,
  communityId: number,
  adjacencyList: AdjacencyList,
  communityAssignment: CommunityAssignment
): number {
  const neighbors = adjacencyList.get(nodeId)
  if (!neighbors) return 0

  let weight = 0
  for (const [neighborId, edgeWeight] of neighbors.entries()) {
    if (communityAssignment.get(neighborId) === communityId) {
      weight += edgeWeight
    }
  }
  return weight
}

/**
 * コミュニティ内のエッジ重みの合計を計算
 */
export function getCommunityInternalWeight(
  communityId: number,
  adjacencyList: AdjacencyList,
  communityAssignment: CommunityAssignment
): number {
  let internalWeight = 0

  for (const [nodeId, neighbors] of adjacencyList.entries()) {
    if (communityAssignment.get(nodeId) !== communityId) continue

    for (const [neighborId, weight] of neighbors.entries()) {
      if (communityAssignment.get(neighborId) === communityId) {
        internalWeight += weight
      }
    }
  }

  // 無向グラフなので重複を除外するため2で割る
  return internalWeight / 2
}

/**
 * コミュニティの総次数（コミュニティに属するノードの次数の合計）を計算
 */
export function getCommunityTotalDegree(
  communityId: number,
  adjacencyList: AdjacencyList,
  communityAssignment: CommunityAssignment
): number {
  let totalDegree = 0

  for (const [nodeId, _] of adjacencyList.entries()) {
    if (communityAssignment.get(nodeId) === communityId) {
      totalDegree += getNodeDegree(nodeId, adjacencyList)
    }
  }

  return totalDegree
}

/**
 * モジュラリティを計算
 * Q = (1/2m) * Σ[A_ij - (k_i * k_j)/2m] * δ(c_i, c_j)
 * m: エッジの総重み
 * A_ij: ノードiとjの間のエッジ重み
 * k_i: ノードiの次数
 * δ(c_i, c_j): ノードiとjが同じコミュニティの場合1、そうでなければ0
 */
export function calculateModularity(
  graph: Graph,
  communityAssignment: CommunityAssignment
): number {
  const { adjacencyList, totalWeight } = graph

  if (totalWeight === 0) return 0

  let modularity = 0

  for (const [nodeI, neighborsI] of adjacencyList.entries()) {
    const communityI = communityAssignment.get(nodeI)
    const degreeI = getNodeDegree(nodeI, adjacencyList)

    for (const [nodeJ, edgeWeight] of neighborsI.entries()) {
      const communityJ = communityAssignment.get(nodeJ)

      // 同じコミュニティに属する場合のみ計算
      if (communityI === communityJ) {
        const degreeJ = getNodeDegree(nodeJ, adjacencyList)
        const expectedWeight = (degreeI * degreeJ) / totalWeight
        modularity += edgeWeight - expectedWeight
      }
    }
  }

  // 無向グラフなので2で割り、さらに1/2mを掛ける
  return modularity / (2 * totalWeight)
}
