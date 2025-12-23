# 開発ロードマップ

**作成日**: 2025-12-23
**対象期間**: 2025-12 〜 2026-02（約10週間）

---

## 📅 全体スケジュール

```
Week  1-3: Phase 1 - データ永続化と認証
Week  4-6: Phase 2 - 分析機能実装
Week  7-8: Phase 3 - 可視化とUX改善
Week  9-10: Phase 4 - 品質向上とCI/CD
Week 11+: Phase 5 - 拡張機能（オプション）
```

---

## Phase 1: データ永続化と認証（Week 1-3）

### Week 1: データベース移行

#### Day 1-2: 環境構築と設計
**タスク**:
- [ ] Firestore環境構築（Firebase Consoleセットアップ）
- [ ] Firebase Admin SDK導入
- [ ] データモデル設計レビュー
  - Maps コレクション
  - Members サブコレクション（mapId配下）
  - Relationships サブコレクション
  - Groups サブコレクション
  - Communities サブコレクション（分析結果用）

**成果物**:
- Firebase プロジェクト
- データモデル設計書
- `firebase.config.ts`

**ファイル**:
```
backend/src/config/firebase.ts
backend/src/repositories/FirestoreRepository.ts
```

#### Day 3-4: Repository層実装
**タスク**:
- [ ] FirestoreMapRepository実装
- [ ] FirestoreMemberRepository実装
- [ ] FirestoreRelationshipRepository実装
- [ ] FirestoreGroupRepository実装

**成果物**:
- Repository層完成
- Service層をRepositoryに切り替え

**変更ファイル**:
```
backend/src/services/mapService.ts
backend/src/services/memberService.ts
backend/src/services/relationshipService.ts
backend/src/services/groupService.ts
```

#### Day 5: マイグレーションとテスト
**タスク**:
- [ ] InMemoryStorage削除
- [ ] データマイグレーションスクリプト（既存データがあれば）
- [ ] 動作確認テスト
- [ ] パフォーマンステスト（50件データ）

**成果物**:
- データベース移行完了
- マイグレーションドキュメント

---

### Week 2: 認証機能実装

#### Day 1-2: Firebase Authentication統合
**タスク**:
- [ ] Firebase Authentication有効化（Google Provider）
- [ ] フロントエンド：Firebase SDKインストール
- [ ] ログイン/ログアウトコンポーネント実装
- [ ] 認証状態管理（Context/Zustand）

**成果物**:
- ログインUI
- 認証Contextプロバイダー

**新規ファイル**:
```
frontend/src/contexts/AuthContext.tsx
frontend/src/components/LoginButton.tsx
frontend/src/components/LogoutButton.tsx
frontend/src/pages/Login.tsx
```

#### Day 3-4: バックエンド認証
**タスク**:
- [ ] Firebase Admin SDK認証検証実装
- [ ] 認証ミドルウェア作成
- [ ] 全APIルートに認証適用
- [ ] JWTトークン検証

**成果物**:
- 認証ミドルウェア
- 保護されたAPIルート

**新規ファイル**:
```
backend/src/middleware/auth.ts
backend/src/utils/firebaseAdmin.ts
```

**変更ファイル**:
```
backend/src/routes/*.ts (全ルート)
```

#### Day 5: 権限管理とテスト
**タスク**:
- [ ] ユーザー権限チェック（マップ所有者のみ編集可能など）
- [ ] 認証エラーハンドリング
- [ ] 認証フロー統合テスト

**成果物**:
- 権限管理機能
- 認証フローの動作確認

---

### Week 3: デプロイメント準備

#### Day 1-2: フロントエンドデプロイ
**タスク**:
- [ ] Vercel プロジェクト作成
- [ ] 環境変数設定（Firebase Config）
- [ ] ビルド最適化
- [ ] デプロイテスト

**成果物**:
- Vercelデプロイ環境
- ステージング環境URL

**設定ファイル**:
```
vercel.json
.env.production
```

