# 環境変数設定ガイド

**最終更新**: 2025-12-23
**対象**: 開発環境・本番環境

---

## 📋 概要

このドキュメントでは、Influencer Mapアプリケーションの環境変数設定方法を説明します。

---

## 🔧 必要な環境変数

### バックエンド環境変数

#### 1. Node.js環境設定

```bash
NODE_ENV=development  # 'development' | 'production' | 'test'
PORT=4000             # APIサーバーのポート番号
```

#### 2. Firebase設定

##### 開発環境（Firebase Emulator使用）

```bash
# Firebase Emulator使用時（推奨）
NODE_ENV=development
FIREBASE_PROJECT_ID=influencer-map-dev

# FIREBASE_SERVICE_ACCOUNT は未設定でOK
# Emulatorモードで動作します
```

##### 本番環境（実Firestore使用）

```bash
# 本番環境設定
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id

# サービスアカウントキー（JSON形式を1行にエスケープ）
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id",...}'
```

#### 3. CORS設定

```bash
# 許可するオリジン（カンマ区切り）
CORS_ORIGIN=http://localhost:5173,https://your-domain.vercel.app
```

---

### フロントエンド環境変数

#### 1. Firebase SDK設定

```bash
# Firebase Web SDK設定
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### 2. API エンドポイント

```bash
# バックエンドAPIのURL
VITE_API_URL=http://localhost:4000/api  # 開発環境
# VITE_API_URL=https://your-api.render.com/api  # 本番環境
```

---

## 🚀 セットアップ手順

### Step 1: Firebaseプロジェクト作成

#### 1.1 Firebase Consoleにアクセス

https://console.firebase.google.com/

#### 1.2 新しいプロジェクトを作成

1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `influencer-map`）
3. Google Analyticsは任意で有効化
4. プロジェクトを作成

#### 1.3 Firestoreを有効化

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションを選択（例: `asia-northeast1` - 東京）
4. セキュリティルールで「本番環境モード」を選択
5. 「有効にする」をクリック

#### 1.4 Authenticationを有効化（Week 2で使用）

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Google」プロバイダーを有効化

---

### Step 2: サービスアカウントキー取得

#### 2.1 サービスアカウント作成

1. Firebase Consoleで「プロジェクトの設定」（歯車アイコン）を開く
2. 「サービスアカウント」タブを選択
3. 「新しい秘密鍵の生成」をクリック
4. JSONファイルがダウンロードされる

#### 2.2 JSONキーを1行に変換

ダウンロードしたJSONファイルの内容を1行にします：

**Mac/Linux**:
```bash
cat path/to/serviceAccountKey.json | jq -c '.'
```

**手動**:
```json
{"type":"service_account","project_id":"...","private_key_id":"..."}
```

この1行のJSONを `FIREBASE_SERVICE_ACCOUNT` 環境変数に設定します。

⚠️ **注意**: 秘密鍵を含むため、Gitにコミットしないでください！

---

### Step 3: Web App設定取得（フロントエンド用）

#### 3.1 Webアプリを追加

1. Firebase Consoleの「プロジェクトの設定」を開く
2. 「全般」タブを選択
3. 「アプリを追加」→「ウェブ」を選択
4. アプリのニックネームを入力（例: `influencer-map-web`）
5. 「アプリを登録」をクリック

#### 3.2 Firebase設定をコピー

表示されるコードから設定値をコピー：

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // → VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",            // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...", // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123..."            // → VITE_FIREBASE_APP_ID
};
```

---

### Step 4: 環境変数ファイル作成

#### 4.1 バックエンド `.env` ファイル

`backend/.env` を作成：

```bash
# Node.js環境
NODE_ENV=development
PORT=4000

# Firebase設定
FIREBASE_PROJECT_ID=your-project-id

# 本番環境のみ設定（開発時は不要）
# FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# CORS設定
CORS_ORIGIN=http://localhost:5173
```

#### 4.2 フロントエンド `.env` ファイル

`frontend/.env` を作成：

```bash
# API エンドポイント
VITE_API_URL=http://localhost:4000/api

# Firebase Web SDK設定
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🧪 Firebase Emulator使用（開発環境推奨）

### メリット

- 本番Firestoreを使わずにローカル開発可能
- データのリセットが簡単
- 無料で制限なし
- オフライン動作可能

### セットアップ

#### 1. Firebase CLIインストール

```bash
npm install -g firebase-tools
```

#### 2. Firebaseプロジェクトの初期化

```bash
cd backend
firebase login
firebase init emulators
```

選択項目：
- ✅ Firestore Emulator
- ✅ Authentication Emulator (Week 2で使用)

#### 3. Emulator起動

```bash
firebase emulators:start
```

デフォルトポート：
- Firestore: `http://localhost:8080`
- Auth: `http://localhost:9099`
- Emulator UI: `http://localhost:4000`

