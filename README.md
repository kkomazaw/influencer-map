# Influencer Map - 組織関係性可視化ツール

組織内のメンバー間の関係性を可視化し、影響力のある人物やコミュニティを分析するためのWebアプリケーションです。

## 主な機能

### 基本機能
- **マップ管理**: 複数のマップを作成・管理
- **メンバー管理**: メンバーの追加・編集・削除
- **関係性管理**: メンバー間の関係性を定義（種類と強度）
- **グループ管理**: メンバーをグループ化して整理

### 可視化機能
- **ネットワークグラフ**: Cytoscape.jsを使用した対話的なグラフ表示
- **複数のレイアウト**: Cose、Circle、Grid、Concentricレイアウトに対応
- **カラーモード**:
  - 部署別の色分け
  - コミュニティ検出による色分け
  - 中心性スコアによる色分け

### 分析機能
- **コミュニティ検出**: Louvain法によるコミュニティ抽出
- **中心性分析**:
  - 次数中心性（Degree Centrality）
  - 近接中心性（Closeness Centrality）
  - 媒介中心性（Betweenness Centrality）
  - PageRank
- **孤立メンバー検出**: ネットワークから孤立したメンバーを特定
- **統計情報**: メンバー数、関係性数、コミュニティ数などの統計表示

### データ管理機能
- **エクスポート**:
  - JSON形式での完全なマップデータエクスポート
  - CSV形式でのメンバー・関係性エクスポート
  - PNG形式でのグラフ画像エクスポート（拡大率調整可能）
- **インポート**:
  - CSVからのメンバー一括インポート
  - CSVからの関係性一括インポート
  - リアルタイムバリデーションとエラー表示

### フィルタリング機能
- メンバー名での検索
- 部署・役職でのフィルタリング
- 関係性タイプでのフィルタリング
- 関係性強度の範囲指定

## 技術スタック

### フロントエンド
- **React 18** - UIフレームワーク
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Cytoscape.js** - グラフ可視化ライブラリ
- **React Query** - サーバーステート管理
- **Zustand** - クライアントステート管理
- **React Router** - ルーティング
- **Firebase** - 認証
- **Vitest** - ユニットテスト
- **Testing Library** - Reactコンポーネントテスト

### バックエンド
- **Node.js** - サーバーランタイム
- **Express** - Webフレームワーク
- **PostgreSQL** - データベース
- **Prisma** - ORMツール
- **Socket.IO** - リアルタイム通信

### 開発ツール
- **ESLint** - コード品質チェック
- **npm workspaces** - モノレポ管理

## プロジェクト構造

```
influencer-map/
├── frontend/                 # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/      # Reactコンポーネント
│   │   │   ├── NetworkGraph.tsx         # グラフ可視化
│   │   │   ├── MemberList.tsx          # メンバー一覧
│   │   │   ├── ExportPanel.tsx         # エクスポート/インポートUI
│   │   │   ├── FilterPanel.tsx         # フィルタリングUI
│   │   │   ├── StatisticsPanel.tsx     # 統計情報表示
│   │   │   └── RelationshipLegend.tsx  # グラフ凡例
│   │   ├── pages/           # ページコンポーネント
│   │   │   ├── MapCatalog.tsx          # マップ一覧
│   │   │   └── Dashboard.tsx           # メインダッシュボード
│   │   ├── hooks/           # カスタムフック
│   │   │   ├── useMapData.ts           # マップデータ管理
│   │   │   ├── useMembers.ts           # メンバー管理
│   │   │   ├── useRelationships.ts     # 関係性管理
│   │   │   ├── useCommunityDetection.ts # コミュニティ検出
│   │   │   └── useFilteredData.ts      # フィルタリング
│   │   ├── utils/           # ユーティリティ関数
│   │   │   ├── export.ts               # エクスポート機能
│   │   │   ├── import.ts               # インポート機能
│   │   │   └── graphAlgorithms.ts      # グラフアルゴリズム
│   │   ├── services/        # API通信
│   │   ├── styles/          # CSS
│   │   └── test/            # テスト設定
│   ├── vitest.config.ts     # Vitestの設定
│   └── package.json
│
├── backend/                 # バックエンドアプリケーション
│   ├── src/
│   │   ├── routes/         # APIルート
│   │   ├── controllers/    # コントローラー
│   │   ├── services/       # ビジネスロジック
│   │   └── middleware/     # ミドルウェア
│   ├── prisma/
│   │   └── schema.prisma   # データベーススキーマ
│   └── package.json
│
└── shared/                  # 共通の型定義
    └── types.ts
```

## セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL 14以上
- Firebase プロジェクト（認証用）

### 環境変数の設定

#### バックエンド（`backend/.env`）
```env
DATABASE_URL="postgresql://user:password@localhost:5432/influencermap"
PORT=4000
```

#### フロントエンド（`frontend/.env`）
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### インストールと起動

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd influencer-map
```

2. **依存パッケージのインストール**
```bash
# ルートディレクトリで全ワークスペースをインストール
npm install
```

3. **データベースのセットアップ**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

4. **開発サーバーの起動**

すべてのサーバーを同時に起動:
```bash
npm run dev
```

または個別に起動:
```bash
# フロントエンド
npm run dev:frontend

# バックエンド
npm run dev:backend
```

アプリケーションは `http://localhost:5173` でアクセス可能です。

## 使い方

### 1. ログイン
Googleアカウントでログインします。

### 2. マップの作成
1. トップページで「新しいマップを作成」ボタンをクリック
2. マップ名と説明を入力
3. 作成をクリック

### 3. メンバーの追加
1. 左サイドバーの「メンバー」タブを選択
2. フォームにメンバー情報を入力
   - 名前（必須）
   - メールアドレス（必須）
   - 部署（任意）
   - 役職（任意）
