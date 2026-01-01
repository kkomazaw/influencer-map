/**
 * Authentication Middleware
 * 
 * Firebase Admin SDKを使用してJWTトークンを検証
 */

import { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase'

// Requestオブジェクトを拡張してユーザー情報を追加
export interface AuthRequest extends Request {
  user?: {
    uid: string
    email?: string
    name?: string
  }
}

/**
 * 認証ミドルウェア
 * Authorizationヘッダーからトークンを取得・検証
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 開発環境での認証バイパス
    if (process.env.BYPASS_AUTH === 'true') {
      console.log('Development mode: Bypassing authentication')
      req.user = {
        uid: 'dev-user',
        email: 'dev@example.com',
        name: 'Development User',
      }
      return next()
    }

    // Authorizationヘッダーからトークンを取得
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      })
    }

    const token = authHeader.split('Bearer ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format.',
      })
    }

    // Firebase Admin SDKでトークンを検証
    const decodedToken = await auth.verifyIdToken(token)

    // ユーザー情報をリクエストに追加
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    }

    next()
  } catch (error: any) {
    console.error('Authentication error:', error.message)

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
      details: error.message,
    })
  }
}

/**
 * オプショナル認証ミドルウェア
 * トークンがあれば検証、なければスキップ
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // トークンがなければそのまま次へ
      return next()
    }

    const token = authHeader.split('Bearer ')[1]

    if (!token) {
      return next()
    }

    // トークンがあれば検証
    const decodedToken = await auth.verifyIdToken(token)

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    }

    next()
  } catch (error) {
    // トークンが無効でもエラーにせず次へ
    console.warn('Optional auth failed:', error)
    next()
  }
}
