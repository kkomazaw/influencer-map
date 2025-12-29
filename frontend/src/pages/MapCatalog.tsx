import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaps } from '../hooks/useMaps'
import { useAuth } from '../contexts/AuthContext'
import { CreateMapInput } from '@shared/types'

const MapCatalog: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { maps, isLoading, createMap, deleteMap } = useMaps()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CreateMapInput>({
    name: '',
    description: '',
    ownerId: user?.uid || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMap(formData, {
      onSuccess: () => {
        setFormData({ name: '', description: '', ownerId: user?.uid || '' })
        setShowForm(false)
      },
    })
  }

  const handleMapClick = (mapId: string) => {
    navigate(`/map/${mapId}`)
  }

  const handleDelete = (mapId: string, mapName: string) => {
    if (confirm(`「${mapName}」を削除しますか？このマップに含まれる全てのデータが削除されます。`)) {
      deleteMap(mapId)
    }
  }

  if (isLoading) {
    return <div className="loading">読み込み中...</div>
  }

  return (
    <div className="map-catalog">
      <header className="catalog-header">
        <h1>Influencer Map</h1>
        <p>組織関係性可視化ツール</p>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'キャンセル' : '+ 新しいマップを作成'}
        </button>
      </header>

      {showForm && (
        <div className="map-form-container">
          <form onSubmit={handleSubmit} className="map-form">
            <div className="form-group">
              <label htmlFor="name">マップ名 *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="例: 開発チーム"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">説明</label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="マップの説明を入力"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                作成
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="catalog-main">
        {maps.length === 0 ? (
          <div className="empty-state">
            <p>まだマップがありません</p>
            <p>「新しいマップを作成」ボタンから始めましょう</p>
          </div>
        ) : (
          <div className="map-grid">
            {maps.map((map) => (
              <div key={map.id} className="map-card">
                <div className="map-card-content" onClick={() => handleMapClick(map.id)}>
                  <div className="map-card-thumbnail">
                    <div className="map-icon">📊</div>
                  </div>
                  <div className="map-card-info">
                    <h3>{map.name}</h3>
                    {map.description && <p className="map-description">{map.description}</p>}
                    <p className="map-meta">
                      作成日: {new Date(map.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="map-card-actions">
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(map.id, map.name)
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MapCatalog
