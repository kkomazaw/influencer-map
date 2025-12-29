/**
 * Centrality Service
 *
 * 中心性分析のビジネスロジック
 */

import { Member, Relationship, CentralityAnalysisResult } from '@shared/types'
import { buildGraph } from '../utils/graphStructure.js'
import { calculateAllCentralities, rankByCentrality } from '../algorithms/centrality.js'

/**
 * マップの中心性分析を実行
 */
export async function analyzeCentrality(
  mapId: string,
  members: Member[],
  relationships: Relationship[],
  topN: number = 10
): Promise<CentralityAnalysisResult> {
  // グラフを構築
  const graph = buildGraph(members, relationships)

  // 全ての中心性を計算
  const centralityScores = calculateAllCentralities(graph)

  // メンバー名マップを作成
  const memberMap = new Map(members.map((m) => [m.id, m.name]))

  // メンバーごとのスコアを作成
  const scores = members.map((member) => ({
    memberId: member.id,
    memberName: member.name,
    degree: centralityScores.degree[member.id] || 0,
    betweenness: centralityScores.betweenness[member.id] || 0,
    closeness: centralityScores.closeness[member.id] || 0,
  }))

  // ランキングを生成
  const degreeRanking = rankByCentrality(centralityScores.degree, topN).map((r) => ({
    memberId: r.nodeId,
    memberName: memberMap.get(r.nodeId) || 'Unknown',
    score: r.score,
    rank: r.rank,
  }))

  const betweennessRanking = rankByCentrality(centralityScores.betweenness, topN).map((r) => ({
    memberId: r.nodeId,
    memberName: memberMap.get(r.nodeId) || 'Unknown',
    score: r.score,
    rank: r.rank,
  }))

  const closenessRanking = rankByCentrality(centralityScores.closeness, topN).map((r) => ({
    memberId: r.nodeId,
    memberName: memberMap.get(r.nodeId) || 'Unknown',
    score: r.score,
    rank: r.rank,
  }))

  // 統計情報を計算
  const degreeValues = Object.values(centralityScores.degree)
  const betweennessValues = Object.values(centralityScores.betweenness)
  const closenessValues = Object.values(centralityScores.closeness)

  const statistics = {
    averageDegree: average(degreeValues),
    averageBetweenness: average(betweennessValues),
    averageCloseness: average(closenessValues),
    maxDegree: Math.max(...degreeValues, 0),
    maxBetweenness: Math.max(...betweennessValues, 0),
    maxCloseness: Math.max(...closenessValues, 0),
  }

  return {
    mapId,
    scores,
    topInfluencers: {
      byDegree: degreeRanking,
      byBetweenness: betweennessRanking,
      byCloseness: closenessRanking,
    },
    statistics,
    analyzedAt: new Date(),
  }
}

/**
 * 平均値を計算
 */
function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
