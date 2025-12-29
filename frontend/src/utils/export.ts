import { Member, Relationship, Group, Community, CentralityAnalysisResult } from '@shared/types'

/**
 * ファイルをダウンロードするヘルパー関数
 */
export const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * データをJSON形式でエクスポート
 */
export const exportToJSON = (
  data: any,
  filename: string = 'export.json'
) => {
  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, filename, 'application/json')
}

/**
 * マップ全体をJSONでエクスポート
 */
export const exportMapToJSON = (
  mapId: string,
  members: Member[],
  relationships: Relationship[],
  groups: Group[],
  communities: Community[],
  centralityResult: CentralityAnalysisResult | null
) => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    mapId,
    data: {
      members,
      relationships,
      groups,
      communities,
      centralityAnalysis: centralityResult,
    },
  }
  exportToJSON(data, `influencer-map-${mapId}-${Date.now()}.json`)
}

/**
 * CSVのエスケープ処理
 */
const escapeCsvValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * オブジェクト配列をCSV文字列に変換
 */
const arrayToCSV = (data: any[], headers: string[]): string => {
  const headerRow = headers.map(escapeCsvValue).join(',')
  const rows = data.map((row) => {
    return headers.map((header) => escapeCsvValue(row[header])).join(',')
  })
  return [headerRow, ...rows].join('\n')
}

/**
 * メンバーをCSVでエクスポート
 */
export const exportMembersToCSV = (members: Member[]) => {
  const headers = ['id', 'name', 'email', 'department', 'position']
  const csv = arrayToCSV(members, headers)
  downloadFile(csv, `members-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

/**
 * 関係性をCSVでエクスポート
 */
export const exportRelationshipsToCSV = (
  relationships: Relationship[],
  members: Member[]
) => {
  const memberMap = new Map(members.map((m) => [m.id, m.name]))

  const data = relationships.map((rel) => ({
    id: rel.id,
    source: memberMap.get(rel.sourceId) || rel.sourceId,
    target: memberMap.get(rel.targetId) || rel.targetId,
    type: rel.type,
    strength: rel.strength,
    bidirectional: rel.bidirectional ? 'Yes' : 'No',
  }))

  const headers = ['id', 'source', 'target', 'type', 'strength', 'bidirectional']
  const csv = arrayToCSV(data, headers)
  downloadFile(csv, `relationships-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

/**
 * 中心性スコアをCSVでエクスポート
 */
export const exportCentralityToCSV = (
  centralityResult: CentralityAnalysisResult,
  members: Member[]
) => {
  const memberMap = new Map(members.map((m) => [m.id, m.name]))

  const data = centralityResult.scores.map((score) => ({
    name: memberMap.get(score.memberId) || score.memberId,
    degree: score.degree.toFixed(4),
    betweenness: score.betweenness.toFixed(4),
    closeness: score.closeness.toFixed(4),
  }))

  const headers = ['name', 'degree', 'betweenness', 'closeness']
  const csv = arrayToCSV(data, headers)
  downloadFile(csv, `centrality-scores-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

/**
 * コミュニティをCSVでエクスポート
 */
export const exportCommunitiesToCSV = (
  communities: Community[],
  members: Member[]
) => {
  const memberMap = new Map(members.map((m) => [m.id, m.name]))

  const data = communities.flatMap((community, index) => {
    return community.memberIds.map((memberId) => ({
      communityId: index + 1,
      communityColor: community.color,
      memberName: memberMap.get(memberId) || memberId,
    }))
  })

  const headers = ['communityId', 'communityColor', 'memberName']
  const csv = arrayToCSV(data, headers)
  downloadFile(csv, `communities-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

/**
 * Cytoscape グラフを画像としてエクスポート
 */
export const exportGraphImage = (
  cyInstance: any,
  format: 'png' | 'jpg' = 'png',
  scale: number = 2
) => {
  if (!cyInstance) {
    throw new Error('Cytoscape instance not available')
  }

  const options = {
    output: 'blob',
    bg: '#1e1e1e',
    full: true,
    scale,
  }

  const blob = cyInstance.png(options) as Blob
  downloadFile(blob, `network-graph-${Date.now()}.${format}`, `image/${format}`)
}
