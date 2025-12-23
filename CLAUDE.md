# インフルエンサーマップ - 要件定義書

## 1. プロジェクト概要

### 1.1 目的
組織内のメンバー間の関係性と影響力を可視化し、チームのコミュニケーション構造やキーパーソンを把握するためのダッシュボードを開発する。

### 1.2 対象組織
- 規模: 10-50人の小規模組織
- 初期段階での手動データ入力を想定

### 1.3 プロジェクトゴール
- メンバー間の関係性をネットワークグラフで可視化
- コミュニティ（関係の密なグループ）の自動検出
- リアルタイムでのデータ更新と表示

---

## 2. 技術要件

### 2.1 システムアーキテクチャ

#### フロントエンド
- **フレームワーク**: React
- **言語**: TypeScript（推奨）
- **ビジュアライゼーションライブラリ**:
  - D3.js / React Flow / Cytoscape.js（ネットワークグラフ用）
  - 候補から選定が必要
- **状態管理**: Redux / Zustand / Jotai（規模に応じて選択）
- **UIライブラリ**: Material-UI / Ant Design / Chakra UI（任意）

#### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Express または NestJS
  - Express: 軽量でシンプル
  - NestJS: TypeScript完全対応、構造化されたアーキテクチャ（推奨）
- **言語**: TypeScript
- **リアルタイム通信**:
  - WebSocket（Socket.io）またはServer-Sent Events (SSE)
  - リアルタイム要件を満たすため必須

#### データベース
- **種類**: NoSQL
- **選択肢**:
  - **MongoDB**: 柔軟なスキーマ、成熟したエコシステム
  - **Firestore**: リアルタイム同期機能が組み込み、PaaSデプロイに相性良い
- **推奨**: Firestore（リアルタイム要件とPaaSデプロイを考慮）

### 2.2 デプロイメント環境

- **ホスティング**: PaaS（Platform as a Service）
  - **フロントエンド**: Vercel / Netlify
  - **バックエンド**:
    - Vercel（Next.js API Routesを使用する場合）
    - Render / Railway（Express/NestJSの場合）
  - **データベース**:
    - Firebase（Firestoreを選択した場合）
    - MongoDB Atlas（MongoDBを選択した場合）

### 2.3 認証・セキュリティ

- **認証方式**: 社内SSO連携
  - Google Workspace認証（Google OAuth 2.0）
  - または Azure AD（Microsoft Entra ID）
- **認証ライブラリ**:
  - NextAuth.js（Next.jsを使用する場合）
  - Passport.js（Express/NestJSの場合）
  - Firebase Authentication（Firestoreと組み合わせる場合）
- **セキュリティ要件**:
  - HTTPS通信（必須）
  - CORS設定
  - Rate limiting（APIの保護）
  - JWTトークンによるセッション管理

---

## 3. 機能要件

### 3.1 コア機能

#### A. データ管理機能
- **メンバー管理**:
  - メンバーの追加・編集・削除
  - プロフィール情報（名前、部署、役職、アバター）
  - 社内SSO連携による自動プロフィール取得（オプション）

- **関係性データ入力**:
  - メンバー間の関係を手動で登録
  - 関係性の種類（例: 協力関係、報告関係、メンター関係）
  - 関係の強度（1-5段階のスコア）
  - 双方向/片方向の関係性対応

#### B. 可視化機能
- **ネットワークグラフ表示**:
  - インタラクティブなネットワークグラフ
  - ノード（メンバー）の表示
    - サイズ: 影響力の大きさ
    - 色: 部署やコミュニティ分類
  - エッジ（関係性）の表示
    - 太さ: 関係の強度
    - 色/スタイル: 関係の種類
  - ズーム・パン操作
  - ノードのドラッグ移動
  - ノード・エッジのホバーで詳細情報表示

- **フィルタリング・検索**:
  - メンバー名検索
  - 部署でフィルタ
  - 関係性の種類でフィルタ
  - 関係の強度でフィルタ

#### C. 分析機能
- **コミュニティ検出**:
  - グラフアルゴリズムによる自動グループ分け
  - アルゴリズム候補:
    - Louvain法
    - Label Propagation
    - Modularity最適化
  - 検出されたコミュニティの可視化（色分け）
  - コミュニティごとの統計情報表示

- **基本的な統計情報**:
  - 総メンバー数
  - 総関係数
  - 検出されたコミュニティ数
  - 孤立したメンバーの検出

### 3.2 リアルタイム機能

- データ変更時の即時反映:
  - メンバー追加・削除時
  - 関係性の追加・変更・削除時
- 複数ユーザーが同時に閲覧している場合の同期
- データ更新時のスムーズなアニメーション

### 3.3 ユーザーインターフェース要件

- **レスポンシブデザイン**:
  - デスクトップ優先（主な利用環境）
  - タブレット対応（閲覧のみ）
  - モバイルは閲覧モードのみ

- **ダッシュボードレイアウト**:
  - メインエリア: ネットワークグラフ表示
  - サイドバー: フィルタ・検索機能
  - ヘッダー: ナビゲーション、ユーザー情報
  - 統計情報パネル（折りたたみ可能）

---

## 4. 非機能要件

### 4.1 パフォーマンス
- 初回ロード時間: 3秒以内（50人のデータ）
- グラフ操作のレスポンス: 60fps維持
- データ更新の反映: 1秒以内

### 4.2 スケーラビリティ
- 初期対象: 10-50人
- 将来的な拡張: 100人程度まで対応可能な設計

### 4.3 可用性
- 稼働時間: 99%以上（PaaSの標準SLA）
- バックアップ: 日次自動バックアップ（データベース）

