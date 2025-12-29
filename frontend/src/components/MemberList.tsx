import React, { memo, useCallback } from 'react'
import { Member } from '@shared/types'

interface MemberListProps {
  members: Member[]
  selectedMemberId?: string | null
  onMemberClick?: (memberId: string) => void
  onMemberEdit?: (member: Member) => void
  onMemberDelete?: (memberId: string) => void
}

interface MemberItemProps {
  member: Member
  isSelected: boolean
  onMemberClick?: (memberId: string) => void
  onMemberEdit?: (member: Member) => void
  onMemberDelete?: (memberId: string) => void
}

const MemberItem = memo<MemberItemProps>(({
  member,
  isSelected,
  onMemberClick,
  onMemberEdit,
  onMemberDelete,
}) => {
  const handleClick = useCallback(() => {
    onMemberClick?.(member.id)
  }, [onMemberClick, member.id])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMemberEdit?.(member)
  }, [onMemberEdit, member])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`${member.name}を削除しますか？`)) {
      onMemberDelete?.(member.id)
    }
  }, [onMemberDelete, member.id, member.name])

  return (
    <div
      className={`member-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
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
          <button className="btn-edit" onClick={handleEdit}>
            編集
          </button>
        )}
        {onMemberDelete && (
          <button className="btn-delete" onClick={handleDelete}>
            削除
          </button>
        )}
      </div>
    </div>
  )
})

MemberItem.displayName = 'MemberItem'

const MemberList: React.FC<MemberListProps> = memo(({
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
        <MemberItem
          key={member.id}
          member={member}
          isSelected={selectedMemberId === member.id}
          onMemberClick={onMemberClick}
          onMemberEdit={onMemberEdit}
          onMemberDelete={onMemberDelete}
        />
      ))}
    </div>
  )
})

MemberList.displayName = 'MemberList'

export default MemberList
