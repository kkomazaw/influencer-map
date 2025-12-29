# Influencer Map

組織内のメンバー間の関係性と影響力を可視化するダッシュボードアプリケーション

## プロジェクト概要

Influencer Mapは、組織内のメンバー間の関係性をネットワークグラフで可視化し、チームのコミュニケーション構造やキーパーソンを把握するためのツールです。

### 主な機能

- メンバー間の関係性をインタラクティブなネットワークグラフで表示
- コミュニティ（関係の密なグループ）の自動検出
- リアルタイムでのデータ同期
- フィルタリング・検索機能
- メンバーと関係性の管理（CRUD操作）

## 技術スタック

### フロントエンド
- **React** 18.2 + **TypeScript**
- **Vite** - ビルドツール
- **React Router** - ルーティング
- **Zustand** - 状態管理
- **Cytoscape.js** / **React Flow** - ネットワークグラフ可視化
- **TanStack Query** - サーバー状態管理

### バックエンド
- **Node.js** + **TypeScript**
- **Express** - Webフレームワーク
- **Socket.io** - リアルタイム通信
- **Firebase Firestore** - データベース（推奨）
- **Firebase Authentication** - 認証（Google SSO）

### 開発ツール
- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマッター
- **npm workspaces** - モノレポ管理

## プロジェクト構造

```
influencer-map/
├── frontend/           # Reactフロントエンドアプリケーション
│   ├── src/
│   │   ├── components/ # Reactコンポーネント
│   │   ├── pages/      # ページコンポーネント
│   │   ├── services/   # APIクライアント
│   │   ├── types/      # 型定義
│   │   ├── utils/      # ユーティリティ関数
│   │   └── styles/     # スタイルシート
│   └── package.json
├── backend/            # Node.js APIサーバー
│   ├── src/
│   │   ├── controllers/  # リクエストハンドラ
│   │   ├── services/     # ビジネスロジック
│   │   ├── models/       # データモデル
│   │   ├── routes/       # APIルート定義
│   │   ├── middleware/   # ミドルウェア
│   │   └── config/       # 設定ファイル
│   └── package.json
├── shared/             # 共有型定義
│   └── types/
└── docs/               # ドキュメント
```

## セットアップ

### 前提条件

- Node.js 18.0.0 以上
- npm 9.0.0 以上

### インストール

1. リポジトリのクローン（まだ初期化されていない場合）

```bash
git init
git add .
git commit -m "Initial commit"
```

2. 依存関係のインストール

```bash
npm install
```

これにより、ルート、frontend、backend、sharedの全ワークスペースの依存関係がインストールされます。

3. 環境変数の設定

バックエンドディレクトリに `.env` ファイルを作成します：

```bash
cd backend
cp .env.example .env
```

`.env` ファイルを編集し、必要な環境変数を設定してください。

### 開発サーバーの起動

#### すべてのサーバーを同時に起動

```bash
npm run dev
```

これにより、フロントエンド（ポート3000）とバックエンド（ポート4000）が同時に起動します。

#### 個別に起動

```bash
# フロントエンドのみ
npm run dev:frontend

# バックエンドのみ
npm run dev:backend
```

### アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:4000/api
- **ヘルスチェック**: http://localhost:4000/health

## 開発コマンド

### ビルド

```bash
# すべてのパッケージをビルド
npm run build

# フロントエンドのみビルド
npm run build:frontend

# バックエンドのみビルド
npm run build:backend
```

### リント

```bash
# すべてのパッケージでリント実行
npm run lint
```

### フォーマット

```bash
# すべてのファイルをフォーマット
npm run format

# フォーマットチェックのみ（CIで使用）
npm run format:check
```

### 型チェック

```bash
# フロントエンド
npm run type-check -w frontend

# バックエンド
npm run type-check -w backend
```

## Firebase設定（オプション）

Firestoreを使用する場合、以下の手順でFirebaseプロジェクトを設定してください：

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreデータベースを有効化
3. サービスアカウントキーを生成
4. `.env` ファイルにFirebase認証情報を設定

詳細は [Firebase Admin SDK ドキュメント](https://firebase.google.com/docs/admin/setup)を参照してください。

## デプロイ

本番環境へのデプロイについては、詳細な手順書をご覧ください：

**[デプロイメント手順書（docs/DEPLOYMENT.md）](./docs/DEPLOYMENT.md)**

手順書には以下の内容が含まれています：
- Firebase プロジェクトの設定
- Vercel へのフロントエンドデプロイ
- Render へのバックエンドデプロイ
- 環境変数の設定方法
- CORS とセキュリティ設定
- Firestore セキュリティルールの適用
- データバックアップの設定
- トラブルシューティング

### クイックスタート

```bash
# フロントエンドのビルドテスト
npm run build:frontend

# バックエンドのビルドテスト
npm run build:backend
```

### Firestoreセキュリティルール

本番環境にデプロイする前に、Firestoreセキュリティルールを適用してください：

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# セキュリティルールをデプロイ
firebase deploy --only firestore:rules
```

セキュリティルールは `firestore.rules` ファイルに定義されています。

## ライセンス

MIT

## 参考ドキュメント

詳細な要件定義については [CLAUDE.md](./CLAUDE.md) を参照してください。
