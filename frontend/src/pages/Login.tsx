/**
 * Login Page
 *
 * ログインページ（未認証ユーザー向け）
 */

import React from 'react'
import { LoginButton } from '../components/LoginButton'
import '../styles/Login.css'

export const Login: React.FC = () => {
  return (
    <div className="login-page">
      {/* アニメーション背景 */}
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-content">
        {/* メインコンテナ */}
        <div className="login-container">
          <div className="login-header">
            <div className="logo-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="28" stroke="url(#gradient)" strokeWidth="3" fill="none"/>
                <circle cx="20" cy="25" r="4" fill="url(#gradient)"/>
                <circle cx="40" cy="25" r="4" fill="url(#gradient)"/>
                <circle cx="30" cy="40" r="4" fill="url(#gradient)"/>
                <line x1="20" y1="25" x2="30" y2="40" stroke="url(#gradient)" strokeWidth="2"/>
                <line x1="40" y1="25" x2="30" y2="40" stroke="url(#gradient)" strokeWidth="2"/>
                <line x1="20" y1="25" x2="40" y2="25" stroke="url(#gradient)" strokeWidth="2"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1>Influencer Map</h1>
            <p className="login-subtitle">組織関係性可視化プラットフォーム</p>
          </div>

          <p className="login-description">
            チーム内の関係性を可視化し、影響力のある人物やコミュニティを発見。
            データドリブンな組織分析で、より良いチームづくりを支援します。
          </p>

          <LoginButton />

          <div className="login-features">
            <div className="feature">
              <div className="feature-icon">📊</div>
              <span>ネットワーク分析</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <span>影響力測定</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🔍</div>
              <span>コミュニティ検出</span>
            </div>
          </div>
        </div>

        {/* サイド情報 */}
        <div className="login-info">
          <div className="info-card">
            <h3>✨ 主な機能</h3>
            <ul>
              <li>
                <span className="info-icon">🌐</span>
                <div>
                  <strong>インタラクティブなグラフ可視化</strong>
                  <p>Cytoscape.jsによる高度なネットワーク表示</p>
                </div>
              </li>
              <li>
                <span className="info-icon">📈</span>
                <div>
                  <strong>中心性分析</strong>
                  <p>PageRank、媒介中心性などの高度な分析</p>
                </div>
              </li>
              <li>
                <span className="info-icon">👥</span>
                <div>
                  <strong>コミュニティ検出</strong>
                  <p>Louvain法による自動グルーピング</p>
                </div>
              </li>
              <li>
                <span className="info-icon">📤</span>
                <div>
                  <strong>データエクスポート</strong>
                  <p>JSON、CSV、PNG形式での出力に対応</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
