/**
 * Logout Button Component
 * 
 * ログアウトボタンコンポーネント
 */

import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export const LogoutButton: React.FC = () => {
  const { signOut, user } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (!user) return null

  return (
    <div className="logout-button-container">
      <span className="user-info">{user.displayName || user.email}</span>
      <button onClick={handleLogout} className="logout-button">
        ログアウト
      </button>
    </div>
  )
}