#### 4. 環境変数設定

`backend/.env`:
```bash
NODE_ENV=development
FIREBASE_PROJECT_ID=influencer-map-dev
# FIREBASE_SERVICE_ACCOUNT は設定しない
```

アプリケーションは自動的にEmulatorを使用します。

---

## 🔒 セキュリティベストプラクティス

### ❌ やってはいけないこと

1. **Gitに秘密鍵をコミットしない**
   - `.env` ファイルは `.gitignore` に含める
   - `FIREBASE_SERVICE_ACCOUNT` は絶対にコミットしない

2. **フロントエンドに秘密鍵を含めない**
   - Firebase Web SDK設定（`VITE_FIREBASE_*`）は公開OK
   - サービスアカウントキーは含めない

3. **本番環境とテスト環境を分ける**
   - 本番用Firebaseプロジェクト
   - 開発用Firebaseプロジェクト（またはEmulator）

### ✅ 推奨事項

1. **環境変数管理ツール使用**
   - Vercel: Environment Variables機能
   - Render: Environment設定
   - dotenv-vault（オプション）

2. **最小権限の原則**
   - サービスアカウントには必要最小限の権限のみ付与

3. **定期的なキーローテーション**
   - 3-6ヶ月ごとにサービスアカウントキーを更新

---

## 📝 環境別設定例

### 開発環境（ローカル）

```bash
# backend/.env
NODE_ENV=development
PORT=4000
FIREBASE_PROJECT_ID=influencer-map-dev
CORS_ORIGIN=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:4000/api
VITE_FIREBASE_PROJECT_ID=influencer-map-dev
```

Firebase Emulatorを使用。

---

### ステージング環境

```bash
# backend/.env (Render)
NODE_ENV=production
PORT=4000
FIREBASE_PROJECT_ID=influencer-map-staging
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
CORS_ORIGIN=https://influencer-map-staging.vercel.app

# frontend/.env (Vercel)
VITE_API_URL=https://influencer-map-api-staging.onrender.com/api
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=influencer-map-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=influencer-map-staging
```

実Firestoreを使用。

---

### 本番環境

```bash
# backend/.env (Render)
NODE_ENV=production
PORT=4000
FIREBASE_PROJECT_ID=influencer-map-prod
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
CORS_ORIGIN=https://influencer-map.vercel.app

# frontend/.env (Vercel)
VITE_API_URL=https://influencer-map-api.onrender.com/api
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=influencer-map-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=influencer-map-prod
```

実Firestoreを使用。

---

## 🧪 動作確認

### バックエンド

```bash
cd backend
npm run dev
```

期待される出力：
```
⚠️  Firebase Emulator mode - using default credentials
✅ Firebase Admin SDK initialized
Server is running on port 4000
```

### フロントエンド

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

---

## ❓ トラブルシューティング

### エラー: "Firebase credentials not found"

**原因**: `FIREBASE_SERVICE_ACCOUNT` が設定されていない、かつ `NODE_ENV` が `production`

**解決策**:
- 開発環境: `NODE_ENV=development` に設定
- 本番環境: `FIREBASE_SERVICE_ACCOUNT` を正しく設定

---

### エラー: "Permission denied" (Firestore)

**原因**: Firestoreのセキュリティルールが厳しすぎる

**解決策**:
1. Firebase Consoleでセキュリティルールを確認
2. 開発中は以下のルールを使用（テスト環境のみ）:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ 開発環境のみ
    }
  }
}
```

本番環境では適切な認証ルールを設定してください（Week 2で実装）。

---

### Emulatorに接続できない

**確認事項**:
1. Firebase Emulatorが起動しているか確認
   ```bash
   firebase emulators:start
   ```

2. ポートが使用中でないか確認
   ```bash
   lsof -i :8080  # Firestoreポート
   ```

3. `.env` で `NODE_ENV=development` が設定されているか確認

---

## 📚 参考リソース

- [Firebase Admin SDK 公式ドキュメント](https://firebase.google.com/docs/admin/setup)
- [Firebase Web SDK 公式ドキュメント](https://firebase.google.com/docs/web/setup)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)

---

**次のステップ**: 環境変数設定完了後、動作確認テストを実施してください。
