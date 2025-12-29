import React, { useState } from 'react'
import { Member, Relationship, Group, Community, CentralityAnalysisResult } from '@shared/types'

interface StatisticsPanelProps {
  members: Member[]
  relationships: Relationship[]
  groups: Group[]
  communities: Community[]
  centralityResult?: CentralityAnalysisResult | null
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  members,
  relationships,
  groups,
  communities,
  centralityResult,
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    overview: boolean
    relationships: boolean
    communities: boolean
    influence: boolean
  }>({
    overview: true,
    relationships: true,
    communities: true,
    influence: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 関係性の種類別統計
  const relationshipsByType = relationships.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 関係性の強度別統計
  const relationshipsByStrength = relationships.reduce((acc, rel) => {
    const strength = Math.floor(rel.strength)
    const key = `${strength}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 双方向関係の統計
  const bidirectionalCount = relationships.filter((r) => r.bidirectional).length
  const unidirectionalCount = relationships.length - bidirectionalCount

  // 部署別メンバー数
  const membersByDepartment = members.reduce((acc, member) => {
    const dept = member.department || '未設定'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 平均関係性数（各メンバーが持つ関係性の平均）
  const memberConnectionCounts = members.map((member) => {
    return relationships.filter(
      (rel) => rel.sourceId === member.id || rel.targetId === member.id
    ).length
  })
  const avgConnections =
    memberConnectionCounts.length > 0
      ? (
          memberConnectionCounts.reduce((a, b) => a + b, 0) / memberConnectionCounts.length
        ).toFixed(1)
      : '0.0'

  const maxConnections = Math.max(...memberConnectionCounts, 0)

  // コミュニティサイズ統計
  const communitySizes = communities.map((c) => c.memberIds.length)
  const avgCommunitySize =
    communitySizes.length > 0
      ? (communitySizes.reduce((a, b) => a + b, 0) / communitySizes.length).toFixed(1)
      : '0.0'
  const largestCommunity = Math.max(...communitySizes, 0)
  const smallestCommunity = communitySizes.length > 0 ? Math.min(...communitySizes) : 0

  return (
    <div className="statistics-panel">
      <h3>統計情報</h3>

      {/* 全体概要 */}
      <div className="stat-section">
        <div
          className="stat-section-header"
          onClick={() => toggleSection('overview')}
        >
          <h4>全体概要</h4>
          <span className="toggle-icon">
            {expandedSections.overview ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.overview && (
          <div className="stat-section-content">
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">総メンバー数</div>
                <div className="stat-value">{members.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">総関係性数</div>
                <div className="stat-value">{relationships.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">グループ数</div>
                <div className="stat-value">{groups.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">コミュニティ数</div>
                <div className="stat-value">{communities.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">平均関係性数</div>
                <div className="stat-value">{avgConnections}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">最大関係性数</div>
                <div className="stat-value">{maxConnections}</div>
              </div>
            </div>

            <div className="stat-subsection">
              <h5>部署別メンバー数</h5>
              <div className="stat-list">
                {Object.entries(membersByDepartment)
                  .sort((a, b) => b[1] - a[1])
                  .map(([dept, count]) => (
                    <div key={dept} className="stat-list-item">
                      <span className="stat-list-label">{dept}</span>
                      <span className="stat-list-value">{count}人</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 関係性統計 */}
      <div className="stat-section">
        <div
          className="stat-section-header"
          onClick={() => toggleSection('relationships')}
        >
          <h4>関係性統計</h4>
          <span className="toggle-icon">
            {expandedSections.relationships ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.relationships && (
          <div className="stat-section-content">
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">双方向関係</div>
                <div className="stat-value">{bidirectionalCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">単方向関係</div>
                <div className="stat-value">{unidirectionalCount}</div>
              </div>
            </div>

            <div className="stat-subsection">
              <h5>関係性の種類別</h5>
              <div className="stat-list">
                {Object.entries(relationshipsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="stat-list-item">
                      <span className="stat-list-label">{type}</span>
                      <span className="stat-list-value">{count}件</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="stat-subsection">
              <h5>関係性の強度別</h5>
              <div className="stat-list">
                {Object.entries(relationshipsByStrength)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([strength, count]) => (
                    <div key={strength} className="stat-list-item">
                      <span className="stat-list-label">強度 {strength}</span>
                      <span className="stat-list-value">{count}件</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* コミュニティ統計 */}
      <div className="stat-section">
        <div
          className="stat-section-header"
          onClick={() => toggleSection('communities')}
        >
          <h4>コミュニティ統計</h4>
          <span className="toggle-icon">
            {expandedSections.communities ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.communities && (
          <div className="stat-section-content">
            {communities.length === 0 ? (
              <div className="empty-state">
                コミュニティが検出されていません
                <br />
                コミュニティタブで「再分析」を実行してください
              </div>
            ) : (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-label">平均サイズ</div>
                    <div className="stat-value">{avgCommunitySize}人</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">最大サイズ</div>
                    <div className="stat-value">{largestCommunity}人</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">最小サイズ</div>
                    <div className="stat-value">{smallestCommunity}人</div>
                  </div>
                </div>

                <div className="stat-subsection">
                  <h5>コミュニティ一覧</h5>
                  <div className="stat-list">
                    {communities
                      .sort((a, b) => b.memberIds.length - a.memberIds.length)
                      .map((community) => (
                        <div key={community.id} className="stat-list-item">
                          <div className="community-stat-item">
                            <div
                              className="community-color-dot"
                              style={{ backgroundColor: community.color }}
                            />
                            <span className="stat-list-label">
                              {community.name || `コミュニティ ${community.id.slice(0, 8)}`}
                            </span>
                          </div>
                          <span className="stat-list-value">
                            {community.memberIds.length}人
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 影響力統計 */}
      <div className="stat-section">
        <div
          className="stat-section-header"
          onClick={() => toggleSection('influence')}
        >
          <h4>影響力統計</h4>
          <span className="toggle-icon">
            {expandedSections.influence ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.influence && (
          <div className="stat-section-content">
            {!centralityResult ? (
              <div className="empty-state">
                影響力分析が実行されていません
                <br />
                影響力分析タブで「分析実行」を実行してください
              </div>
            ) : (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-label">平均次数中心性</div>
                    <div className="stat-value">
                      {centralityResult.statistics.averageDegree.toFixed(3)}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">平均媒介中心性</div>
                    <div className="stat-value">
                      {centralityResult.statistics.averageBetweenness.toFixed(3)}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">平均近接中心性</div>
                    <div className="stat-value">
                      {centralityResult.statistics.averageCloseness.toFixed(3)}
                    </div>
                  </div>
                </div>

                <div className="stat-subsection">
                  <h5>トップインフルエンサー（次数中心性）</h5>
                  <div className="stat-list">
                    {centralityResult.topInfluencers.byDegree.slice(0, 5).map((item) => (
                      <div key={item.memberId} className="stat-list-item">
                        <div className="rank-badge-small">#{item.rank}</div>
                        <span className="stat-list-label">{item.memberName}</span>
                        <span className="stat-list-value">{item.score.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsPanel
