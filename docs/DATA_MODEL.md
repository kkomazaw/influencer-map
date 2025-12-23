# データモデル設計

**作成日**: 2025-12-23
**バージョン**: 1.0
**対象**: Firestore データベース

---

## 📋 概要

Influencer Mapアプリケーションで使用するFirestoreのデータモデル定義です。

### 設計原則

1. **マップ中心設計**: すべてのデータはMapエンティティを起点とする
2. **サブコレクション活用**: 関連データはサブコレクションとして管理
3. **クエリ最適化**: 頻繁なクエリパターンに最適化したインデックス設計
4. **スケーラビリティ**: 50-100人規模でのパフォーマンスを考慮
5. **リアルタイム対応**: Firestore Snapshot Listenerに適した構造

---

## 🗂️ コレクション構造

```
/maps                           (ルートコレクション)
  /{mapId}                      (マップドキュメント)
    /members                    (サブコレクション)
      /{memberId}               (メンバードキュメント)
    /relationships              (サブコレクション)
      /{relationshipId}         (関係性ドキュメント)
    /groups                     (サブコレクション)
      /{groupId}                (グループドキュメント)
    /communities                (サブコレクション)
      /{communityId}            (コミュニティドキュメント)
```

---

## 📦 エンティティ定義

### 1. Map (マップ)

**パス**: `/maps/{mapId}`

**目的**: 組織関係図の最上位エンティティ。各マップは独立した組織ビューを表す。

```typescript
interface Map {
  id: string                    // ドキュメントID
  name: string                  // マップ名（例: "2025年度 営業部"）
  description?: string          // マップ説明
  thumbnail?: string            // サムネイルURL（将来実装）
  ownerId: string               // マップ作成者のUID（Firebase Auth）
  createdAt: Timestamp          // 作成日時
  updatedAt: Timestamp          // 更新日時
}
```

**インデックス**:
- `ownerId` (ASC) + `createdAt` (DESC): 自分のマップを新しい順に取得

**セキュリティルール**:
```javascript
match /maps/{mapId} {
  allow read: if request.auth != null && resource.data.ownerId == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
}
```

---

### 2. Member (メンバー)

**パス**: `/maps/{mapId}/members/{memberId}`

**目的**: 組織内の個人を表す。マップごとに独立して管理。

```typescript
interface Member {
  id: string                    // ドキュメントID
  mapId: string                 // 親マップID（クエリ用）
  name: string                  // 氏名
  email?: string                // メールアドレス
  department?: string           // 部署
  position?: string             // 役職
  centralityScore?: number      // 中心性スコア（計算後に設定）
  communityId?: string          // 所属コミュニティID（分析後に設定）
  createdAt: Timestamp          // 作成日時
  updatedAt: Timestamp          // 更新日時
}
```

**インデックス**:
- `name` (ASC): 名前検索用
- `department` (ASC): 部署フィルタ用
- `centralityScore` (DESC): 影響力ランキング用

**セキュリティルール**:
```javascript
match /maps/{mapId}/members/{memberId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/maps/$(mapId)).data.ownerId == request.auth.uid;
}
```

---

### 3. Relationship (関係性)

**パス**: `/maps/{mapId}/relationships/{relationshipId}`

**目的**: メンバー間の関係性を表す。グラフのエッジに相当。

```typescript
interface Relationship {
  id: string                    // ドキュメントID
  mapId: string                 // 親マップID（クエリ用）
  sourceId: string              // 関係元メンバーID
  targetId: string              // 関係先メンバーID
  type: RelationshipType        // 関係性種別
  strength: number              // 関係強度（1-10）
  bidirectional: boolean        // 双方向フラグ
  createdAt: Timestamp          // 作成日時
  updatedAt: Timestamp          // 更新日時
}

enum RelationshipType {
  REPORTING = 'reporting',      // 報告関係
  COLLABORATION = 'collaboration', // 協力関係
  MENTORING = 'mentoring',      // メンタリング
  FRIENDSHIP = 'friendship',    // 友人関係
  COMMUNICATION = 'communication', // コミュニケーション
  OTHER = 'other'               // その他
}
```

**インデックス**:
- `sourceId` (ASC): 特定メンバーの関係性取得用
- `targetId` (ASC): 特定メンバーへの関係性取得用
- `type` (ASC): 関係性種別フィルタ用

