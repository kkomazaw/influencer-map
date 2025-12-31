import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NetworkGraph, { ColorMode } from '../components/NetworkGraph'
import MemberForm from '../components/MemberForm'
import MemberList from '../components/MemberList'
import RelationshipForm from '../components/RelationshipForm'
import RelationshipLegend from '../components/RelationshipLegend'
import GroupForm from '../components/GroupForm'
import GroupList from '../components/GroupList'
import CommunityPanel from '../components/CommunityPanel'
import CentralityPanel from '../components/CentralityPanel'
import IsolatedMembersPanel from '../components/IsolatedMembersPanel'
import StatisticsPanel from '../components/StatisticsPanel'
import MemberDetailStats from '../components/MemberDetailStats'
import FilterPanel from '../components/FilterPanel'
import ExportPanel from '../components/ExportPanel'
import { useMembers } from '../hooks/useMembers'
import { useRelationships } from '../hooks/useRelationships'
import { useGroups } from '../hooks/useGroups'
import { useCommunities } from '../hooks/useCommunities'
import { useFilteredData } from '../hooks/useFilteredData'
import { useStore } from '../stores/useStore'
import { socketService } from '../services/socket'
import { Member, Group, Relationship, CentralityAnalysisResult } from '@shared/types'

const Dashboard: React.FC = () => {
  const { mapId } = useParams<{ mapId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'members' | 'relationships' | 'groups' | 'communities' | 'centrality' | 'isolated' | 'statistics' | 'filters' | 'export'>('members')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [colorMode, setColorMode] = useState<ColorMode>('default')
  const [centralityResult, setCentralityResult] = useState<CentralityAnalysisResult | null>(null)
  const [cyInstance, setCyInstance] = useState<any>(null)
  const [relationshipDialog, setRelationshipDialog] = useState<{
    visible: boolean
    sourceId: string | null
    targetId: string | null
  }>({
    visible: false,
    sourceId: null,
    targetId: null,
  })
  const [relationshipForm, setRelationshipForm] = useState<{
    type: string
    strength: number
    bidirectional: boolean
  }>({
    type: 'collaboration',
    strength: 5,
    bidirectional: false,
  })

  const { members, isLoading: membersLoading, createMember, updateMember: updateMemberApi, deleteMember, isCreating, isUpdating } = useMembers(mapId)
  const { relationships, isLoading: relsLoading, createRelationship, deleteRelationship, isCreating: isCreatingRel } = useRelationships(mapId)
  const { groups, isLoading: groupsLoading, createGroup, updateGroup: updateGroupApi, deleteGroup, isCreating: isCreatingGroup, isUpdating: isUpdatingGroup } = useGroups(mapId)
  const { data: communities = [], isLoading: communitiesLoading } = useCommunities(mapId || '')
  const { selectedMemberId, setSelectedMemberId, filters, addMember, updateMember, removeMember, addRelationship, updateRelationship, removeRelationship, addGroup, updateGroup, removeGroup } = useStore()

  // Apply filters to members and relationships
  const { filteredMembers, filteredRelationships } = useFilteredData(
    members,
    relationships,
    filters
  )


  if (!mapId) {
    navigate('/')
    return null
  }

  useEffect(() => {
    // Connect to socket
    socketService.connect()

    // Listen to real-time events
    socketService.on('member:created', (payload: unknown) => {
      const data = payload as { data: Member }
      addMember(data.data)
    })
    socketService.on('member:updated', (payload: unknown) => {
      const data = payload as { data: Member }
      // Skip WebSocket updates for position changes - they're handled by optimistic updates
      // This prevents race conditions between optimistic updates and WebSocket events
      // Note: We'll still get the updated position on next page load from the server
    })
    socketService.on('member:deleted', (payload: unknown) => {
      const data = payload as { data: { id: string } }
      removeMember(data.data.id)
    })
    socketService.on('relationship:created', (payload: unknown) => {
      const data = payload as { data: Relationship }
      addRelationship(data.data)
    })
    socketService.on('relationship:updated', (payload: unknown) => {
      const data = payload as { data: Relationship }
      updateRelationship(data.data.id, data.data)
    })
    socketService.on('relationship:deleted', (payload: unknown) => {
      const data = payload as { data: { id: string } }
      removeRelationship(data.data.id)
    })
    socketService.on('group:created', (payload: unknown) => {
      const data = payload as { data: Group }
      addGroup(data.data)
    })
    socketService.on('group:updated', (payload: unknown) => {
      const data = payload as { data: Group }
      // Skip WebSocket updates for position changes - they're handled by optimistic updates
      // This prevents race conditions between optimistic updates and WebSocket events
    })
    socketService.on('group:deleted', (payload: unknown) => {
      const data = payload as { data: { id: string } }
      removeGroup(data.data.id)
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const handleNodeClick = (memberId: string) => {
    setSelectedMemberId(memberId === selectedMemberId ? null : memberId)
  }

  const handleNodeDelete = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    const confirmed = window.confirm(`「${member.name}」を削除してもよろしいですか？`)
    if (!confirmed) return

    try {
      await deleteMember(memberId)
      setSelectedMemberId(null) // Clear selection if deleted member was selected
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('メンバーの削除に失敗しました。')
    }
  }

  const handleRelationshipCreate = (sourceId: string, targetId: string) => {
    setRelationshipDialog({
      visible: true,
      sourceId,
      targetId,
    })
    // Reset form to defaults
    setRelationshipForm({
      type: 'collaboration',
      strength: 5,
      bidirectional: false,
    })
  }

  const handleRelationshipSubmit = async () => {
    if (!mapId || !relationshipDialog.sourceId || !relationshipDialog.targetId) return

    try {
      await createRelationship({
        mapId,
        sourceId: relationshipDialog.sourceId,
        targetId: relationshipDialog.targetId,
        type: relationshipForm.type,
        strength: relationshipForm.strength,
        bidirectional: relationshipForm.bidirectional,
      })
      setRelationshipDialog({ visible: false, sourceId: null, targetId: null })
    } catch (error) {
      console.error('Failed to create relationship:', error)
      alert('関係性の作成に失敗しました。')
    }
  }

  const handleRelationshipCancel = () => {
    setRelationshipDialog({ visible: false, sourceId: null, targetId: null })
  }

  const handleNodePositionChange = async (nodeId: string, x: number, y: number) => {
    console.log('handleNodePositionChange called:', nodeId, x, y)
    // Check if it's a group node (groups have prefix "group-")
    if (nodeId.startsWith('group-')) {
      const groupId = nodeId.replace('group-', '')
      console.log('Updating group position:', groupId, { x, y })
      updateGroupApi({
        id: groupId,
        input: { x, y }
      })
    } else {
      // It's a member node
      console.log('Updating member position:', nodeId, { x, y })
      updateMemberApi({
        id: nodeId,
        input: { x, y }
      })
    }
  }

  if (membersLoading || relsLoading || groupsLoading || communitiesLoading) {
    return (
      <div className="dashboard">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  const hasActiveFilters = !!(
    filters.searchText ||
    filters.departments.length > 0 ||
    filters.positions.length > 0 ||
    filters.relationshipTypes.length > 0 ||
    filters.strengthRange[0] !== 1 ||
    filters.strengthRange[1] !== 10
  )

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-navbar">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← 戻る
          </button>

          <div className="navbar-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{filteredMembers.length < members.length ? `${filteredMembers.length}/` : ''}{members.length}</span>
              <span className="stat-label">メンバー</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔗</span>
              <span className="stat-value">{filteredRelationships.length < relationships.length ? `${filteredRelationships.length}/` : ''}{relationships.length}</span>
              <span className="stat-label">関係性</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📁</span>
              <span className="stat-value">{groups.length}</span>
              <span className="stat-label">グループ</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{communities.length}</span>
              <span className="stat-label">コミュニティ</span>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="filter-indicator">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
              </svg>
              <span>フィルタ適用中</span>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-main">
        <div className="graph-container">
          <div className="graph-controls">
            <label>ノード色:</label>
            <select value={colorMode} onChange={(e) => setColorMode(e.target.value as ColorMode)}>
              <option value="default">デフォルト</option>
              <option value="department">部署</option>
              <option value="community">コミュニティ</option>
            </select>
          </div>
          <RelationshipLegend />
          <NetworkGraph
            members={filteredMembers}
            relationships={filteredRelationships}
            groups={groups}
            communities={communities}
            centralityScores={centralityResult?.scores}
            colorMode={colorMode}
            onNodeClick={handleNodeClick}
            onNodeDelete={handleNodeDelete}
            onRelationshipCreate={handleRelationshipCreate}
            onGraphReady={setCyInstance}
            onNodePositionChange={handleNodePositionChange}
          />
          {selectedMemberId && (
            <div className="member-detail-overlay">
              <div className="member-detail-panel">
                <button
                  className="close-button"
                  onClick={() => setSelectedMemberId(null)}
                >
                  ✕
                </button>
                <MemberDetailStats
                  member={members.find((m) => m.id === selectedMemberId)!}
                  relationships={relationships}
                  community={communities.find((c) => c.memberIds.includes(selectedMemberId))}
                  centralityScore={centralityResult?.scores.find(
                    (s) => s.memberId === selectedMemberId
                  )}
                  onRelatedMemberClick={setSelectedMemberId}
                />
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
              title="メンバー"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'relationships' ? 'active' : ''}`}
              onClick={() => setActiveTab('relationships')}
              title="関係性"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
              title="グループ"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'communities' ? 'active' : ''}`}
              onClick={() => setActiveTab('communities')}
              title="コミュニティ"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'centrality' ? 'active' : ''}`}
              onClick={() => setActiveTab('centrality')}
              title="影響力分析"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'isolated' ? 'active' : ''}`}
              onClick={() => setActiveTab('isolated')}
              title="孤立検出"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
              title="統計情報"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'filters' ? 'active' : ''}`}
              onClick={() => setActiveTab('filters')}
              title="フィルタ"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className={`tab ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
              title="エクスポート"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
              </svg>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'members' && (
              <div className="members-panel">
                <h3>{editingMember ? 'メンバー編集' : 'メンバー管理'}</h3>
                <MemberForm
                  mapId={mapId}
                  onSubmit={(input) => {
                    if (editingMember) {
                      updateMemberApi({ id: editingMember.id, input })
                      setEditingMember(null)
                    } else {
                      createMember(input)
                    }
                  }}
                  onCancel={editingMember ? () => setEditingMember(null) : undefined}
                  isLoading={editingMember ? isUpdating : isCreating}
                  editMode={!!editingMember}
                  initialData={editingMember || undefined}
                />
                <div className="divider" />
                <h3>メンバー一覧</h3>
                <MemberList
                  members={members}
                  selectedMemberId={selectedMemberId}
                  onMemberClick={setSelectedMemberId}
                  onMemberEdit={setEditingMember}
                  onMemberDelete={deleteMember}
                />
              </div>
            )}

            {activeTab === 'relationships' && (
              <div className="relationships-panel">
                <h3>関係性管理</h3>
                <RelationshipForm
                  mapId={mapId}
                  members={members}
                  onSubmit={(input) => createRelationship(input)}
                  isLoading={isCreatingRel}
                />
                <div className="divider" />
                <h3>関係性一覧</h3>
                <div className="relationship-list">
                  {relationships.length === 0 ? (
                    <p className="empty-state">関係性が登録されていません</p>
                  ) : (
                    relationships.map((rel) => {
                      const source = members.find((m) => m.id === rel.sourceId)
                      const target = members.find((m) => m.id === rel.targetId)
                      return (
                        <div key={rel.id} className="relationship-item">
                          <div className="relationship-info">
                            <p>
                              {source?.name} {rel.bidirectional ? '↔' : '→'} {target?.name}
                            </p>
                            <p className="relationship-meta">
                              種類: {rel.type} · 強度: {rel.strength}
                            </p>
                          </div>
                          <button
                            className="btn-delete"
                            onClick={() => {
                              if (confirm('この関係性を削除しますか？')) {
                                deleteRelationship(rel.id)
                              }
                            }}
                          >
                            削除
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="groups-panel">
                <h3>{editingGroup ? 'グループ編集' : 'グループ管理'}</h3>
                <GroupForm
                  mapId={mapId}
                  members={members}
                  onSubmit={(input) => {
                    if (editingGroup) {
                      updateGroupApi({ id: editingGroup.id, input })
                      setEditingGroup(null)
                    } else {
                      createGroup(input)
                    }
                  }}
                  onCancel={editingGroup ? () => setEditingGroup(null) : undefined}
                  isLoading={editingGroup ? isUpdatingGroup : isCreatingGroup}
                  editMode={!!editingGroup}
                  initialData={editingGroup || undefined}
                />
                <div className="divider" />
                <h3>グループ一覧</h3>
                <GroupList
                  groups={groups}
                  members={members}
                  onGroupEdit={setEditingGroup}
                  onGroupDelete={deleteGroup}
                />
              </div>
            )}

            {activeTab === 'communities' && (
              <CommunityPanel mapId={mapId} members={members} />
            )}

            {activeTab === 'centrality' && (
              <CentralityPanel
                mapId={mapId}
                onAnalysisComplete={setCentralityResult}
              />
            )}

            {activeTab === 'isolated' && (
              <IsolatedMembersPanel
                members={members}
                relationships={relationships}
                onMemberClick={setSelectedMemberId}
              />
            )}

            {activeTab === 'statistics' && (
              <StatisticsPanel
                members={members}
                relationships={relationships}
                groups={groups}
                communities={communities}
                centralityResult={centralityResult}
              />
            )}

            {activeTab === 'filters' && (
              <FilterPanel members={members} relationships={relationships} />
            )}

            {activeTab === 'export' && mapId && (
              <ExportPanel
                mapId={mapId}
                members={members}
                relationships={relationships}
                groups={groups}
                communities={communities}
                centralityResult={centralityResult}
                cyInstance={cyInstance}
                onImportMembers={async (memberInputs) => {
                  for (const input of memberInputs) {
                    await createMember(input)
                  }
                }}
                onImportRelationships={async (relationshipInputs) => {
                  for (const input of relationshipInputs) {
                    await createRelationship(input)
                  }
                }}
              />
            )}
          </div>
        </aside>
      </main>

      {/* Relationship Creation Dialog */}
      {relationshipDialog.visible && (
        <div
          className="modal-overlay"
          onClick={handleRelationshipCancel}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#2d2d2d',
              borderRadius: '8px',
              padding: '24px',
              minWidth: '400px',
              maxWidth: '500px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>
              関係性を追加
            </h3>
            <div style={{ marginBottom: '16px', color: '#aaa', fontSize: '14px' }}>
              {relationshipDialog.sourceId &&
                relationshipDialog.targetId &&
                (() => {
                  const source = members.find((m) => m.id === relationshipDialog.sourceId)
                  const target = members.find((m) => m.id === relationshipDialog.targetId)
                  return `${source?.name} → ${target?.name}`
                })()}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="relationship-type"
                style={{ display: 'block', marginBottom: '8px', color: '#fff' }}
              >
                関係の種類
              </label>
              <select
                id="relationship-type"
                value={relationshipForm.type}
                onChange={(e) =>
                  setRelationshipForm({ ...relationshipForm, type: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  backgroundColor: '#1e1e1e',
                  color: '#fff',
                }}
              >
                <option value="collaboration">協力</option>
                <option value="reporting">報告</option>
                <option value="mentoring">メンター</option>
                <option value="friendship">友人</option>
                <option value="consulting">相談</option>
                <option value="project">プロジェクト</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="relationship-strength"
                style={{ display: 'block', marginBottom: '8px', color: '#fff' }}
              >
                強度: {relationshipForm.strength}
              </label>
              <input
                id="relationship-strength"
                type="range"
                min="1"
                max="10"
                value={relationshipForm.strength}
                onChange={(e) =>
                  setRelationshipForm({
                    ...relationshipForm,
                    strength: parseInt(e.target.value),
                  })
                }
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={relationshipForm.bidirectional}
                  onChange={(e) =>
                    setRelationshipForm({
                      ...relationshipForm,
                      bidirectional: e.target.checked,
                    })
                  }
                  style={{ marginRight: '8px' }}
                />
                双方向の関係
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleRelationshipCancel}
                className="btn btn-secondary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#555',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleRelationshipSubmit}
                className="btn btn-primary"
                disabled={isCreatingRel}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  cursor: isCreatingRel ? 'not-allowed' : 'pointer',
                  opacity: isCreatingRel ? 0.6 : 1,
                }}
              >
                {isCreatingRel ? '作成中...' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