3. 「追加」ボタンをクリック

### 4. 関係性の追加
1. 左サイドバーの「関係性」タブを選択
2. ソースとターゲットのメンバーを選択
3. 関係性のタイプを選択（collaboration, mentorship, reporting, friendship）
4. 強度を選択（1-5）
5. 「追加」ボタンをクリック

### 5. グループの作成
1. 左サイドバーの「グループ」タブを選択
2. グループ名、説明、色を入力
3. メンバーを選択
4. 「作成」ボタンをクリック

### 6. データのインポート

#### メンバーのインポート（CSV）
CSVファイル形式:
```csv
name,email,department,position
John Doe,john@example.com,Engineering,Engineer
Jane Smith,jane@example.com,Marketing,Manager
```

必須フィールド: `name`, `email`
任意フィールド: `department`, `position`

#### 関係性のインポート（CSV）
CSVファイル形式:
```csv
source,target,type,strength
john@example.com,jane@example.com,collaboration,3
Jane Smith,Bob Johnson,mentorship,4
```

必須フィールド: `source`, `target`, `type`, `strength`
任意フィールド: `bidirectional`

注意:
- `source`と`target`はメールアドレスまたは名前で指定できます
- `type`: collaboration, mentorship, reporting, friendship
- `strength`: 1-10の整数
- インポート時にバリデーションエラーがあれば表示されます

### 7. データのエクスポート
右サイドバーの「エクスポート」タブから、以下の形式でデータをエクスポートできます:
- **JSON**: 完全なマップデータ（メンバー、関係性、グループ、コミュニティ、中心性データ）
- **CSV（メンバー）**: メンバー一覧
- **CSV（関係性）**: 関係性一覧
- **PNG画像**: グラフの画像（拡大率1x-4x選択可能）

## テスト

### テストの実行
```bash
cd frontend

# watchモードでテスト実行
npm test

# 一度だけテスト実行
npm run test:run

# UIモードでテスト実行
npm run test:ui

# カバレッジレポート付きでテスト実行
npm run test:coverage
```

### テストファイルの配置
- ユーティリティ関数のテスト: `src/utils/*.test.ts`
- コンポーネントのテスト: `src/components/*.test.tsx`

### 実装済みテスト
- エクスポート機能のテスト（10テスト）
- インポート機能のテスト（21テスト）
  - CSV パース機能
  - メンバーインポート（バリデーション含む）
  - 関係性インポート（バリデーション含む）
  - ファイル読み込み

## ビルド

### プロダクションビルド
```bash
# すべてのパッケージをビルド
npm run build

# フロントエンドのみ
npm run build:frontend

# バックエンドのみ
npm run build:backend
```

ビルド後のファイルは `frontend/dist` と `backend/dist` に出力されます。

### ビルド最適化

フロントエンドでは以下の最適化を実装しています:

#### Code Splitting
- React.lazyとSuspenseによるルートベースのコード分割
- 初期ロード時は必要なコンポーネントのみをロード

#### Bundle分割
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'cytoscape': ['cytoscape'],
  'data-vendor': ['@tanstack/react-query', 'zustand'],
  'socket': ['socket.io-client'],
}
```

#### React Memoization
- `React.memo`: 不要な再レンダリングを防止
- `useMemo`: 高コストな計算結果をキャッシュ
- `useCallback`: 関数の再生成を防止

#### グラフレンダリング最適化
- スタイルシートとレイアウト設定を定数化
- グラフ要素（ノード、エッジ）のメモ化
- useEffectの依存配列を最小化

#### 最適化結果
- 初期バンドルサイズ: **213KB**（最適化前: 968KB、**78%削減**）
- チャンク分割による並列ロード
- 改善された初期ロード時間

## パフォーマンスモニタリング

開発時にパフォーマンスをモニタリングするには:

```bash
# ビルドサイズの分析
cd frontend
npm run build
npm run preview
```

ブラウザの開発者ツールのNetwork/Performanceタブでロード時間とバンドルサイズを確認できます。

## トラブルシューティング

### データベース接続エラー
```bash
# Prismaクライアントの再生成
cd backend
npx prisma generate

# マイグレーションの再実行
npx prisma migrate reset
```

### ビルドエラー
```bash
# node_modulesとキャッシュのクリア
rm -rf node_modules .vite dist
npm install
```

### テストエラー
```bash
# テストキャッシュのクリア
npm run test:run -- --clearCache
```

### インポートエラー
- CSVファイルのフォーマットを確認してください
- 必須フィールドが揃っているか確認してください
- エラーメッセージに表示される行番号とフィールドを確認してください

## Firebase設定

Firestoreを使用する場合、以下の手順でFirebaseプロジェクトを設定してください：

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authenticationを有効化してGoogleプロバイダを設定
3. Firestoreデータベースを有効化
4. サービスアカウントキーを生成
5. `.env` ファイルにFirebase認証情報を設定

詳細は [Firebase Admin SDK ドキュメント](https://firebase.google.com/docs/admin/setup)を参照してください。

## デプロイ

本番環境へのデプロイについては、詳細な手順書をご覧ください：

**[デプロイメント手順書（docs/DEPLOYMENT.md）](./docs/DEPLOYMENT.md)**

### クイックスタート

```bash
# フロントエンドのビルドテスト
npm run build:frontend

# バックエンドのビルドテスト
npm run build:backend
```

## 開発コマンド

### リント
```bash
# すべてのパッケージでリント実行
npm run lint
```

### 型チェック
```bash
# フロントエンド
cd frontend
npm run type-check

# バックエンド
cd backend
npm run type-check
```

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissuesページで報告してください。

## 参考ドキュメント

- [CLAUDE.md](./CLAUDE.md) - 詳細な要件定義
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - デプロイメント手順