**複合インデックス**:
- `sourceId` (ASC) + `type` (ASC): 特定メンバーの特定種別の関係性
- `sourceId` (ASC) + `strength` (DESC): 特定メンバーの強い関係性順

**セキュリティルール**:
```javascript
match /maps/{mapId}/relationships/{relationshipId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/maps/$(mapId)).data.ownerId == request.auth.uid;
}
```

---

### 4. Group (グループ)

**パス**: `/maps/{mapId}/groups/{groupId}`

**目的**: メンバーの仮想的なグルーピング。プロジェクトチームや部署横断チーム等。

```typescript
interface Group {
  id: string                    // ドキュメントID
  mapId: string                 // 親マップID（クエリ用）
  name: string                  // グループ名
  description?: string          // グループ説明
  color: string                 // 表示色（HEX）
  memberIds: string[]           // 所属メンバーIDリスト
  createdAt: Timestamp          // 作成日時
  updatedAt: Timestamp          // 更新日時
}
```

**インデックス**:
- `name` (ASC): グループ名検索用

**配列クエリ**:
- `memberIds` array-contains: 特定メンバーが所属するグループ取得

**セキュリティルール**:
```javascript
match /maps/{mapId}/groups/{groupId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/maps/$(mapId)).data.ownerId == request.auth.uid;
}
```

---

### 5. Community (コミュニティ)

**パス**: `/maps/{mapId}/communities/{communityId}`

**目的**: グラフ分析アルゴリズム（Louvain法等）によって自動検出されたコミュニティ。

```typescript
interface Community {
  id: string                    // ドキュメントID（コミュニティ番号等）
  mapId: string                 // 親マップID（クエリ用）
  name?: string                 // コミュニティ名（ユーザーが命名可能）
  memberIds: string[]           // 所属メンバーIDリスト
  color: string                 // 表示色（自動生成）
  algorithm: string             // 使用アルゴリズム（例: "louvain"）
  modularity?: number           // モジュラリティ値
  createdAt: Timestamp          // 作成日時（分析実行日時）
  updatedAt: Timestamp          // 更新日時
}
```

**インデックス**:
- `createdAt` (DESC): 最新の分析結果取得用

**配列クエリ**:
- `memberIds` array-contains: 特定メンバーが所属するコミュニティ取得

**セキュリティルール**:
```javascript
match /maps/{mapId}/communities/{communityId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/maps/$(mapId)).data.ownerId == request.auth.uid;
}
```

---

## 🔄 データフロー

### 1. マップ作成フロー

```
1. ユーザーがログイン（Firebase Auth）
2. POST /api/maps → Firestore /maps/{mapId} 作成
3. ownerId にログインユーザーのUID設定
```

### 2. メンバー追加フロー

```
1. ユーザーがメンバーフォームを送信
2. POST /api/maps/{mapId}/members → Firestore /maps/{mapId}/members/{memberId} 作成
3. Socket.io で他クライアントに通知
```

### 3. 関係性追加フロー

```
1. ユーザーが関係性フォームを送信（sourceId, targetId選択）
2. POST /api/maps/{mapId}/relationships → Firestore /maps/{mapId}/relationships/{relationshipId} 作成
3. Socket.io で他クライアントに通知
4. グラフ再描画
```

### 4. コミュニティ検出フロー

```
1. ユーザーが「コミュニティ再分析」ボタンをクリック
2. POST /api/maps/{mapId}/analysis/communities/refresh
3. バックエンド:
   a. /maps/{mapId}/members 全件取得
   b. /maps/{mapId}/relationships 全件取得
   c. graphology でグラフ構築
   d. Louvainアルゴリズム実行
   e. /maps/{mapId}/communities 既存データ削除
   f. /maps/{mapId}/communities 新規作成
   g. /maps/{mapId}/members の communityId フィールド更新
4. Socket.io で他クライアントに通知
5. フロントエンド: グラフの色分け再描画
```

---

## 📊 クエリパターン

### よく使うクエリ

#### 1. 自分のマップ一覧取得

```typescript
const mapsRef = db.collection('maps')
const query = mapsRef
  .where('ownerId', '==', currentUserId)
  .orderBy('createdAt', 'desc')
const snapshot = await query.get()
```

