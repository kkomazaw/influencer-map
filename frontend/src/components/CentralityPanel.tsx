import React, { useState } from 'react'
import { CentralityAnalysisResult, CentralityType } from '@shared/types'
import { useCalculateCentrality } from '../hooks/useCentrality'

interface CentralityPanelProps {
  mapId: string
  onAnalysisComplete?: (result: CentralityAnalysisResult) => void
}

const CentralityPanel: React.FC<CentralityPanelProps> = ({ mapId, onAnalysisComplete }) => {
  const [result, setResult] = useState<CentralityAnalysisResult | null>(null)
  const [activeMetric, setActiveMetric] = useState<CentralityType>('degree')
  const calculateMutation = useCalculateCentrality(mapId, 10)

  const handleCalculate = () => {
    calculateMutation.mutate(undefined, {
      onSuccess: (data) => {
        setResult(data)
        onAnalysisComplete?.(data)
      },
    })
  }

  const getMetricLabel = (metric: CentralityType): string => {
    switch (metric) {
      case 'degree':
        return '次数中心性'
      case 'betweenness':
        return '媒介中心性'
      case 'closeness':
        return '近接中心性'
    }
  }

  const getMetricDescription = (metric: CentralityType): string => {
    switch (metric) {
      case 'degree':
        return '直接的な繋がりが多い人'
      case 'betweenness':
        return '情報の仲介役となる人'
      case 'closeness':
        return '情報が素早く広がる位置にいる人'
    }
  }

  const getRanking = () => {
    if (!result) return []

    switch (activeMetric) {
      case 'degree':
        return result.topInfluencers.byDegree
      case 'betweenness':
        return result.topInfluencers.byBetweenness
      case 'closeness':
        return result.topInfluencers.byCloseness
    }
  }

  const getStatValue = (metric: CentralityType): number => {
    if (!result) return 0

    switch (metric) {
      case 'degree':
        return result.statistics.maxDegree
      case 'betweenness':
        return result.statistics.maxBetweenness
      case 'closeness':
        return result.statistics.maxCloseness
    }
  }

  const ranking = getRanking()

  return (
    <div className="centrality-panel">
      <div className="centrality-header">
        <h3>影響力分析</h3>
        <button
          className="btn-calculate"
          onClick={handleCalculate}
          disabled={calculateMutation.isPending}
        >
          {calculateMutation.isPending ? '分析中...' : '分析実行'}
        </button>
      </div>

      {result && (
        <>
          <div className="centrality-stats">
            <p className="stats-info">
              分析日時: {new Date(result.analyzedAt).toLocaleString('ja-JP')}
            </p>
          </div>

          <div className="metric-tabs">
            <button
              className={`metric-tab ${activeMetric === 'degree' ? 'active' : ''}`}
              onClick={() => setActiveMetric('degree')}
            >
              次数中心性
            </button>
            <button
              className={`metric-tab ${activeMetric === 'betweenness' ? 'active' : ''}`}
              onClick={() => setActiveMetric('betweenness')}
            >
              媒介中心性
            </button>
            <button
              className={`metric-tab ${activeMetric === 'closeness' ? 'active' : ''}`}
              onClick={() => setActiveMetric('closeness')}
            >
              近接中心性
            </button>
          </div>

          <div className="metric-description">
            <h4>{getMetricLabel(activeMetric)}</h4>
            <p>{getMetricDescription(activeMetric)}</p>
          </div>

          <div className="divider" />

          <div className="ranking-list">
            <h4>トップ10ランキング</h4>
            {ranking.length === 0 ? (
              <p className="empty-state">データがありません</p>
            ) : (
              ranking.map((item, index) => {
                const maxScore = getStatValue(activeMetric)
                const percentage = maxScore > 0 ? (item.score / maxScore) * 100 : 0

                // ランクに応じた色のグラデーション
                const getBarColor = (rank: number) => {
                  if (rank === 1) return 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
                  if (rank === 2) return 'linear-gradient(90deg, #C0C0C0 0%, #A8A8A8 100%)'
                  if (rank === 3) return 'linear-gradient(90deg, #CD7F32 0%, #B87333 100%)'
                  return 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)'
                }

                return (
                  <div key={item.memberId} className="ranking-item" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          minWidth: '40px',
                          textAlign: 'center',
                        }}
                      >
                        {item.rank === 1 && '🥇'}
                        {item.rank === 2 && '🥈'}
                        {item.rank === 3 && '🥉'}
                        {item.rank > 3 && `${item.rank}位`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            {item.memberName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>
                            {item.score.toFixed(3)}
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '24px',
                            backgroundColor: '#2d2d2d',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.max(percentage, 2)}%`,
                              background: getBarColor(item.rank),
                              borderRadius: '12px',
                              transition: 'width 0.6s ease-out',
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: '8px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                              }}
                            >
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {!result && !calculateMutation.isPending && (
        <div className="empty-state">
          「分析実行」ボタンをクリックして
          <br />
          メンバーの影響力を分析できます
        </div>
      )}

      {calculateMutation.isPending && (
        <div className="loading-state">
          <p>中心性を計算中...</p>
          <p className="loading-hint">ネットワークの構造を分析しています</p>
        </div>
      )}
    </div>
  )
}

export default CentralityPanel
