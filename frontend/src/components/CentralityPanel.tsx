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
              ranking.map((item) => (
                <div key={item.memberId} className="ranking-item">
                  <div className="rank-badge">
                    {item.rank === 1 && '🥇'}
                    {item.rank === 2 && '🥈'}
                    {item.rank === 3 && '🥉'}
                    {item.rank > 3 && item.rank}
                  </div>
                  <div className="ranking-info">
                    <div className="member-name">{item.memberName}</div>
                    <div className="score-bar-container">
                      <div
                        className="score-bar"
                        style={{
                          width: `${(item.score / getStatValue(activeMetric)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="score-value">{item.score.toFixed(3)}</div>
                </div>
              ))
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
