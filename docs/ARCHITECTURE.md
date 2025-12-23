# アーキテクチャ設計

## システム構成図

```
┌─────────────────────────────────────────────────────────┐
│                     ユーザー                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Components  │  │   Services   │  │   Zustand    │  │
│  │              │  │              │  │   (State)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                             │
│         │                  │ REST API / WebSocket        │
└─────────┼──────────────────┼─────────────────────────────┘
          │                  │
          │                  ▼
┌─────────┼──────────────────────────────────────────────┐
│         │         Backend (Node.js + Express)          │
│         │  ┌──────────────┐  ┌──────────────┐          │
│         │  │  Controllers │  │   Services   │          │
│         │  └──────┬───────┘  └──────┬───────┘          │
│         │         │                 │                   │
│         │         │                 │                   │
│         │  ┌──────▼─────────────────▼───────┐          │
│         └─►│       Socket.io Server          │          │
│            └─────────────────────────────────┘          │
│                        │                                 │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    Firestore    │
                │   (Database)    │
                └─────────────────┘
```

## データフロー

### 1. メンバー作成フロー

```
User → Frontend → POST /api/members → Backend → Firestore
                                          │
                                          ├─→ Socket.io broadcast
                                          │   (member:created event)
                                          │
Frontend ←──────────────────────────────────┘
(リアルタイム更新)
```

### 2. コミュニティ検出フロー

```
User → Frontend → POST /api/analysis/communities/refresh
                     │
                     ▼
                  Backend
                     │
                     ├─→ Firestoreからデータ取得
                     ├─→ グラフアルゴリズム実行
                     ├─→ 結果をFirestoreに保存
                     └─→ Socket.io broadcast
                           (community:updated event)
                     │
Frontend ←──────────┘
(グラフ再描画)
```

## モジュール設計

### Frontend

#### コンポーネント構成

```
src/
├── components/
│   ├── Graph/
│   │   ├── NetworkGraph.tsx      # メイングラフコンポーネント
│   │   ├── NodeDetail.tsx        # ノード詳細表示
│   │   └── GraphControls.tsx     # ズーム/フィルタコントロール
│   ├── Member/
│   │   ├── MemberList.tsx        # メンバー一覧
│   │   ├── MemberForm.tsx        # メンバー追加/編集フォーム
│   │   └── MemberCard.tsx        # メンバーカード表示
│   ├── Relationship/
│   │   ├── RelationshipForm.tsx  # 関係性追加フォーム
│   │   └── RelationshipList.tsx  # 関係性一覧
│   └── Common/
│       ├── Header.tsx            # ヘッダー
│       ├── Sidebar.tsx           # サイドバー
│       └── Loading.tsx           # ローディング表示
├── pages/
│   └── Dashboard.tsx             # ダッシュボードページ
├── services/
│   ├── api.ts                    # APIクライアント
│   ├── socket.ts                 # WebSocketクライアント
│   └── graphAnalysis.ts          # グラフ分析ロジック
└── stores/
    ├── memberStore.ts            # メンバー状態管理
    ├── relationshipStore.ts      # 関係性状態管理
    └── graphStore.ts             # グラフ表示状態管理
```

### Backend

#### API構成

```
src/
├── routes/
│   ├── members.ts                # メンバーAPIルート
│   ├── relationships.ts          # 関係性APIルート
│   └── analysis.ts               # 分析APIルート
├── controllers/
│   ├── memberController.ts       # メンバー操作
│   ├── relationshipController.ts # 関係性操作
│   └── analysisController.ts     # コミュニティ分析
├── services/
│   ├── memberService.ts          # メンバービジネスロジック
│   ├── relationshipService.ts    # 関係性ビジネスロジック
│   ├── communityService.ts       # コミュニティ検出ロジック
│   └── socketService.ts          # WebSocket管理
├── models/
│   ├── Member.ts                 # メンバーモデル
│   ├── Relationship.ts           # 関係性モデル
│   └── Community.ts              # コミュニティモデル
└── middleware/
    ├── auth.ts                   # 認証ミドルウェア
    ├── errorHandler.ts           # エラーハンドリング
    └── validation.ts             # リクエスト検証
```

## データベーススキーマ（Firestore）

### Collections

#### members

```
/members/{memberId}
{
  id: string
  name: string
  email: string
  department?: string
  position?: string
  avatarUrl?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### relationships

```
/relationships/{relationshipId}
{
  id: string
  sourceId: string
  targetId: string
  type: 'collaboration' | 'reporting' | 'mentoring' | 'other'
  strength: 1 | 2 | 3 | 4 | 5
  bidirectional: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### communities

```
/communities/{communityId}
{
  id: string
  name?: string
  memberIds: string[]
  color: string
  detectedAt: timestamp
}
```

## セキュリティ考慮事項

### 認証・認可

- Google SSOによる認証
- JWTトークンによるセッション管理
- Firestoreセキュリティルールによるアクセス制御

### データ保護

- HTTPS通信の強制
- CORS設定による不正アクセス防止
- Rate limitingによるDDoS対策
- 入力バリデーション

## パフォーマンス最適化

### フロントエンド

- グラフの仮想化（大量ノード対応）
- メモ化によるコンポーネント再レンダリング抑制
- 遅延ローディング
- Service Workerによるキャッシング（将来）

### バックエンド

- データベースクエリの最適化
- レスポンスのキャッシング
- WebSocketコネクションプーリング
- 非同期処理の活用

## スケーラビリティ

### 水平スケーリング

- ステートレスなAPIサーバー設計
- Firestoreの自動スケーリング活用
- ロードバランサーの導入（将来）

### 垂直スケーリング

- コンピュートリソースの増強
- データベース接続プールの調整

## 監視・ログ

- アプリケーションログ（Morgan）
- エラートラッキング（将来: Sentry等）
- パフォーマンスモニタリング（将来）
- ユーザー行動分析（将来）
