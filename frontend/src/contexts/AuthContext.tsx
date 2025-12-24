/**
 * Authentication Context
 *
 * Firebase Authenticationを使用した認証状態管理
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { setAuthTokenGetter } from '../services/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // IDトークン取得関数
  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null
    try {
      return await user.getIdToken()
    } catch (error) {
      console.error('Get ID Token Error:', error)
      return null
    }
  }

  useEffect(() => {
    // 認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // APIクライアントにトークン取得関数を設定
    setAuthTokenGetter(getIdToken)

    // クリーンアップ
    return () => unsubscribe()
  }, [user])

  // Googleでサインイン
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      throw error
    }
  }

  // サインアウト
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign Out Error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    getIdToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
