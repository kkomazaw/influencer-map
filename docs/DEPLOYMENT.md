# デプロイメント手順書

Influencer Mapアプリケーションの本番環境へのデプロイ手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [Firebase設定](#firebase設定)
3. [フロントエンドデプロイ（Vercel）](#フロントエンドデプロイvercel)
4. [バックエンドデプロイ（Render）](#バックエンドデプロイrender)
5. [デプロイ後の確認](#デプロイ後の確認)
6. [トラブルシューティング](#トラブルシューティング)
7. [データバックアップ](#データバックアップ)

---

## 前提条件

### 必要なアカウント
- [Firebase](https://console.firebase.google.com/) アカウント
- [Vercel](https://vercel.com/) アカウント
- [Render](https://render.com/) アカウント
- GitHub アカウント（リポジトリがホストされている必要があります）

### ローカル環境
- Node.js 18以上
- Git
- プロジェクトのクローン完了

---

## Firebase設定

### 1. Firebaseプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `influencer-map-prod`）
4. Google Analyticsの設定（任意）
5. プロジェクトを作成

### 2. Firestore Database設定

1. Firebaseコンソールで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションを選択（例: `asia-northeast1` - 東京）
4. セキュリティルールで「本番環境モード」を選択
5. 「有効にする」をクリック

### 3. Firebase Authentication設定

1. 「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで以下を有効化:
   - メール/パスワード
   - Google（推奨）

### 4. Firebase Web App作成

1. プロジェクトの設定（⚙️アイコン）→「プロジェクトの設定」
2. 「アプリを追加」→「ウェブ（</>）」を選択
3. アプリのニックネーム入力（例: `influencer-map-web`）
4. Firebase Hostingは不要（チェック不要）
5. 「アプリを登録」をクリック
6. 表示される設定情報を保存:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

### 5. Firebase Admin SDK設定（バックエンド用）

1. プロジェクトの設定 → 「サービスアカウント」タブ
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルをダウンロード
4. ファイルの内容から以下を抽出:
   - `project_id`
   - `private_key`
   - `client_email`

---

## フロントエンドデプロイ（Vercel）

### 1. GitHubリポジトリの準備

```bash
# 変更をコミットしてプッシュ
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Vercelプロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択して「Import」
4. プロジェクト設定:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. 環境変数設定

Vercelプロジェクト設定 → 「Environment Variables」で以下を設定:

```env
VITE_FIREBASE_API_KEY=<Firebase Web App設定のapiKey>
VITE_FIREBASE_AUTH_DOMAIN=<Firebase Web App設定のauthDomain>
VITE_FIREBASE_PROJECT_ID=<Firebase Web App設定のprojectId>
VITE_FIREBASE_STORAGE_BUCKET=<Firebase Web App設定のstorageBucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<Firebase Web App設定のmessagingSenderId>
VITE_FIREBASE_APP_ID=<Firebase Web App設定のappId>
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**注意**: `VITE_API_URL` は後でRenderデプロイ後に更新します。

### 4. デプロイ実行

1. 「Deploy」ボタンをクリック
2. デプロイ完了を待つ（通常1-2分）
3. デプロイされたURLを確認（例: `https://influencer-map-abc123.vercel.app`）

### 5. カスタムドメイン設定（オプション）

1. Vercelプロジェクト設定 → 「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

---

## バックエンドデプロイ（Render）

### 1. Renderプロジェクト作成

1. [Render Dashboard](https://dashboard.render.com/) にアクセス
2. 「New」→「Web Service」をクリック
3. GitHubリポジトリを接続
4. リポジトリを選択

### 2. サービス設定

以下の設定を入力:

- **Name**: `influencer-map-backend`
- **Region**: `Singapore` (アジア最寄り)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` または `Starter`

### 3. 環境変数設定

Renderサービス設定 → 「Environment」で以下を追加:

```env
NODE_ENV=production
PORT=4000
FIREBASE_PROJECT_ID=<Firebase Admin SDKのproject_id>
FIREBASE_PRIVATE_KEY=<Firebase Admin SDKのprivate_key>
FIREBASE_CLIENT_EMAIL=<Firebase Admin SDKのclient_email>
ALLOWED_ORIGINS=https://influencer-map-abc123.vercel.app
```

**重要な注意事項**:

1. **FIREBASE_PRIVATE_KEY**: 改行を `\n` でエスケープする必要があります
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----
   ```

2. **ALLOWED_ORIGINS**: VercelでデプロイしたフロントエンドのURLを設定
   - 複数ドメインの場合はカンマ区切り: `https://domain1.com,https://domain2.com`

### 4. デプロイ実行

1. 「Create Web Service」をクリック
2. 初回ビルドとデプロイを待つ（通常3-5分）
3. デプロイされたURLを確認（例: `https://influencer-map-backend.onrender.com`）

### 5. フロントエンド環境変数の更新

1. Vercel Dashboardに戻る
2. 環境変数 `VITE_API_URL` を更新:
   ```
   VITE_API_URL=https://influencer-map-backend.onrender.com/api
   ```
3. 「Redeploy」をクリックしてフロントエンドを再デプロイ

---

## デプロイ後の確認

### 1. ヘルスチェック

バックエンドのヘルスチェックエンドポイントを確認:

```bash
curl https://influencer-map-backend.onrender.com/api/health
```

期待されるレスポンス:
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T10:00:00.000Z"
}
```

### 2. フロントエンドアクセス確認

1. VercelデプロイURLにアクセス
2. ページが正常に読み込まれることを確認
3. ブラウザの開発者ツールでエラーがないか確認

### 3. 認証機能テスト

1. 「Sign Up」または「Login」をクリック
2. 新規アカウント作成 or Googleログイン
3. 認証が成功することを確認
4. Firebase Console → Authentication でユーザーが作成されたか確認

### 4. API接続テスト

1. ログイン後、Dashboard画面に移動
2. ブラウザの開発者ツール → Networkタブを開く
3. メンバー作成などの操作を実行
4. APIリクエストが正しく送信され、レスポンスが返ることを確認

### 5. HTTPS確認

1. URLが `https://` で始まることを確認
2. ブラウザのアドレスバーに鍵アイコンが表示されることを確認
3. 証明書情報を確認（クリックして詳細表示）

### 6. CORS確認

ブラウザの開発者ツールのコンソールで、以下のエラーが出ていないことを確認:
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

---

## トラブルシューティング

### フロントエンドのビルドエラー

**症状**: Vercelでビルドが失敗する

**解決方法**:
1. ローカルで `cd frontend && npm run build` を実行
2. エラーメッセージを確認
3. TypeScriptエラーを修正
4. コミット & プッシュ

### バックエンドの起動エラー

**症状**: Renderでサービスが起動しない

**解決方法**:
1. Render Logs を確認
2. 環境変数が正しく設定されているか確認
3. 特に `FIREBASE_PRIVATE_KEY` の改行エスケープを確認
4. ローカルで `cd backend && npm run build && npm start` をテスト

### CORSエラー

**症状**: ブラウザコンソールに CORS エラー

**解決方法**:
1. Renderの環境変数 `ALLOWED_ORIGINS` を確認
2. Vercelデプロイ URLが正しく設定されているか確認
3. 複数ドメインの場合、カンマで正しく区切られているか確認
4. Renderサービスを再起動

### Firebase接続エラー

**症状**: 認証や Firestore 操作が失敗

**解決方法**:

**フロントエンド**:
1. Vercelの環境変数を確認
2. Firebase Web App設定が正しいか確認
3. Firebase Console → プロジェクト設定で値を再確認

**バックエンド**:
1. Renderの環境変数を確認
2. `FIREBASE_PROJECT_ID` が正しいか確認
3. `FIREBASE_PRIVATE_KEY` と `FIREBASE_CLIENT_EMAIL` が正しいか確認

### Renderの無料プランでのスリープ

**症状**: しばらくアクセスがないとバックエンドが応答しない

**原因**: Renderの無料プランは15分間アクセスがないとサービスがスリープします

**解決方法**:
1. 初回アクセス時は起動に30秒〜1分かかることを理解
2. 有料プラン（Starter: $7/月）にアップグレード
3. または外部監視サービス（UptimeRobot等）で定期的にヘルスチェックを送信

---

## データバックアップ

### Firestoreの自動バックアップ設定

Firebase Blaze（従量課金）プランでのみ利用可能です。

#### 1. Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. Firebaseプロジェクトを選択
3. 「Firestore」→「データ」を選択

#### 2. エクスポート機能の有効化

```bash
# gcloud CLIをインストール（未インストールの場合）
# https://cloud.google.com/sdk/docs/install

# プロジェクト設定
gcloud config set project YOUR_PROJECT_ID

# Firestoreデータのエクスポート（手動）
gcloud firestore export gs://YOUR_BUCKET_NAME/backups/$(date +%Y%m%d)
```

#### 3. Cloud Schedulerで定期バックアップ（推奨）

1. Google Cloud Console → 「Cloud Scheduler」
2. 「ジョブを作成」をクリック
3. 設定:
   - **名前**: `firestore-daily-backup`
   - **リージョン**: `asia-northeast1`
   - **頻度**: `0 2 * * *` (毎日午前2時)
   - **タイムゾーン**: `Asia/Tokyo`
   - **ターゲット**: `HTTP`
   - **URL**: `https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default):exportDocuments`
   - **HTTPメソッド**: `POST`
   - **本文**:
     ```json
     {
       "outputUriPrefix": "gs://YOUR_BUCKET_NAME/backups",
       "collectionIds": []
     }
     ```

#### 4. Cloud Storageバケット作成

```bash
# バケット作成
gsutil mb -l asia-northeast1 gs://YOUR_PROJECT_ID-firestore-backups

# バケットのライフサイクル設定（30日後に削除）
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://YOUR_PROJECT_ID-firestore-backups
```

### 手動バックアップ（開発環境）

開発環境では Firebase Emulator のエクスポート機能を使用:

```bash
# Emulatorデータのエクスポート
firebase emulators:export ./backups/$(date +%Y%m%d)

# Emulatorデータのインポート
firebase emulators:start --import ./backups/20251229
```

### バックアップからの復元

```bash
# Firestoreへのインポート
gcloud firestore import gs://YOUR_BUCKET_NAME/backups/20251229
```

---

## 継続的デプロイメント

### GitHubへのプッシュで自動デプロイ

VercelとRenderは両方とも、GitHubリポジトリの変更を検知して自動デプロイします。

**ワークフロー**:
1. ローカルで変更を加える
2. テストを実行
3. コミット & プッシュ
4. Vercel/Renderが自動的にビルド & デプロイ
5. デプロイ完了通知を受け取る

### デプロイ前のチェックリスト

- [ ] ローカルで `npm run build` が成功
- [ ] TypeScriptエラーがない
- [ ] ローカルテストが通過
- [ ] 機密情報（API キーなど）がコミットされていない
- [ ] `.env` ファイルがGitignoreされている
- [ ] 環境変数が正しく設定されている

---

## セキュリティベストプラクティス

### 1. 環境変数の管理

- 絶対に `.env` ファイルをGitにコミットしない
- 本番環境の環境変数は Vercel/Render のダッシュボードで管理
- Firebase秘密鍵は厳重に管理

### 2. Firestoreセキュリティルール

`firestore.rules` を適切に設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証済みユーザーのみアクセス可能
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Mapsコレクション: オーナーのみ書き込み可能
    match /maps/{mapId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.ownerId;
    }
  }
}
```

### 3. Firebase Authenticationの設定

- メール認証の場合、メール確認を有効化
- パスワードポリシーを強化
- レート制限を設定

---

## モニタリング

### Vercel Analytics

1. Vercelプロジェクト → 「Analytics」
2. パフォーマンスメトリクスを確認

### Render Metrics

1. Renderサービス → 「Metrics」
2. CPU、メモリ、レスポンスタイムを確認

### Firebase Console

1. Firebase Console → 「Usage」
2. Authentication、Firestoreの使用状況を確認

---

## まとめ

デプロイが完了したら:

1. **フロントエンド**: Vercel URL でアクセス可能
2. **バックエンド**: Render URL でAPI提供
3. **データベース**: Firebase Firestore で永続化
4. **認証**: Firebase Authentication で管理

本番環境で問題が発生した場合は、このドキュメントの[トラブルシューティング](#トラブルシューティング)セクションを参照してください。
