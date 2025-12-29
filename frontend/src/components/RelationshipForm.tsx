import React, { useState } from 'react'
import { CreateRelationshipInput, Member } from '@shared/types'

interface RelationshipFormProps {
  mapId: string
  members: Member[]
  onSubmit: (input: CreateRelationshipInput) => void
  onCancel?: () => void
  isLoading?: boolean
}

const RelationshipForm: React.FC<RelationshipFormProps> = ({
  mapId,
  members,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateRelationshipInput>({
    mapId,
    sourceId: '',
    targetId: '',
    type: 'collaboration',
    strength: 3,
    bidirectional: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.sourceId === formData.targetId) {
      alert('同じメンバー間の関係性は作成できません')
      return
    }
    onSubmit(formData)
    setFormData({
      mapId,
      sourceId: '',
      targetId: '',
      type: 'collaboration',
      strength: 3,
      bidirectional: false,
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value)
            : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="relationship-form">
      <div className="form-group">
        <label htmlFor="sourceId">起点メンバー *</label>
        <select
          id="sourceId"
          name="sourceId"
          value={formData.sourceId}
          onChange={handleChange}
          required
        >
          <option value="">選択してください</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="targetId">対象メンバー *</label>
        <select
          id="targetId"
          name="targetId"
          value={formData.targetId}
          onChange={handleChange}
          required
        >
          <option value="">選択してください</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="type">関係性の種類 *</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} required>
          <option value="collaboration">協力関係</option>
          <option value="reporting">報告関係</option>
          <option value="mentoring">メンター関係</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="strength">関係の強度: {formData.strength}</label>
        <input
          type="range"
          id="strength"
          name="strength"
          min="1"
          max="5"
          value={formData.strength}
          onChange={handleChange}
        />
        <div className="strength-labels">
          <span>弱い</span>
          <span>強い</span>
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="bidirectional"
            checked={formData.bidirectional}
            onChange={handleChange}
          />
          双方向の関係
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? '追加中...' : '関係性を追加'}
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

export default RelationshipForm
