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
      <div className="login-container">
        <h1>Influencer Map</h1>
        <p className="login-description">
          組織内の影響力マップを可視化・分析するツール
        </p>
        <LoginButton />
      </div>
    </div>
  )
}
