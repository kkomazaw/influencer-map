import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

// Firebase Admin SDK初期化
// 本番環境では環境変数からサービスアカウントキーを取得
// 開発環境ではFirebase Emulatorを使用することを推奨

let firebaseApp: admin.app.App

try {
  // 環境変数からサービスアカウントキーのJSONを取得
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined

  // Firebase Admin SDK初期化
  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  } else if (process.env.NODE_ENV === 'development') {
    // 開発環境：Firebase Emulatorを使用
    console.log('⚠️  Firebase Emulator mode - using default credentials')
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'influencer-map-dev',
    })
  } else {
    throw new Error('Firebase credentials not found')
  }

  console.log('✅ Firebase Admin SDK initialized')
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error)
  throw error
}

// Firestore instance
export const db = admin.firestore()

// Firestoreの設定：undefined値を無視
db.settings({ ignoreUndefinedProperties: true })

// Firebase Auth instance
export const auth = admin.auth()

// Firebase Admin instance
export { firebaseApp }

export default admin