#### Day 3-4: バックエンドデプロイ
**タスク**:
- [ ] Render プロジェクト作成
- [ ] 環境変数設定（Firebase Admin SDK credentials）
- [ ] CORS設定更新（本番ドメイン）
- [ ] デプロイテスト

**成果物**:
- Renderデプロイ環境
- 本番APIエンドポイント

**設定ファイル**:
```
render.yaml
.env.production
```

#### Day 5: 統合テストとドキュメント
**タスク**:
- [ ] 本番環境での動作確認
- [ ] HTTPS動作確認
- [ ] データバックアップ設定（Firestoreエクスポート）
- [ ] デプロイメント手順書作成

**成果物**:
- 本番運用開始可能な状態
- デプロイメント手順書

---

## Phase 2: 分析機能実装（Week 4-6）

### Week 4: コミュニティ検出基盤

#### Day 1-2: graphologyライブラリ統合
**タスク**:
- [ ] graphologyインストール
- [ ] グラフデータ変換ユーティリティ作成
- [ ] Louvainアルゴリズムテスト実装

**成果物**:
- グラフユーティリティ関数

**新規ファイル**:
```
backend/src/utils/graphConverter.ts
backend/src/services/graphAnalysisService.ts
```

#### Day 3-4: コミュニティ検出API
**タスク**:
- [ ] コミュニティ検出ロジック実装
- [ ] `POST /api/analysis/communities/refresh` 実装
- [ ] `GET /api/analysis/communities` 実装
- [ ] Firestore Communitiesコレクションへ保存

**成果物**:
- コミュニティ検出API
- コミュニティ結果の永続化

**新規ファイル**:
```
backend/src/controllers/analysisController.ts
backend/src/routes/analysisRoutes.ts
```

#### Day 5: フロントエンド統合
**タスク**:
- [ ] コミュニティ検出APIクライアント実装
- [ ] コミュニティ再分析ボタン追加
- [ ] コミュニティ一覧表示UI

**成果物**:
- コミュニティ管理UI

**新規ファイル**:
```
frontend/src/hooks/useCommunities.ts
frontend/src/components/CommunityPanel.tsx
```

---

### Week 5: グラフ分析アルゴリズム

#### Day 1-2: 中心性分析実装
**タスク**:
- [ ] 次数中心性計算
- [ ] 媒介中心性計算
- [ ] 固有ベクトル中心性計算（オプション）
- [ ] 中心性スコア保存

**成果物**:
- 中心性分析機能

**変更ファイル**:
```
backend/src/services/graphAnalysisService.ts
shared/types/member.ts (centralityScore追加)
```

#### Day 3-4: ノードサイズ・色の反映
**タスク**:
- [ ] ノードサイズを中心性に応じて変更
- [ ] ノードの色をコミュニティに応じて変更
- [ ] 部署による色分けオプション追加

**成果物**:
- 視覚的に意味のあるグラフ表示

**変更ファイル**:
```
frontend/src/components/NetworkGraph.tsx
frontend/src/styles/App.css
```

#### Day 5: 孤立ノード検出
**タスク**:
- [ ] 孤立メンバー検出ロジック実装
- [ ] 警告表示UI実装
- [ ] 孤立メンバー一覧パネル

**成果物**:
- 孤立メンバー検出機能

**新規ファイル**:
```
frontend/src/components/IsolatedMembersPanel.tsx
```

---

### Week 6: 統計情報拡張

#### Day 1-3: 詳細統計パネル実装
**タスク**:
- [ ] 統計情報パネルコンポーネント作成
- [ ] コミュニティごとの統計表示
- [ ] 影響力ランキング表示
- [ ] 関係性統計（種類別・強度別）
- [ ] 折りたたみ機能実装

**成果物**:
- 詳細統計ダッシュボード

**新規ファイル**:
```
frontend/src/components/StatisticsPanel.tsx
frontend/src/components/CommunityStats.tsx
frontend/src/components/InfluenceRanking.tsx
```

#### Day 4-5: グラフと統計の連携
**タスク**:
- [ ] グラフ選択時の統計表示
- [ ] 統計からグラフへのハイライト
- [ ] アニメーション改善

