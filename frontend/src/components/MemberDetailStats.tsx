import React from 'react'
import { Member, Relationship, Community, MemberCentralityScore } from '@shared/types'

interface MemberDetailStatsProps {
  member: Member
  relationships: Relationship[]
  community?: Community
  centralityScore?: MemberCentralityScore
  onRelatedMemberClick?: (memberId: string) => void
}

/**
 * 選択されたメンバーの詳細統計を表示するコンポーネント
 */
const MemberDetailStats: React.FC<MemberDetailStatsProps> = ({
  member,
  relationships,
  community,
  centralityScore,
  onRelatedMemberClick,
}) => {
  // このメンバーに関連する関係性
  const relatedRelationships = relationships.filter(
    (rel) => rel.sourceId === member.id || rel.targetId === member.id
  )

  // 送信関係（このメンバーが起点）
  const outgoingRelationships = relatedRelationships.filter((rel) => rel.sourceId === member.id)

  // 受信関係（このメンバーが終点）
  const incomingRelationships = relatedRelationships.filter((rel) => rel.targetId === member.id)

  // 関係性の種類別集計
  const relationshipsByType = relatedRelationships.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 平均関係強度
  const avgStrength =
    relatedRelationships.length > 0
      ? (
          relatedRelationships.reduce((sum, rel) => sum + rel.strength, 0) /
          relatedRelationships.length
        ).toFixed(1)
      : '0.0'

  return (
    <div className="member-detail-stats">
      <div className="member-detail-header">
        <h3>{member.name}</h3>
        <div className="member-meta">
          {member.department && <span className="badge">{member.department}</span>}
          {member.position && <span className="badge secondary">{member.position}</span>}
        </div>
      </div>

      {/* 基本統計 */}
      <div className="detail-section">
        <h4>基本統計</h4>
        <div className="stat-grid">
          <div className="stat-card-small">
            <div className="stat-label">総関係性数</div>
            <div className="stat-value-small">{relatedRelationships.length}</div>
          </div>
          <div className="stat-card-small">
            <div className="stat-label">送信関係</div>
            <div className="stat-value-small">{outgoingRelationships.length}</div>
          </div>
          <div className="stat-card-small">
            <div className="stat-label">受信関係</div>
            <div className="stat-value-small">{incomingRelationships.length}</div>
          </div>
          <div className="stat-card-small">
            <div className="stat-label">平均強度</div>
            <div className="stat-value-small">{avgStrength}</div>
          </div>
        </div>
      </div>

      {/* 関係性の種類 */}
      {Object.keys(relationshipsByType).length > 0 && (
        <div className="detail-section">
          <h4>関係性の種類</h4>
          <div className="stat-list">
            {Object.entries(relationshipsByType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="stat-list-item-small">
                  <span className="stat-list-label">{type}</span>
                  <span className="stat-list-value">{count}件</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* コミュニティ情報 */}
      {community && (
        <div className="detail-section">
          <h4>コミュニティ</h4>
          <div className="community-badge">
            <div
              className="community-color-indicator"
              style={{ backgroundColor: community.color }}
            />
            <span>{community.name || `コミュニティ ${community.id.slice(0, 8)}`}</span>
          </div>
          <div className="community-info-text">
            メンバー数: {community.memberIds.length}人
          </div>
        </div>
      )}

      {/* 中心性スコア */}
      {centralityScore && (
        <div className="detail-section">
          <h4>影響力スコア</h4>
          <div className="centrality-scores">
            <div className="centrality-score-item">
              <span className="centrality-label">次数中心性</span>
              <div className="centrality-bar-container">
                <div
                  className="centrality-bar"
                  style={{ width: `${centralityScore.degree * 100}%` }}
                />
              </div>
              <span className="centrality-value">{centralityScore.degree.toFixed(3)}</span>
            </div>
            <div className="centrality-score-item">
              <span className="centrality-label">媒介中心性</span>
              <div className="centrality-bar-container">
                <div
                  className="centrality-bar"
                  style={{ width: `${centralityScore.betweenness * 100}%` }}
                />
              </div>
              <span className="centrality-value">{centralityScore.betweenness.toFixed(3)}</span>
            </div>
            <div className="centrality-score-item">
              <span className="centrality-label">近接中心性</span>
              <div className="centrality-bar-container">
                <div
                  className="centrality-bar"
                  style={{ width: `${centralityScore.closeness * 100}%` }}
                />
              </div>
              <span className="centrality-value">{centralityScore.closeness.toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 接続メンバー */}
      {relatedRelationships.length > 0 && (
        <div className="detail-section">
          <h4>接続メンバー</h4>
          <div className="connected-members">
            {relatedRelationships.slice(0, 10).map((rel) => {
              const isSource = rel.sourceId === member.id
              const connectedId = isSource ? rel.targetId : rel.sourceId
              const direction = rel.bidirectional ? '↔' : isSource ? '→' : '←'

              return (
                <div
                  key={rel.id}
                  className="connected-member-item"
                  onClick={() => onRelatedMemberClick?.(connectedId)}
                  style={{ cursor: onRelatedMemberClick ? 'pointer' : 'default' }}
                >
                  <span className="connection-direction">{direction}</span>
                  <span className="connection-type">{rel.type}</span>
                  <span className="connection-strength">強度: {rel.strength}</span>
                </div>
              )
            })}
            {relatedRelationships.length > 10 && (
              <div className="more-connections">
                他 {relatedRelationships.length - 10} 件の関係性
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberDetailStats
