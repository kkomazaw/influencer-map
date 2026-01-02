import React, { useState } from 'react'
import { Community, Member } from '@shared/types'
import {
  useCommunities,
  useCommunityStats,
  useRefreshCommunities,
  useUpdateCommunity,
  useDeleteCommunity,
} from '../hooks/useCommunities'

interface CommunityPanelProps {
  mapId: string
  members: Member[]
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ mapId, members }) => {
  const { data: communities, isLoading } = useCommunities(mapId)
  const { data: stats } = useCommunityStats(mapId)
  const refreshMutation = useRefreshCommunities(mapId)
  const updateMutation = useUpdateCommunity(mapId)
  const deleteMutation = useDeleteCommunity(mapId)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  const handleRefresh = () => {
    if (
      confirm(
        'コミュニティを再分析しますか？現在のコミュニティ設定は上書きされます。'
      )
    ) {
      refreshMutation.mutate()
    }
  }

  const handleEdit = (community: Community) => {
    setEditingId(community.id)
    setEditName(community.name || '')
    setEditColor(community.color || '#000000')
  }

  const handleSave = (id: string) => {
    updateMutation.mutate(
      { id, data: { name: editName, color: editColor } },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditName('')
          setEditColor('')
        },
      }
    )
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name}を削除しますか？`)) {
      deleteMutation.mutate(id)
    }
  }

  const getMemberNames = (memberIds: string[]) => {
    return memberIds
      .map((id) => members.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  if (isLoading) {
    return <div className="empty-state">読み込み中...</div>
  }

  return (
    <div className="community-panel">
      <div className="community-header">
        <h3>コミュニティ分析</h3>
        <button
          className="btn-refresh"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          {refreshMutation.isPending ? '分析中...' : '再分析'}
        </button>
      </div>

      {stats && (
        <div className="community-stats" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Summary Stats Row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="stat-item">
              <span className="stat-label">コミュニティ数:</span>
              <span className="stat-value">{stats.totalCommunities}</span>
            </div>

            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="stat-label">平均サイズ:</span>
              <span className="stat-value">{stats.averageSize.toFixed(1)}人</span>
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={() => setShowTooltip('averageSize')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <span style={{ cursor: 'help', fontSize: '14px', color: '#888' }}>ℹ️</span>
                {showTooltip === 'averageSize' && (
                  <div style={{
                    position: 'absolute',
                    left: '24px',
                    top: '-8px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    padding: '12px',
                    width: '280px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    color: '#e0e0e0',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>平均サイズとは？</div>
                    <div>各コミュニティに平均何人いるかを示します。</div>
                    <div style={{ marginTop: '8px' }}>
                      <div>• <strong>2-3人</strong>: 少人数グループ</div>
                      <div>• <strong>5-8人</strong>: チーム単位</div>
                      <div>• <strong>10人以上</strong>: 大きな組織単位</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modularity Section */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="stat-label" style={{ whiteSpace: 'nowrap' }}>モジュラリティ:</span>
              <span className="stat-value">{stats.modularity.toFixed(3)}</span>
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={() => setShowTooltip('modularity')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <span style={{ cursor: 'help', fontSize: '14px', color: '#888' }}>ℹ️</span>
                {showTooltip === 'modularity' && (
                  <div style={{
                    position: 'absolute',
                    left: '24px',
                    top: '-8px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    padding: '12px',
                    width: '300px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    color: '#e0e0e0',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>モジュラリティとは？</div>
                    <div>コミュニティの「くっきり度」を0～1で表したもの。</div>
                    <div style={{ marginTop: '8px' }}>
                      <div>• <strong>0.0-0.3</strong>: 区分けが曖昧（全員均等に繋がっている）</div>
                      <div>• <strong>0.3-0.6</strong>: 適度なコミュニティ形成 ✓</div>
                      <div>• <strong>0.6-1.0</strong>: 分断されすぎ（サイロ化の可能性）</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* モジュラリティのビジュアルゲージ */}
            <div style={{ width: '100%' }}>
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}>
                {/* Background gradient zones */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff5252 0%, #ff9800 30%, #4CAF50 50%, #2196F3 60%, #ff9800 100%)',
                  opacity: 0.2,
                }} />

                {/* Progress bar */}
                <div style={{
                  height: '100%',
                  width: `${Math.min(stats.modularity * 100, 100)}%`,
                  background: stats.modularity < 0.3 ? 'linear-gradient(90deg, #ff5252, #ff9800)' :
                             stats.modularity < 0.6 ? 'linear-gradient(90deg, #4CAF50, #45a049)' :
                             'linear-gradient(90deg, #ff9800, #f57c00)',
                  borderRadius: '12px',
                  transition: 'width 0.6s ease-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {(stats.modularity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Zone labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#666' }}>
                <span>曖昧</span>
                <span style={{ color: '#4CAF50' }}>理想的</span>
                <span>分断</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="divider" />

      {!communities || communities.length === 0 ? (
        <div className="empty-state">
          コミュニティが検出されていません
          <br />
          「再分析」ボタンでコミュニティを検出できます
        </div>
      ) : (
        <div className="community-list">
          {/* Sort communities by size (largest first) */}
          {[...communities].sort((a, b) => b.memberIds.length - a.memberIds.length).map((community, index) => {
            const totalMembers = members.length
            const percentage = totalMembers > 0 ? (community.memberIds.length / totalMembers) * 100 : 0

            return (
            <div key={community.id} className="community-item">
              {editingId === community.id ? (
                <div className="community-edit-form">
                  <div className="form-row">
                    <label>名前:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-text"
                    />
                  </div>
                  <div className="form-row">
                    <label>色:</label>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="input-color"
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleSave(community.id)}
                      disabled={updateMutation.isPending}
                    >
                      保存
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="community-info">
                    <div className="community-header-row">
                      <div
                        className="community-color-indicator"
                        style={{ backgroundColor: community.color }}
                      />
                      <h4>{community.name}</h4>
                    </div>

                    {/* Size visualization bar */}
                    <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#aaa' }}>
                          メンバー数: {community.memberIds.length}人
                        </span>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          全体の{percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#2d2d2d',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.max(percentage, 2)}%`,
                          background: `linear-gradient(90deg, ${community.color}, ${community.color}dd)`,
                          borderRadius: '10px',
                          transition: 'width 0.6s ease-out',
                          boxShadow: `0 2px 8px ${community.color}66`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '6px',
                        }}>
                          {percentage > 15 && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: 'white',
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            }}>
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="community-members" style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                      {community.memberIds.length > 0
                        ? getMemberNames(community.memberIds)
                        : 'メンバーなし'}
                    </p>
                  </div>
                  <div className="community-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(community)}
                    >
                      編集
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(community.id, community.name || 'このコミュニティ')
                      }
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommunityPanel
