import {
  Graph,
  AdjacencyList,
  CommunityAssignment,
  buildGraph,
  getNodeDegree,
  getWeightToCommunity,
  getCommunityInternalWeight,
  getCommunityTotalDegree,
  calculateModularity
} from '../utils/graphStructure.js'

/**
 * Louvainアルゴリズムによるコミュニティ検出
 *
 * アルゴリズムの概要:
 * 1. 各ノードを独自のコミュニティに初期化
 * 2. フェーズ1: 各ノードを隣接コミュニティに移動してモジュラリティを最適化
 * 3. フェーズ2: コミュニティをスーパーノードとして縮約し新しいグラフを作成
 * 4. モジュラリティが向上しなくなるまで2-3を繰り返す
 *
 * @param graph グラフ構造
 * @param maxIterations 最大反復回数（デフォルト: 10）
 * @returns コミュニティ割り当てとモジュラリティ
 */
export function louvainCommunityDetection(
  graph: Graph,
  maxIterations: number = 10
): { assignment: CommunityAssignment; modularity: number } {
  let currentGraph = graph
  let communityAssignment = initializeCommunities(graph.nodes)
  let globalAssignment = new Map(communityAssignment)
  let bestModularity = calculateModularity(currentGraph, communityAssignment)

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // フェーズ1: モジュラリティ最適化
    const { improved, newAssignment } = optimizeModularity(
      currentGraph,
      communityAssignment
    )

    if (!improved) {
      // これ以上改善しない場合は終了
      break
    }

    communityAssignment = newAssignment

    // フェーズ2: グラフ縮約
    const { contractedGraph, mapping } = contractGraph(
      currentGraph,
      communityAssignment
    )

    // グローバルな割り当てを更新
    globalAssignment = updateGlobalAssignment(
      globalAssignment,
      mapping
    )

    // モジュラリティを計算
    const newModularity = calculateModularity(
      currentGraph,
      communityAssignment
    )

    if (newModularity <= bestModularity) {
      // モジュラリティが向上しない場合は終了
      break
    }

    bestModularity = newModularity
    currentGraph = contractedGraph
    communityAssignment = initializeCommunities(contractedGraph.nodes)
  }

  return {
    assignment: globalAssignment,
    modularity: bestModularity
  }
}

/**
 * 各ノードを独自のコミュニティに初期化
 */
function initializeCommunities(nodes: string[]): CommunityAssignment {
  const assignment: CommunityAssignment = new Map()
  nodes.forEach((nodeId, index) => {
    assignment.set(nodeId, index)
  })
  return assignment
}

/**
 * フェーズ1: モジュラリティ最適化
 * 各ノードを最もモジュラリティが向上する隣接コミュニティに移動
 */
function optimizeModularity(
  graph: Graph,
  initialAssignment: CommunityAssignment
): { improved: boolean; newAssignment: CommunityAssignment } {
  const { adjacencyList, totalWeight } = graph
  const assignment = new Map(initialAssignment)
  let improved = false
  let anyChange = true

  // 変更がなくなるまで繰り返す
  while (anyChange) {
    anyChange = false

    for (const nodeId of graph.nodes) {
      const currentCommunity = assignment.get(nodeId)!
      const nodeDegree = getNodeDegree(nodeId, adjacencyList)

      // 隣接コミュニティを取得
      const neighborCommunities = getNeighborCommunities(
        nodeId,
        adjacencyList,
        assignment
      )

      let bestCommunity = currentCommunity
      let bestGain = 0

      // 各隣接コミュニティへの移動を検討
      for (const targetCommunity of neighborCommunities) {
        if (targetCommunity === currentCommunity) continue

        const gain = calculateModularityGain(
          nodeId,
          currentCommunity,
          targetCommunity,
          nodeDegree,
          adjacencyList,
          assignment,
          totalWeight
        )

        if (gain > bestGain) {
          bestGain = gain
          bestCommunity = targetCommunity
        }
      }

      // より良いコミュニティが見つかった場合は移動
      if (bestCommunity !== currentCommunity) {
        assignment.set(nodeId, bestCommunity)
        anyChange = true
        improved = true
      }
    }
  }

  return { improved, newAssignment: assignment }
}

/**
 * ノードの隣接コミュニティを取得
 */
function getNeighborCommunities(
  nodeId: string,
  adjacencyList: AdjacencyList,
  assignment: CommunityAssignment
): Set<number> {
  const communities = new Set<number>()
  const neighbors = adjacencyList.get(nodeId)

  if (!neighbors) return communities

  // 現在のコミュニティも含める
  const currentCommunity = assignment.get(nodeId)
  if (currentCommunity !== undefined) {
    communities.add(currentCommunity)
  }

  // 隣接ノードのコミュニティを追加
  for (const neighborId of neighbors.keys()) {
    const neighborCommunity = assignment.get(neighborId)
    if (neighborCommunity !== undefined) {
      communities.add(neighborCommunity)
    }
  }

  return communities
}

