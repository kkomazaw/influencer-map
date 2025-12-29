import React, { useState, useRef } from 'react'
import { Member, Relationship, Group, Community, CentralityAnalysisResult, CreateMemberInput, CreateRelationshipInput } from '@shared/types'
import {
  exportMapToJSON,
  exportToJSON,
  exportMembersToCSV,
  exportRelationshipsToCSV,
  exportCentralityToCSV,
  exportCommunitiesToCSV,
  exportGraphImage,
} from '../utils/export'
import {
  parseMembersCSV,
  parseRelationshipsCSV,
  readFileAsText,
  ValidationError,
} from '../utils/import'

interface ExportPanelProps {
  mapId: string
  members: Member[]
  relationships: Relationship[]
  groups: Group[]
  communities: Community[]
  centralityResult: CentralityAnalysisResult | null
  cyInstance: any // Cytoscape instance
  onImportMembers?: (members: CreateMemberInput[]) => Promise<void>
  onImportRelationships?: (relationships: CreateRelationshipInput[]) => Promise<void>
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  mapId,
  members,
  relationships,
  groups,
  communities,
  centralityResult,
  cyInstance,
  onImportMembers,
  onImportRelationships,
}) => {
  const [imageScale, setImageScale] = useState(2)
  const [importing, setImporting] = useState(false)
  const [importErrors, setImportErrors] = useState<ValidationError[]>([])
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const membersFileRef = useRef<HTMLInputElement>(null)
  const relationshipsFileRef = useRef<HTMLInputElement>(null)

  const handleExportAll = () => {
    exportMapToJSON(mapId, members, relationships, groups, communities, centralityResult)
  }

  const handleExportMembers = () => {
    exportToJSON(members, `members-${Date.now()}.json`)
  }

  const handleExportRelationships = () => {
    exportToJSON(relationships, `relationships-${Date.now()}.json`)
  }

  const handleExportGroups = () => {
    exportToJSON(groups, `groups-${Date.now()}.json`)
  }

  const handleExportCommunities = () => {
    exportToJSON(communities, `communities-${Date.now()}.json`)
  }

  const handleExportCentrality = () => {
    if (!centralityResult) {
      alert('中心性分析を実行してください')
      return
    }
    exportToJSON(centralityResult, `centrality-${Date.now()}.json`)
  }

  const handleExportMembersCSV = () => {
    if (members.length === 0) {
      alert('エクスポートするメンバーがありません')
      return
    }
    exportMembersToCSV(members)
  }

  const handleExportRelationshipsCSV = () => {
    if (relationships.length === 0) {
      alert('エクスポートする関係性がありません')
      return
    }
    exportRelationshipsToCSV(relationships, members)
  }

  const handleExportCentralityCSV = () => {
    if (!centralityResult) {
      alert('中心性分析を実行してください')
      return
    }
    exportCentralityToCSV(centralityResult, members)
  }

  const handleExportCommunitiesCSV = () => {
    if (communities.length === 0) {
      alert('エクスポートするコミュニティがありません')
      return
    }
    exportCommunitiesToCSV(communities, members)
  }

  const handleExportGraphImage = () => {
    if (!cyInstance) {
      alert('グラフが初期化されていません')
      return
    }
    try {
      exportGraphImage(cyInstance, 'png', imageScale)
    } catch (error) {
      console.error('Graph export failed:', error)
      alert('画像エクスポートに失敗しました')
    }
  }

  // Import handlers
  const handleImportMembersCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImportMembers) return

    setImporting(true)
    setImportErrors([])
    setImportSuccess(null)

    try {
      const csvText = await readFileAsText(file)
      const result = parseMembersCSV(csvText)

      if (!result.success || result.errors.length > 0) {
        setImportErrors(result.errors)
        return
      }

      if (result.data.length === 0) {
        alert('インポートするデータがありません')
        return
      }

      await onImportMembers(result.data)
      setImportSuccess(`${result.data.length}件のメンバーをインポートしました`)
    } catch (error) {
      alert(`インポートエラー: ${error}`)
    } finally {
      setImporting(false)
      if (membersFileRef.current) {
        membersFileRef.current.value = ''
      }
    }
  }

  const handleImportRelationshipsCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImportRelationships) return

    setImporting(true)
    setImportErrors([])
    setImportSuccess(null)

    try {
      const csvText = await readFileAsText(file)
      const result = parseRelationshipsCSV(csvText, members)

      if (!result.success || result.errors.length > 0) {
        setImportErrors(result.errors)
        return
      }

      if (result.data.length === 0) {
        alert('インポートするデータがありません')
        return
      }

      await onImportRelationships(result.data)
      setImportSuccess(`${result.data.length}件の関係性をインポートしました`)
    } catch (error) {
      alert(`インポートエラー: ${error}`)
    } finally {
      setImporting(false)
      if (relationshipsFileRef.current) {
        relationshipsFileRef.current.value = ''
      }
    }
  }

  const clearMessages = () => {
    setImportErrors([])
    setImportSuccess(null)
  }

  return (
    <div className="export-panel">
      <h3>データエクスポート</h3>

      {/* JSON Export Section */}
      <section className="export-section">
        <h4 className="export-section-title">JSON形式</h4>
        <p className="export-section-description">
          データをJSON形式でエクスポートします。バックアップや他のツールでの利用に最適です。
        </p>
        <div className="export-button-grid">
          <button className="btn btn-primary" onClick={handleExportAll}>
            すべてエクスポート
          </button>
          <button className="btn btn-secondary" onClick={handleExportMembers}>
            メンバー
          </button>
          <button className="btn btn-secondary" onClick={handleExportRelationships}>
            関係性
          </button>
          <button className="btn btn-secondary" onClick={handleExportGroups}>
            グループ
          </button>
          <button className="btn btn-secondary" onClick={handleExportCommunities}>
            コミュニティ
          </button>
          <button className="btn btn-secondary" onClick={handleExportCentrality}>
            中心性分析
          </button>
        </div>
      </section>

      <div className="divider" />

      {/* CSV Export Section */}
      <section className="export-section">
        <h4 className="export-section-title">CSV形式</h4>
        <p className="export-section-description">
          データをCSV形式でエクスポートします。Excel等のスプレッドシートで利用できます。
        </p>
        <div className="export-button-grid">
          <button className="btn btn-secondary" onClick={handleExportMembersCSV}>
            メンバーリスト
          </button>
          <button className="btn btn-secondary" onClick={handleExportRelationshipsCSV}>
            関係性リスト
          </button>
          <button className="btn btn-secondary" onClick={handleExportCentralityCSV}>
            中心性スコア
          </button>
          <button className="btn btn-secondary" onClick={handleExportCommunitiesCSV}>
            コミュニティ
          </button>
        </div>
      </section>

      <div className="divider" />

      {/* Image Export Section */}
      <section className="export-section">
        <h4 className="export-section-title">画像形式</h4>
        <p className="export-section-description">
          現在のネットワークグラフを画像として保存します。
        </p>
        <div className="export-image-controls">
          <div className="form-group">
            <label>画質（スケール）: {imageScale}x</label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={imageScale}
              onChange={(e) => setImageScale(parseFloat(e.target.value))}
            />
            <div className="scale-labels">
              <span>低画質</span>
              <span>高画質</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleExportGraphImage}>
            PNG画像をエクスポート
          </button>
        </div>
      </section>

      <div className="divider" />

      {/* Import Section */}
      <section className="export-section">
        <h4 className="export-section-title">データインポート</h4>
        <p className="export-section-description">
          CSVファイルからメンバーや関係性を一括登録できます。
        </p>

        {importSuccess && (
          <div className="import-success">
            <p>{importSuccess}</p>
            <button className="btn btn-secondary" onClick={clearMessages}>
              閉じる
            </button>
          </div>
        )}

        {importErrors.length > 0 && (
          <div className="import-errors">
            <h5>インポートエラー ({importErrors.length}件)</h5>
            <div className="error-list">
              {importErrors.slice(0, 10).map((error, index) => (
                <div key={index} className="error-item">
                  行{error.row}: {error.field} - {error.message}
                </div>
              ))}
              {importErrors.length > 10 && (
                <div className="error-item">... 他{importErrors.length - 10}件のエラー</div>
              )}
            </div>
            <button className="btn btn-secondary" onClick={clearMessages}>
              閉じる
            </button>
          </div>
        )}

        <div className="import-button-grid">
          <div className="import-button-wrapper">
            <input
              ref={membersFileRef}
              type="file"
              accept=".csv"
              onChange={handleImportMembersCSV}
              style={{ display: 'none' }}
              disabled={importing || !onImportMembers}
            />
            <button
              className="btn btn-secondary"
              onClick={() => membersFileRef.current?.click()}
              disabled={importing || !onImportMembers}
            >
              {importing ? 'インポート中...' : 'メンバーCSV'}
            </button>
          </div>

          <div className="import-button-wrapper">
            <input
              ref={relationshipsFileRef}
              type="file"
              accept=".csv"
              onChange={handleImportRelationshipsCSV}
              style={{ display: 'none' }}
              disabled={importing || !onImportRelationships}
            />
            <button
              className="btn btn-secondary"
              onClick={() => relationshipsFileRef.current?.click()}
              disabled={importing || !onImportRelationships}
            >
              {importing ? 'インポート中...' : '関係性CSV'}
            </button>
          </div>
        </div>

        <div className="import-help">
          <p>
            <strong>メンバーCSV形式:</strong> name, email, department (任意), position (任意)
          </p>
          <p>
            <strong>関係性CSV形式:</strong> source (メール/名前), target (メール/名前), type, strength (1-10), bidirectional (任意)
          </p>
        </div>
      </section>

      <div className="divider" />

      {/* Export Summary */}
      <section className="export-summary">
        <h4 className="export-section-title">データサマリー</h4>
        <div className="export-stats">
          <div className="export-stat-item">
            <span className="export-stat-label">メンバー数:</span>
            <span className="export-stat-value">{members.length}</span>
          </div>
          <div className="export-stat-item">
            <span className="export-stat-label">関係性数:</span>
            <span className="export-stat-value">{relationships.length}</span>
          </div>
          <div className="export-stat-item">
            <span className="export-stat-label">グループ数:</span>
            <span className="export-stat-value">{groups.length}</span>
          </div>
          <div className="export-stat-item">
            <span className="export-stat-label">コミュニティ数:</span>
            <span className="export-stat-value">{communities.length}</span>
          </div>
          <div className="export-stat-item">
            <span className="export-stat-label">中心性分析:</span>
            <span className="export-stat-value">
              {centralityResult ? '実行済み' : '未実行'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ExportPanel
