import React, { useState, useEffect } from 'react'
import { CreateMemberInput, Member } from '@shared/types'

interface MemberFormProps {
  onSubmit: (input: CreateMemberInput) => void
  onCancel?: () => void
  isLoading?: boolean
  editMode?: boolean
  initialData?: Member
}

const MemberForm: React.FC<MemberFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  editMode = false,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateMemberInput>({
    name: '',
    email: '',
    department: '',
    position: '',
  })

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        department: initialData.department || '',
        position: initialData.position || '',
      })
    }
  }, [editMode, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (!editMode) {
      setFormData({ name: '', email: '', department: '', position: '' })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      <div className="form-group">
        <label htmlFor="name">名前 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="山田太郎"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">メールアドレス *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="yamada@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="department">部署</label>
        <input
          type="text"
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="開発部"
        />
      </div>

      <div className="form-group">
        <label htmlFor="position">役職</label>
        <input
          type="text"
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="エンジニア"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (editMode ? '更新中...' : '追加中...') : (editMode ? 'メンバーを更新' : 'メンバーを追加')}
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

export default MemberForm
