import React from 'react'
import { Group, Member } from '@shared/types'

interface GroupListProps {
  groups: Group[]
  members: Member[]
  onGroupEdit?: (group: Group) => void
  onGroupDelete?: (groupId: string) => void
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  members,
  onGroupEdit,
  onGroupDelete,
}) => {
  if (groups.length === 0) {
    return <div className="empty-state">グループが登録されていません</div>
  }

  const getMemberNames = (memberIds: string[]) => {
    return memberIds
      .map((id) => members.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <div className="group-list">
      {groups.map((group) => (
        <div key={group.id} className="group-item">
          <div className="group-info">
            <div className="group-header">
              <div
                className="group-color-indicator"
                style={{ backgroundColor: group.color }}
              />
              <h4>{group.name}</h4>
            </div>
            {group.description && (
              <p className="group-description">{group.description}</p>
            )}
            <p className="group-members">
              メンバー: {group.memberIds.length > 0 ? getMemberNames(group.memberIds) : 'なし'}
            </p>
          </div>
          <div className="group-actions">
            {onGroupEdit && (
              <button
                className="btn-edit"
                onClick={() => onGroupEdit(group)}
              >
                編集
              </button>
            )}
            {onGroupDelete && (
              <button
                className="btn-delete"
                onClick={() => {
                  if (confirm(`${group.name}を削除しますか？`)) {
                    onGroupDelete(group.id)
                  }
                }}
              >
                削除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GroupList
