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
    socketService.on('member:created', (data: unknown) => {
      addMember(data as Member)
    })
    socketService.on('member:updated', (data: unknown) => {
      const member = data as Member
      updateMember(member.id, member)
    })
    socketService.on('member:deleted', (data: unknown) => {
      const payload = data as { id: string }
      removeMember(payload.id)
    })
    socketService.on('relationship:created', (data: unknown) => {
      addRelationship(data as Relationship)
    })
    socketService.on('relationship:updated', (data: unknown) => {
      const relationship = data as Relationship
      updateRelationship(relationship.id, relationship)
    })
    socketService.on('relationship:deleted', (data: unknown) => {
      const payload = data as { id: string }
      removeRelationship(payload.id)
    })
    socketService.on('group:created', (data: unknown) => {
      addGroup(data as Group)
    })
    socketService.on('group:updated', (data: unknown) => {
      const group = data as Group
      updateGroup(group.id, group)
    })
    socketService.on('group:deleted', (data: unknown) => {
      const payload = data as { id: string }
      removeGroup(payload.id)
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const handleNodeClick = (memberId: string) => {
    setSelectedMemberId(memberId === selectedMemberId ? null : memberId)
  }

  if (membersLoading || relsLoading || groupsLoading || communitiesLoading) {
    return (
      <div className="dashboard">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-top">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← マップ一覧に戻る
          </button>
        </div>
        <h1>Influencer Map</h1>
        <p>組織関係性可視化ダッシュボード</p>
        <div className="stats">
          <span>メンバー: {members.length} {filteredMembers.length < members.length && `(表示: ${filteredMembers.length})`}</span>
          <span>関係性: {relationships.length} {filteredRelationships.length < relationships.length && `(表示: ${filteredRelationships.length})`}</span>
          <span>グループ: {groups.length}</span>
        </div>
        {(filters.searchText ||
          filters.departments.length > 0 ||
          filters.positions.length > 0 ||
          filters.relationshipTypes.length > 0 ||
          filters.strengthRange[0] !== 1 ||
          filters.strengthRange[1] !== 10) && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: '#ff9800',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'space-between'
          }}>
            <span>⚠️ フィルタが適用されています。すべてのデータを表示するには「フィルタ」タブでクリアしてください。</span>
          </div>
        )}
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
            onGraphReady={setCyInstance}
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
            >
              メンバー
            </button>
            <button
              className={`tab ${activeTab === 'relationships' ? 'active' : ''}`}
              onClick={() => setActiveTab('relationships')}
            >
              関係性
            </button>
            <button
              className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              グループ
            </button>
            <button
              className={`tab ${activeTab === 'communities' ? 'active' : ''}`}
              onClick={() => setActiveTab('communities')}
            >
              コミュニティ
            </button>
            <button
              className={`tab ${activeTab === 'centrality' ? 'active' : ''}`}
              onClick={() => setActiveTab('centrality')}
            >
              影響力分析
            </button>
            <button
              className={`tab ${activeTab === 'isolated' ? 'active' : ''}`}
              onClick={() => setActiveTab('isolated')}
            >
              孤立検出
            </button>
            <button
              className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              統計情報
            </button>
            <button
              className={`tab ${activeTab === 'filters' ? 'active' : ''}`}
              onClick={() => setActiveTab('filters')}
            >
              フィルタ
            </button>
            <button
              className={`tab ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              エクスポート
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
    </div>
  )
}

export default Dashboard
