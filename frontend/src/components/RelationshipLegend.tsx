import React, { memo, useMemo } from 'react'

const RELATIONSHIP_TYPES = [
  { type: '報告', color: '#2196F3', description: '上下関係・報告ライン' },
  { type: '協力', color: '#4CAF50', description: '協力・協業関係' },
  { type: 'メンター', color: '#FF9800', description: 'メンタリング関係' },
  { type: '友人', color: '#9C27B0', description: '個人的な友人関係' },
  { type: '相談', color: '#00BCD4', description: '相談・アドバイス関係' },
  { type: 'プロジェクト', color: '#FFC107', description: 'プロジェクト関係' },
  { type: 'その他', color: '#888', description: 'その他の関係' },
] as const

/**
 * 関係性の種類と色の凡例を表示するコンポーネント
 */
const RelationshipLegend: React.FC = memo(() => {
  const legendItems = useMemo(() => (
    RELATIONSHIP_TYPES.map((item) => (
      <div key={item.type} className="legend-item">
        <div
          className="legend-line"
          style={{ backgroundColor: item.color }}
        />
        <div className="legend-text">
          <span className="legend-type">{item.type}</span>
          <span className="legend-description">{item.description}</span>
        </div>
      </div>
    ))
  ), [])

  return (
    <div className="relationship-legend">
      <h4>関係性の種類</h4>
      <div className="legend-items">
        {legendItems}
      </div>
      <div className="legend-note">
        ※ 線の太さは関係の強度を表します
      </div>
    </div>
  )
})

RelationshipLegend.displayName = 'RelationshipLegend'

export default RelationshipLegend