/**
 * ノードを別のコミュニティに移動した際のモジュラリティの変化を計算
 *
 * ΔQ = [Σin + ki,in / 2m] - [(Σtot + ki) / 2m]^2 - [Σin / 2m - (Σtot / 2m)^2 - (ki / 2m)^2]
 *
 * Σin: 移動先コミュニティ内のエッジ重みの合計
 * Σtot: 移動先コミュニティの総次数
 * ki: ノードの次数
 * ki,in: ノードと移動先コミュニティ間のエッジ重みの合計
 * m: グラフ全体のエッジ重みの合計
 */
function calculateModularityGain(
  nodeId: string,
  fromCommunity: number,
  toCommunity: number,
  nodeDegree: number,
  adjacencyList: AdjacencyList,
  assignment: CommunityAssignment,
  totalWeight: number
): number {
  // ノードと移動先コミュニティ間のエッジ重み
  const weightToTarget = getWeightToCommunity(
    nodeId,
    toCommunity,
    adjacencyList,
    assignment
  )

  // ノードと元のコミュニティ間のエッジ重み
  const weightFromSource = getWeightToCommunity(
    nodeId,
    fromCommunity,
    adjacencyList,
    assignment
  )

  // 移動先コミュニティの総次数
  const targetTotalDegree = getCommunityTotalDegree(
    toCommunity,
    adjacencyList,
    assignment
  )

  // 元のコミュニティの総次数
  const sourceTotalDegree = getCommunityTotalDegree(
    fromCommunity,
    adjacencyList,
    assignment
  )

  const m2 = totalWeight // 2m

  // 移動先への利得
  const gainToTarget =
    weightToTarget / m2 -
    (targetTotalDegree * nodeDegree) / (m2 * m2)

  // 元のコミュニティからの損失
  const lossFromSource =
    weightFromSource / m2 -
    ((sourceTotalDegree - nodeDegree) * nodeDegree) / (m2 * m2)

  return gainToTarget - lossFromSource
}

/**
 * フェーズ2: グラフ縮約
 * 検出されたコミュニティをスーパーノードとして新しいグラフを作成
 */
function contractGraph(
  graph: Graph,
  assignment: CommunityAssignment
): {
  contractedGraph: Graph
  mapping: Map<string, number> // 元のノードID -> コミュニティID
} {
  const { adjacencyList } = graph

  // コミュニティIDのセットを取得
  const communityIds = new Set(assignment.values())
  const nodes = Array.from(communityIds).map(id => `community_${id}`)

  // 新しい隣接リストを構築
  const newAdjacencyList: AdjacencyList = new Map()
  const communityToNode = new Map<number, string>()

  // コミュニティIDをノードIDにマッピング
  for (const communityId of communityIds) {
    const nodeId = `community_${communityId}`
    communityToNode.set(communityId, nodeId)
    newAdjacencyList.set(nodeId, new Map())
  }

  // エッジを集約
  let totalWeight = 0

  for (const [nodeId, neighbors] of adjacencyList.entries()) {
    const sourceCommunityId = assignment.get(nodeId)!
    const sourceNodeId = communityToNode.get(sourceCommunityId)!

    for (const [neighborId, weight] of neighbors.entries()) {
      const targetCommunityId = assignment.get(neighborId)!

      // 同じコミュニティ内のエッジはスキップ（自己ループを避ける）
      if (sourceCommunityId === targetCommunityId) continue

      const targetNodeId = communityToNode.get(targetCommunityId)!

      // エッジ重みを追加または更新
      const existingWeight =
        newAdjacencyList.get(sourceNodeId)!.get(targetNodeId) || 0
      newAdjacencyList.get(sourceNodeId)!.set(targetNodeId, existingWeight + weight)
      totalWeight += weight
    }
  }

  const contractedGraph: Graph = {
    nodes,
    adjacencyList: newAdjacencyList,
    totalWeight
  }

  return {
    contractedGraph,
    mapping: assignment
  }
}

/**
 * グローバルな割り当てを更新
 * 縮約されたグラフでの割り当てを元のグラフのノードにマッピング
 */
function updateGlobalAssignment(
  globalAssignment: CommunityAssignment,
  newMapping: Map<string, number>
): CommunityAssignment {
  const updated: CommunityAssignment = new Map()

  for (const [nodeId, oldCommunity] of globalAssignment.entries()) {
    const newCommunity = newMapping.get(`community_${oldCommunity}`)
    if (newCommunity !== undefined) {
      updated.set(nodeId, newCommunity)
    } else {
      // マッピングが見つからない場合は元のコミュニティを維持
      updated.set(nodeId, oldCommunity)
    }
  }

  return updated
}