### 4.4 メンテナンス性
- コードの可読性: TypeScriptとESLint/Prettierの使用
- ドキュメント: README、API仕様書
- テスト: ユニットテストカバレッジ 70%以上（目標）

---

## 5. データモデル（概要）

### 5.1 Member（メンバー）
```typescript
interface Member {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Relationship（関係性）
```typescript
interface Relationship {
  id: string;
  sourceId: string;      // 関係の起点となるメンバーID
  targetId: string;      // 関係の対象となるメンバーID
  type: 'collaboration' | 'reporting' | 'mentoring' | 'other';
  strength: 1 | 2 | 3 | 4 | 5;  // 関係の強度
  bidirectional: boolean;  // 双方向か片方向か
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3 Community（コミュニティ）※分析結果
```typescript
interface Community {
  id: string;
  name?: string;
  memberIds: string[];
  color: string;  // 可視化用の色
  detectedAt: Date;
}
```

---

## 6. APIエンドポイント（概要）

### メンバー管理
- `GET /api/members` - メンバー一覧取得
- `POST /api/members` - メンバー追加
- `GET /api/members/:id` - 特定メンバー取得
- `PUT /api/members/:id` - メンバー更新
- `DELETE /api/members/:id` - メンバー削除

### 関係性管理
- `GET /api/relationships` - 関係性一覧取得
- `POST /api/relationships` - 関係性追加
- `PUT /api/relationships/:id` - 関係性更新
- `DELETE /api/relationships/:id` - 関係性削除

### 分析
- `GET /api/analysis/communities` - コミュニティ検出結果取得
- `POST /api/analysis/communities/refresh` - コミュニティ再分析

### リアルタイム通信
- WebSocket接続: `ws://[host]/api/realtime`
  - イベント: `member:created`, `member:updated`, `member:deleted`
  - イベント: `relationship:created`, `relationship:updated`, `relationship:deleted`

---

## 7. 開発フェーズ（推奨）

### フェーズ1: MVP（最小機能製品）
- [ ] プロジェクトセットアップ（React + Node.js + データベース）
- [ ] 認証機能実装（Google SSO）
- [ ] メンバー管理CRUD
- [ ] 関係性管理CRUD
- [ ] 基本的なネットワークグラフ表示
- [ ] デプロイ環境構築

### フェーズ2: コア機能拡張
- [ ] リアルタイム同期機能
- [ ] フィルタ・検索機能
- [ ] インタラクティブなグラフ操作
- [ ] レスポンシブデザイン対応

### フェーズ3: 分析機能
- [ ] コミュニティ検出アルゴリズム実装
- [ ] 統計情報ダッシュボード
- [ ] データエクスポート機能

### フェーズ4: 拡張機能（オプション）
- [ ] 外部ツール連携（Slack/GitHub等）
- [ ] 時系列分析
- [ ] より高度なグラフアルゴリズム

---

## 8. リスクと対策

### 技術的リスク
| リスク | 影響 | 対策 |
|--------|------|------|
| グラフ描画のパフォーマンス低下 | 高 | 仮想化、WebGL活用、データのページネーション |
| リアルタイム同期の複雑性 | 中 | Firestoreのリアルタイム機能活用、簡素な状態管理 |
| SSO連携の認証エラー | 中 | 詳細なエラーハンドリング、フォールバック機能 |

### プロジェクトリスク
| リスク | 影響 | 対策 |
|--------|------|------|
| 要件の曖昧さ | 高 | プロトタイプによる早期検証、定期的なレビュー |
| スコープクリープ | 中 | MVP優先、段階的な機能追加 |

---

## 9. 成功基準

- [ ] 10-50人の組織データを快適に表示・操作可能
- [ ] リアルタイムでのデータ同期が正常に動作
- [ ] コミュニティ検出が実用的な結果を返す
- [ ] ユーザーが直感的に操作可能なUI
- [ ] 社内SSOでのログインが安全に機能
- [ ] PaaS環境への安定したデプロイ

---

## 10. 次のステップ

1. **技術選定の最終決定**:
   - ネットワークグラフライブラリの選定（D3.js / React Flow / Cytoscape.js）
   - データベースの確定（Firestore vs MongoDB）
   - バックエンドフレームワークの確定（Express vs NestJS）

2. **プロジェクト環境セットアップ**:
   - Gitリポジトリ作成
   - 開発環境構築（linter, formatter, pre-commit hooks）
   - CI/CD設定

3. **プロトタイプ開発**:
   - 簡易的なネットワークグラフの実装
   - データ入力フォームの実装
   - 基本的なCRUD操作の実装

4. **ユーザーテスト**:
   - 小規模データでの動作検証
   - UIの使いやすさ評価
   - フィードバック収集と改善

---

## 付録A: 参考ライブラリ・ツール

### フロントエンド
- **グラフ可視化**:
  - [React Flow](https://reactflow.dev/) - React専用、使いやすい
  - [Cytoscape.js](https://js.cytoscape.org/) - 高機能、グラフ分析アルゴリズム内蔵
  - [D3.js](https://d3js.org/) - 柔軟性が高いが学習コストも高い
  - [vis-network](https://visjs.org/) - シンプルで軽量

### バックエンド
- **グラフ分析**:
  - [graphology](https://graphology.github.io/) - JavaScriptグラフライブラリ
  - [jsnx](http://jsnetworkx.org/) - NetworkX（Python）のJavaScript版

### 認証
- [NextAuth.js](https://next-auth.js.org/)
- [Passport.js](http://www.passportjs.org/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

### リアルタイム通信
- [Socket.io](https://socket.io/)
- [Firestore Realtime Updates](https://firebase.google.com/docs/firestore/query-data/listen)

---

**ドキュメントバージョン**: 1.0
**作成日**: 2025-12-22
**最終更新日**: 2025-12-22
