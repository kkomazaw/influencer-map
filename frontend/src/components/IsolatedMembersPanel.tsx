import React, { useMemo } from 'react'
import { Member, Relationship } from '@shared/types'

interface IsolatedMembersPanelProps {
  members: Member[]
  relationships: Relationship[]
  onMemberClick?: (memberId: string) => void
}

/**
 * 孤立メンバー（関係性のないメンバー）を検出して表示するパネル
 */
const IsolatedMembersPanel: React.FC<IsolatedMembersPanelProps> = ({
  members,
  relationships,
  onMemberClick,
}) => {
  // 孤立メンバーを検出
  const isolatedMembers = useMemo(() => {
    const connectedMemberIds = new Set<string>()

    // 関係性があるメンバーを収集
    relationships.forEach((rel) => {
      connectedMemberIds.add(rel.sourceId)
      connectedMemberIds.add(rel.targetId)
    })

    // 関係性のないメンバーを抽出
    return members.filter((member) => !connectedMemberIds.has(member.id))
  }, [members, relationships])

  const isolatedCount = isolatedMembers.length
  const isolatedPercentage =
    members.length > 0 ? ((isolatedCount / members.length) * 100).toFixed(1) : '0.0'

  if (members.length === 0) {
    return (
      <div className="isolated-panel">
        <div className="empty-state">メンバーが登録されていません</div>
      </div>
    )
  }

  return (
    <div className="isolated-panel">
      <div className="isolated-header">
        <h3>孤立メンバー検出</h3>
        {isolatedCount > 0 ? (
          <span className="warning-badge">
            ⚠️ {isolatedCount}人が孤立しています
          </span>
        ) : (
          <span className="success-badge">✓ 孤立メンバーなし</span>
        )}
      </div>

      <div className="isolated-stats">
        <div className="stat-item">
          <span className="stat-label">総メンバー数:</span>
          <span className="stat-value">{members.length}人</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">孤立メンバー数:</span>
          <span className="stat-value">{isolatedCount}人</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">孤立率:</span>
          <span className="stat-value">{isolatedPercentage}%</span>
        </div>
      </div>

      <div className="divider" />

      {isolatedCount === 0 ? (
        <div className="success-state">
          <p>すべてのメンバーが他のメンバーと関係性を持っています。</p>
          <p className="hint">良好なネットワークが形成されています。</p>
        </div>
      ) : (
        <>
          <div className="warning-message">
            <p>
              以下のメンバーは他のメンバーとの関係性がありません。
              <br />
              孤立したメンバーは情報共有や協力が困難になる可能性があります。
            </p>
          </div>

          <div className="isolated-member-list">
            <h4>孤立メンバー一覧</h4>
            {isolatedMembers.map((member) => (
              <div
                key={member.id}
                className="isolated-member-item"
                onClick={() => onMemberClick?.(member.id)}
                style={{ cursor: onMemberClick ? 'pointer' : 'default' }}
              >
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-meta">
                    {member.department && (
                      <span className="department">{member.department}</span>
                    )}
                    {member.position && (
                      <span className="position"> · {member.position}</span>
                    )}
                  </div>
                </div>
                <div className="isolated-icon">⚠️</div>
              </div>
            ))}
          </div>

          <div className="recommendations">
            <h4>推奨アクション</h4>
            <ul>
              <li>孤立メンバーに他のメンバーとの関係性を追加してください</li>
              <li>同じ部署やプロジェクトのメンバーとの繋がりを確認してください</li>
              <li>
                定期的なコミュニケーション機会を設けることで、孤立を防ぐことができます
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default IsolatedMembersPanel
