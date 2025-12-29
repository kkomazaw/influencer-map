/**
 * Centrality Analysis Types
 *
 * 中心性分析に関する型定義
 */

/**
 * 中心性の種類
 */
export type CentralityType = 'degree' | 'betweenness' | 'closeness'

/**
 * メンバーの中心性スコア
 */
export interface MemberCentralityScore {
  memberId: string
  memberName: string
  degree: number
  betweenness: number
  closeness: number
}

/**
 * 中心性ランキング項目
 */
export interface CentralityRankingItem {
  memberId: string
  memberName: string
  score: number
  rank: number
}

/**
 * 中心性分析結果
 */
export interface CentralityAnalysisResult {
  mapId: string
  scores: MemberCentralityScore[]
  topInfluencers: {
    byDegree: CentralityRankingItem[]
    byBetweenness: CentralityRankingItem[]
    byCloseness: CentralityRankingItem[]
  }
  statistics: {
    averageDegree: number
    averageBetweenness: number
    averageCloseness: number
    maxDegree: number
    maxBetweenness: number
    maxCloseness: number
  }
  analyzedAt: Date
}
