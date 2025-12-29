import React, { useState, useEffect } from 'react'
import { CreateGroupInput, Group, Member } from '@shared/types'

interface GroupFormProps {
  mapId: string
  members: Member[]
  onSubmit: (input: CreateGroupInput) => void
  onCancel?: () => void
  isLoading?: boolean
  editMode?: boolean
  initialData?: Group
}

const PRESET_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
  '#00BCD4', '#FFEB3B', '#FF5722', '#795548', '#607D8B'
]

const GroupForm: React.FC<GroupFormProps> = ({
  mapId,
  members,
  onSubmit,
  onCancel,
  isLoading,
  editMode = false,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateGroupInput>({
    mapId,
    name: '',
    description: '',
    memberIds: [],
    color: PRESET_COLORS[0],
  })

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        mapId,
        name: initialData.name,
        description: initialData.description || '',
        memberIds: initialData.memberIds,
        color: initialData.color || PRESET_COLORS[0],
      })
    }
  }, [editMode, initialData, mapId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (!editMode) {
      setFormData({
        mapId,
        name: '',
        description: '',
        memberIds: [],
        color: PRESET_COLORS[0],
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMemberToggle = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds?.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...(prev.memberIds || []), memberId],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="group-form">
      <div className="form-group">
        <label htmlFor="name">グループ名 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="開発チーム"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="グループの説明を入力"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>枠の色</label>
        <div className="color-picker">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${formData.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
            />
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>メンバー選択</label>
        <div className="member-selector">
          {members.length === 0 ? (
            <p className="empty-state">メンバーがいません</p>
          ) : (
            members.map((member) => (
              <label key={member.id} className="member-checkbox">
                <input
                  type="checkbox"
                  checked={formData.memberIds?.includes(member.id) || false}
                  onChange={() => handleMemberToggle(member.id)}
                />
                <span>{member.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (editMode ? '更新中...' : '作成中...') : (editMode ? 'グループを更新' : 'グループを作成')}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}

export default GroupForm
