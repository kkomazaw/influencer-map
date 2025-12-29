/**
 * Centrality Algorithms
 *
 * ネットワークにおけるノードの重要性を測定する中心性指標を計算
 */

import { Graph } from '../utils/graphStructure.js'

export interface CentralityScores {
  [nodeId: string]: number
}

/**
 * 次数中心性 (Degree Centrality)
 * ノードの接続数を基にした中心性
 * 値が大きいほど、多くの直接的な繋がりを持つ
 */
export function calculateDegreeCentrality(graph: Graph): CentralityScores {
  const scores: CentralityScores = {}
  const n = graph.nodes.length

  if (n === 0) return scores

  for (const node of graph.nodes) {
    const neighbors = graph.adjacencyList.get(node)
    const degree = neighbors ? neighbors.size : 0

    // 正規化: 最大次数 (n-1) で割る
    scores[node] = n > 1 ? degree / (n - 1) : 0
  }

  return scores
}

/**
 * 媒介中心性 (Betweenness Centrality)
 * ノードが最短経路上に現れる頻度を基にした中心性
 * 情報の仲介役となる重要なノードを特定
 *
 * Brandes' Algorithm を使用
 */
export function calculateBetweennessCentrality(graph: Graph): CentralityScores {
  const scores: CentralityScores = {}
  const n = graph.nodes.length

  // 初期化
  for (const node of graph.nodes) {
    scores[node] = 0
  }

  if (n === 0) return scores

  // 各ノードを始点としてBFS
  for (const source of graph.nodes) {
    const stack: string[] = []
    const predecessors = new Map<string, string[]>()
    const sigma = new Map<string, number>() // 最短経路の数
    const distance = new Map<string, number>() // 最短距離
    const delta = new Map<string, number>() // 依存度

    // 初期化
    for (const node of graph.nodes) {
      predecessors.set(node, [])
      sigma.set(node, 0)
      distance.set(node, -1)
      delta.set(node, 0)
    }

    sigma.set(source, 1)
    distance.set(source, 0)

    const queue: string[] = [source]

    // BFSで最短経路を探索
    while (queue.length > 0) {
      const v = queue.shift()!
      stack.push(v)

      const neighbors = graph.adjacencyList.get(v)
      if (!neighbors) continue

      for (const [w] of neighbors) {
        // wを初めて発見
        if (distance.get(w)! < 0) {
          queue.push(w)
          distance.set(w, distance.get(v)! + 1)
        }

        // vからwへの最短経路
        if (distance.get(w) === distance.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!)
          predecessors.get(w)!.push(v)
        }
      }
    }

    // 逆順で依存度を計算
    while (stack.length > 0) {
      const w = stack.pop()!
      for (const v of predecessors.get(w)!) {
        const sigmaV = sigma.get(v)!
        const sigmaW = sigma.get(w)!
        const deltaW = delta.get(w)!

        delta.set(v, delta.get(v)! + (sigmaV / sigmaW) * (1 + deltaW))
      }

      if (w !== source) {
        scores[w] += delta.get(w)!
      }
    }
  }

  // 正規化: 無向グラフの場合は2で割り、(n-1)(n-2)/2で割る
  const normalizationFactor = n > 2 ? (n - 1) * (n - 2) : 1

  for (const node of graph.nodes) {
    scores[node] = scores[node] / normalizationFactor
  }

  return scores
}

/**
 * 近接中心性 (Closeness Centrality)
 * ノードから他の全ノードへの平均距離の逆数
 * 情報が素早く広がる位置にあるノードを特定
 */
export function calculateClosenessCentrality(graph: Graph): CentralityScores {
  const scores: CentralityScores = {}
  const n = graph.nodes.length

  if (n === 0) return scores

  for (const source of graph.nodes) {
    const distances = bfsDistances(graph, source)
    let totalDistance = 0
    let reachableNodes = 0

    for (const [target, distance] of distances) {
      if (target !== source && distance > 0 && distance < Infinity) {
        totalDistance += distance
        reachableNodes++
      }
    }

    // 到達可能なノードがない場合は0
    if (reachableNodes === 0 || totalDistance === 0) {
      scores[source] = 0
    } else {
      // 近接中心性 = (到達可能ノード数 / (n-1)) / (平均距離)
      // = (到達可能ノード数)^2 / ((n-1) * 総距離)
      const normalizationFactor = n > 1 ? n - 1 : 1
      scores[source] = (reachableNodes / normalizationFactor) * (reachableNodes / totalDistance)
    }
  }

  return scores
}

/**
 * BFSで始点からの最短距離を計算
 */
function bfsDistances(graph: Graph, source: string): Map<string, number> {
  const distances = new Map<string, number>()

  // 初期化
  for (const node of graph.nodes) {
    distances.set(node, Infinity)
  }
  distances.set(source, 0)

  const queue: string[] = [source]

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentDistance = distances.get(current)!

    const neighbors = graph.adjacencyList.get(current)
    if (!neighbors) continue

    for (const [neighbor] of neighbors) {
      if (distances.get(neighbor) === Infinity) {
        distances.set(neighbor, currentDistance + 1)
        queue.push(neighbor)
      }
    }
  }

  return distances
}

/**
 * 全ての中心性指標を計算
 */
export interface AllCentralityScores {
  degree: CentralityScores
  betweenness: CentralityScores
  closeness: CentralityScores
}

export function calculateAllCentralities(graph: Graph): AllCentralityScores {
  return {
    degree: calculateDegreeCentrality(graph),
    betweenness: calculateBetweennessCentrality(graph),
    closeness: calculateClosenessCentrality(graph),
  }
}

/**
 * 中心性スコアを降順でソートしてランキングを取得
 */
export interface CentralityRanking {
  nodeId: string
  score: number
  rank: number
}

export function rankByCentrality(scores: CentralityScores, limit?: number): CentralityRanking[] {
  const entries = Object.entries(scores)
    .map(([nodeId, score]) => ({ nodeId, score }))
    .sort((a, b) => b.score - a.score)

  const rankings = entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))

  return limit ? rankings.slice(0, limit) : rankings
}