**成果物**:
- インタラクティブな統計表示

---

## Phase 3: 可視化とUX改善（Week 7-8）

### Week 7: グラフ可視化の強化

#### Day 1-2: エッジの表現力向上
**タスク**:
- [ ] エッジの太さを関係強度に応じて変更
- [ ] エッジの色を関係種類に応じて変更
- [ ] 双方向エッジの矢印表示改善

**成果物**:
- 表現力豊かなグラフ

**変更ファイル**:
```
frontend/src/components/NetworkGraph.tsx
```

#### Day 3-4: Tooltip実装
**タスク**:
- [ ] ノードホバー時のTooltipコンポーネント
- [ ] メンバー詳細情報表示
- [ ] 中心性スコア表示
- [ ] エッジホバー時のTooltip
- [ ] 関係性詳細表示

**成果物**:
- 詳細情報Tooltip

**新規ファイル**:
```
frontend/src/components/NodeTooltip.tsx
frontend/src/components/EdgeTooltip.tsx
```

#### Day 5: アニメーション改善
**タスク**:
- [ ] レイアウトアニメーション調整
- [ ] データ更新時のスムーズな遷移
- [ ] フィルタ適用時のアニメーション

**成果物**:
- スムーズなユーザー体験

---

### Week 8: フィルタリング・検索とレスポンシブ対応

#### Day 1-2: 検索・フィルタUI実装
**タスク**:
- [ ] 検索バーコンポーネント実装
- [ ] メンバー名インクリメンタル検索
- [ ] 部署フィルタドロップダウン
- [ ] 関係性種類フィルタ
- [ ] 関係強度スライダー
- [ ] 複合フィルタ機能

**成果物**:
- 完全なフィルタリング機能

**新規ファイル**:
```
frontend/src/components/SearchBar.tsx
frontend/src/components/FilterPanel.tsx
frontend/src/hooks/useGraphFilter.ts
```

#### Day 3-4: レスポンシブ対応
**タスク**:
- [ ] タブレット表示最適化
- [ ] サイドバー折りたたみ機能
- [ ] モバイル閲覧モード実装
- [ ] グラフのタッチ操作対応

**成果物**:
- マルチデバイス対応

**変更ファイル**:
```
frontend/src/styles/App.css
frontend/src/components/*.tsx
```

#### Day 5: UX最終調整
**タスク**:
- [ ] ローディング状態の改善
- [ ] エラーメッセージの改善
- [ ] 空状態の改善
- [ ] アクセシビリティ対応（ARIA属性）

**成果物**:
- 洗練されたUI/UX

---

## Phase 4: 品質向上とCI/CD（Week 9-10）

### Week 9: テスト実装

#### Day 1-2: バックエンドテスト
**タスク**:
- [ ] Jest + Supertest環境構築
- [ ] Service層ユニットテスト
  - mapService.test.ts
  - memberService.test.ts
  - relationshipService.test.ts
  - groupService.test.ts
  - graphAnalysisService.test.ts
- [ ] Repository層モック

**成果物**:
- バックエンドテストカバレッジ 50%+

**新規ファイル**:
```
backend/src/**/*.test.ts
backend/jest.config.js
```

#### Day 3-4: フロントエンドテスト
**タスク**:
- [ ] React Testing Library環境構築
- [ ] Hooksテスト
  - useMembers.test.tsx
  - useRelationships.test.tsx
  - useGroups.test.tsx
  - useMaps.test.tsx
- [ ] Componentsテスト
  - NetworkGraph.test.tsx
  - MemberForm.test.tsx
  - FilterPanel.test.tsx

**成果物**:
- フロントエンドテストカバレッジ 50%+

**新規ファイル**:
```
frontend/src/**/*.test.tsx
frontend/jest.config.js
```

#### Day 5: 統合テスト
**タスク**:
- [ ] API統合テスト
- [ ] E2Eテスト環境構築（Playwright）
- [ ] 主要ユーザーフローのE2Eテスト

**成果物**:
- E2Eテストスイート

