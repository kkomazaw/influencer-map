/**
 * Login Button Component
 * 
 * Googleでログインするボタンコンポーネント
 */

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const LoginButton: React.FC = () => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-button-container">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="login-button"
      >
        {loading ? 'ログイン中...' : 'Googleでログイン'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}
