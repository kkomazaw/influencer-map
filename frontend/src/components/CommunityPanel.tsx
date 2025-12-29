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
        <div className="community-stats">
          <div className="stat-item">
            <span className="stat-label">コミュニティ数:</span>
            <span className="stat-value">{stats.totalCommunities}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">平均サイズ:</span>
            <span className="stat-value">{stats.averageSize.toFixed(1)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">モジュラリティ:</span>
            <span className="stat-value">{stats.modularity.toFixed(3)}</span>
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
          {communities.map((community) => (
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
                    <p className="community-meta">
                      メンバー数: {community.memberIds.length}
                    </p>
                    <p className="community-members">
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
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityPanel
