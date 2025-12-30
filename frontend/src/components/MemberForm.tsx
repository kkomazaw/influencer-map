import React, { useState, useEffect } from 'react'
import { CreateMemberInput, Member } from '@shared/types'

interface MemberFormProps {
  mapId: string
  onSubmit: (input: CreateMemberInput) => void
  onCancel?: () => void
  isLoading?: boolean
  editMode?: boolean
  initialData?: Member
}

const MemberForm: React.FC<MemberFormProps> = ({
  mapId,
  onSubmit,
  onCancel,
  isLoading,
  editMode = false,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateMemberInput>({
    mapId,
    name: '',
    email: '',
    department: '',
    position: '',
    avatarUrl: '',
  })
  const [avatarInputMethod, setAvatarInputMethod] = useState<'file' | 'url'>('file')

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        mapId,
        name: initialData.name,
        email: initialData.email,
        department: initialData.department || '',
        position: initialData.position || '',
        avatarUrl: initialData.avatarUrl || '',
      })
    }
  }, [editMode, initialData, mapId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (!editMode) {
      setFormData({ mapId, name: '', email: '', department: '', position: '', avatarUrl: '' })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 画像ファイルのみ許可
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    // ファイルサイズ制限（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイルをBase64に変換
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setFormData((prev) => ({ ...prev, avatarUrl: base64 }))
    }
    reader.onerror = () => {
      alert('ファイルの読み込みに失敗しました')
    }
    reader.readAsDataURL(file)
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

      <div className="form-group">
        <label>アバター画像</label>

        <div className="avatar-input-group">
          <div className="avatar-input-method">
            <label className="input-method-label">
              <input
                type="radio"
                name="avatarInputMethod"
                value="file"
                checked={avatarInputMethod === 'file'}
                onChange={(e) => setAvatarInputMethod(e.target.value as 'file' | 'url')}
              />
              ファイルから選択
            </label>
            <label className="input-method-label">
              <input
                type="radio"
                name="avatarInputMethod"
                value="url"
                checked={avatarInputMethod === 'url'}
                onChange={(e) => setAvatarInputMethod(e.target.value as 'file' | 'url')}
              />
              URLを入力
            </label>
          </div>

          {avatarInputMethod === 'file' && (
            <input
              type="file"
              id="avatarFile"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          )}

          {avatarInputMethod === 'url' && (
            <input
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="url-input"
            />
          )}
        </div>

        {formData.avatarUrl && (
          <div className="avatar-preview">
            <img src={formData.avatarUrl} alt="プレビュー" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
        )}
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
