import React from 'react'
import { Member } from '@shared/types'

interface MemberListProps {
  members: Member[]
  selectedMemberId?: string | null
  onMemberClick?: (memberId: string) => void
  onMemberEdit?: (member: Member) => void
  onMemberDelete?: (memberId: string) => void
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  selectedMemberId,
  onMemberClick,
  onMemberEdit,
  onMemberDelete,
}) => {
  if (members.length === 0) {
    return <div className="empty-state">メンバーが登録されていません</div>
  }

  return (
    <div className="member-list">
      {members.map((member) => (
        <div
          key={member.id}
          className={`member-item ${selectedMemberId === member.id ? 'selected' : ''}`}
          onClick={() => onMemberClick?.(member.id)}
        >
          <div className="member-info">
            <div className="member-avatar">{member.name.charAt(0)}</div>
            <div className="member-details">
              <h4>{member.name}</h4>
              <p className="member-meta">
                {member.department && <span>{member.department}</span>}
                {member.position && <span> · {member.position}</span>}
              </p>
              <p className="member-email">{member.email}</p>
            </div>
          </div>
          <div className="member-actions">
            {onMemberEdit && (
              <button
                className="btn-edit"
                onClick={(e) => {
                  e.stopPropagation()
                  onMemberEdit(member)
                }}
              >
                編集
              </button>
            )}
            {onMemberDelete && (
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`${member.name}を削除しますか？`)) {
                    onMemberDelete(member.id)
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

export default MemberList