#### 2. 特定マップのメンバー全件取得

```typescript
const membersRef = db.collection('maps').doc(mapId).collection('members')
const snapshot = await membersRef.get()
```

#### 3. 特定メンバーの関係性取得

```typescript
const relationshipsRef = db.collection('maps').doc(mapId).collection('relationships')
const query = relationshipsRef.where('sourceId', '==', memberId)
const snapshot = await query.get()
```

#### 4. 影響力上位メンバー取得

```typescript
const membersRef = db.collection('maps').doc(mapId).collection('members')
const query = membersRef
  .where('centralityScore', '>', 0)
  .orderBy('centralityScore', 'desc')
  .limit(10)
const snapshot = await query.get()
```

#### 5. 特定部署のメンバー取得

```typescript
const membersRef = db.collection('maps').doc(mapId).collection('members')
const query = membersRef.where('department', '==', '営業部')
const snapshot = await query.get()
```

---

## 🔒 セキュリティ考慮事項

### 認証ベースのアクセス制御

- **原則**: すべてのデータアクセスはFirebase Authenticationで認証されたユーザーのみ
- **所有権**: マップの `ownerId` と `request.auth.uid` を照合
- **サブコレクション**: 親マップの所有権を継承

### データバリデーション

```javascript
// バックエンドでの検証例
function validateMember(data) {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Name is required')
  }
  if (data.email && !isValidEmail(data.email)) {
    throw new Error('Invalid email format')
  }
  if (data.centralityScore && (data.centralityScore < 0 || data.centralityScore > 100)) {
    throw new Error('Centrality score must be between 0 and 100')
  }
}
```

---

## 📈 スケーラビリティ

### 想定データ量

| エンティティ | 1マップあたり | 備考 |
|------------|-------------|------|
| Members | 10-100 | 目標: 50人 |
| Relationships | 50-500 | メンバー数の5-10倍 |
| Groups | 5-20 | プロジェクト数程度 |
| Communities | 3-10 | 分析結果 |

### パフォーマンス最適化

1. **インデックス作成**: 上記定義に従ってFirestoreコンソールでインデックス作成
2. **リアルタイムリスナー制限**: 同時接続数を考慮
3. **ページネーション**: 将来的に100人超える場合は実装
4. **キャッシュ活用**: Firebase SDK のデフォルトキャッシュを活用

---

## 🔄 マイグレーション戦略

### InMemoryStorage からの移行

#### Phase 1: Repository層作成（Week 1 Day 3-4）

```typescript
// backend/src/repositories/IMapRepository.ts
export interface IMapRepository {
  create(data: CreateMapInput): Promise<Map>
  findById(id: string): Promise<Map | null>
  findByOwnerId(ownerId: string): Promise<Map[]>
  update(id: string, data: UpdateMapInput): Promise<Map>
  delete(id: string): Promise<void>
}

// backend/src/repositories/FirestoreMapRepository.ts
export class FirestoreMapRepository implements IMapRepository {
  private collection = db.collection('maps')

  async create(data: CreateMapInput): Promise<Map> {
    const docRef = this.collection.doc()
    const map: Map = {
      id: docRef.id,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    await docRef.set(map)
    return map
  }

  // ... 他のメソッド実装
}
```

#### Phase 2: Service層切り替え（Week 1 Day 4）

```typescript
// Before
import { storage } from '../models/InMemoryStorage'

// After
import { mapRepository } from '../repositories/FirestoreMapRepository'

// メソッド呼び出しを変更
const maps = await mapRepository.findByOwnerId(userId)
```

#### Phase 3: InMemoryStorage削除（Week 1 Day 5）

```bash
rm backend/src/models/InMemoryStorage.ts
```

---

## 📝 成果物

### このドキュメント完了後の状態

- [x] Firestoreコレクション構造明確化
- [x] 各エンティティのフィールド定義
- [x] インデックス設計
- [x] セキュリティルール設計
- [x] クエリパターン定義
- [x] マイグレーション戦略策定

### 次のステップ

1. Repository interface定義（`backend/src/repositories/interfaces.ts`）
2. FirestoreRepository実装（各エンティティ）
3. Service層のRepository切り替え

---

**レビュー日**: 2025-12-23
**ステータス**: 承認待ち