---

### Week 10: CI/CD構築とモニタリング

#### Day 1-2: GitHub Actions設定
**タスク**:
- [ ] .github/workflows/ci.yml作成
- [ ] 自動テスト実行（PR時）
- [ ] 自動ビルドチェック
- [ ] Lint・Formatチェック

**成果物**:
- CI パイプライン

**新規ファイル**:
```
.github/workflows/ci.yml
.github/workflows/deploy.yml
```

#### Day 3-4: 自動デプロイ設定
**タスク**:
- [ ] mainブランチへのマージ時自動デプロイ
- [ ] developブランチ→ステージング環境
- [ ] プレビュー環境設定（PR単位）
- [ ] ロールバック手順確立

**成果物**:
- CD パイプライン

#### Day 5: モニタリング設定
**タスク**:
- [ ] Sentryエラートラッキング設定
- [ ] パフォーマンス監視設定
- [ ] ログ集約設定（Vercel/Render標準ツール）
- [ ] アラート設定

**成果物**:
- 運用監視体制

---

## Phase 5: 拡張機能（Week 11+、オプション）

### データエクスポート機能（1週間）
**タスク**:
- [ ] CSV出力API実装
- [ ] JSON出力API実装
- [ ] グラフ画像エクスポート（PNG/SVG）
- [ ] エクスポートボタンUI

**成果物**:
- データエクスポート機能

---

### 時系列分析（2週間）
**タスク**:
- [ ] 関係性の履歴記録機能
- [ ] タイムスタンプ管理
- [ ] 時系列グラフ表示
- [ ] 変化の可視化

**成果物**:
- 時系列分析機能

---

### 外部ツール連携（2週間）
**タスク**:
- [ ] Slack Webhook統合
- [ ] 通知機能実装
- [ ] Google Workspace API統合（組織情報同期）
- [ ] GitHub API統合（コミット分析）

**成果物**:
- 外部連携機能

---

## 📊 進捗管理

### マイルストーン達成条件

#### M1: 本番運用可能（Week 3終了時）
- [ ] Firestore移行完了
- [ ] Google SSO認証機能
- [ ] Vercel + Renderデプロイ完了
- [ ] 50人データの安全な永続化
- [ ] データバックアップ設定

#### M2: 分析機能提供（Week 6終了時）
- [ ] コミュニティ検出機能動作
- [ ] 中心性分析機能動作
- [ ] ノードサイズ・色が意味を持つ
- [ ] 詳細統計ダッシュボード表示
- [ ] 孤立メンバー検出

#### M3: 高度なUX提供（Week 8終了時）
- [ ] フィルタリング・検索機能完備
- [ ] Tooltip表示
- [ ] タブレット・モバイル対応
- [ ] スムーズなアニメーション

#### M4: 高品質な開発体制（Week 10終了時）
- [ ] テストカバレッジ 50%以上
- [ ] CI/CD パイプライン稼働
- [ ] エラー監視体制構築
- [ ] 自動デプロイ機能

---

## 🔄 週次レビュー項目

### 毎週金曜日に確認
1. **進捗確認**
   - 完了タスク数
   - 遅延タスクと理由
   - ブロッカーの有無

2. **品質確認**
   - テストカバレッジ
   - バグ件数
   - パフォーマンス指標

3. **次週計画**
   - 優先タスク確認
   - リソース調整
   - リスク評価

---

## ⚡ クリティカルパス

以下のタスクは遅延すると全体に影響：

1. **Week 1 Day 1-2**: Firestore環境構築
2. **Week 2 Day 1-2**: Firebase Authentication統合
3. **Week 3 Day 1-2**: Vercelデプロイ
4. **Week 4 Day 1-2**: graphology統合
5. **Week 9 Day 1-2**: テスト環境構築
6. **Week 10 Day 1-2**: CI/CD設定

---

## 📝 備考

- 各フェーズの最終日は予備日として確保
- 緊急の本番不具合対応は優先度最高
- オプション機能（Phase 5）はリソース次第で調整可能
