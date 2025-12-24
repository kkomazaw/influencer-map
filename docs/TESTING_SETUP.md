# テストセットアップガイド

**最終更新**: 2025-12-23
**対象**: 開発環境

---

## 📋 概要

このドキュメントでは、Influencer Map APIの動作確認テストを実行するための環境セットアップ方法を説明します。

---

## ✅ 完了した修正

### Firestore undefined値エラーの修正

**問題**: Firestoreがundefined値を含むドキュメントを拒否する

**解決策**: Repositoryレイヤーでundefined値を除外する処理を実装

#### 修正内容

1. **ユーティリティ関数の作成** (`backend/src/repositories/utils.ts`)
   - `removeUndefinedValues()`: オブジェクトからundefined値を除外

2. **Repositoryクラスの更新**:
   - `FirestoreMapRepository.ts`: オプショナルフィールド(description, thumbnail)を条件付きで追加
   - `FirestoreMemberRepository.ts`: undefined値フィルタリング追加
   - `FirestoreRelationshipRepository.ts`: undefined値フィルタリング追加
   - `FirestoreGroupRepository.ts`: undefined値フィルタリング追加

#### 実装例 (FirestoreMapRepository)

```typescript
async create(data: CreateMapInput): Promise<Map> {
  const docRef = db.collection(this.collectionName).doc()
  const now = Timestamp.now()

  // Firestoreに保存するデータを構築（undefined値を除外）
  const firestoreData: any = {
    id: docRef.id,
    name: data.name,
    ownerId: data.ownerId,
    createdAt: now,
    updatedAt: now,
  }

  // オプショナルフィールドは値が存在する場合のみ追加
  if (data.description !== undefined) {
    firestoreData.description = data.description
  }
  if (data.thumbnail !== undefined) {
    firestoreData.thumbnail = data.thumbnail
  }

  await docRef.set(firestoreData)

  return map
}
```

---

## 🔧 テスト実行のための環境セットアップ

動作確認テストを実行するには、以下のいずれかの方法でFirestoreを設定する必要があります。

### 方法1: Firebase Emulator使用（推奨）

開発環境では、Firebase Emulatorを使用することを強く推奨します。

#### ステップ1: Firebase CLIインストール

```bash
npm install -g firebase-tools
```

#### ステップ2: Firebaseログイン

```bash
firebase login
```

#### ステップ3: Emulator初期化

```bash
cd backend
firebase init emulators
```

設定:
- ✅ Firestore Emulator選択
- ポート: 8080 (デフォルト)

#### ステップ4: Emulator起動

```bash
firebase emulators:start
```

別のターミナルで:

```bash
# バックエンドサーバー起動
cd backend
npm run dev

# テスト実行
./test-api.sh
```

#### Emulator UI

ブラウザで `http://localhost:4000` を開くと、Emulator UIでデータを確認できます。

---

### 方法2: 実Firestore使用

本番または実環境でテストする場合。

#### ステップ1: Firebase サービスアカウントキー取得

1. [Firebase Console](https://console.firebase.google.com/)を開く
2. プロジェクトを選択
3. 「プロジェクトの設定」→「サービスアカウント」
4. 「新しい秘密鍵の生成」をクリック
5. JSONファイルをダウンロード

#### ステップ2: 環境変数設定

`backend/.env`:

```bash
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id",...}'
```

**注意**: サービスアカウントキーをGitにコミットしないこと！

#### ステップ3: Firestoreセキュリティルール設定

テスト環境では以下のルールを使用（本番環境では使用しない！）:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ テスト環境のみ
    }
  }
}
```

#### ステップ4: テスト実行

```bash
cd backend
npm run dev

# 別のターミナルで
./test-api.sh
```

---

## 🧪 テストスクリプト

### `test-api.sh`

包括的なCRUD操作テストスクリプト。

**テスト内容**:
1. サーバー起動確認
2. Map CRUD操作
3. Member CRUD操作
4. Relationship CRUD操作
5. Group CRUD操作
6. カスケード削除確認

**実行方法**:

```bash
cd backend
chmod +x test-api.sh
./test-api.sh
```

**期待される出力**:

```
========================================
  Influencer Map API 動作確認テスト
========================================

[1] サーバー起動確認
✓ サーバーは正常に起動しています

[2] Map作成テスト
✓ Map作成成功: ID = xxx-xxx-xxx

[3] Map取得テスト
✓ Map取得成功: テストマップ

...

========================================
  すべてのテストが成功しました！
========================================
```

---

## ❌ 既知の問題と解決済み

### ✅ 解決済み: Firestore undefined値エラー

**エラー**:
```
Cannot use "undefined" as a Firestore value (found in field "thumbnail").
If you want to ignore undefined values, enable `ignoreUndefinedProperties`.
```

**原因**: オプショナルフィールド(description, thumbnail など)がundefinedの状態でFirestoreに書き込まれていた

**解決**: Repositoryレイヤーでundefined値を除外する処理を実装済み

---

### ⚠️ 現在の制限: Firestore接続

**エラー**:
```
Error: 7 PERMISSION_DENIED: Permission denied on resource project influencer-map-dev.
```

**原因**: Firebase EmulatorまたはFirebase認証情報が未設定

**解決策**: 上記の「テスト実行のための環境セットアップ」を参照

---

## 📊 テストカバレッジ

現在の`test-api.sh`でカバーされる機能:

✅ **Map API**
- 作成 (POST /api/maps)
- 取得 (GET /api/maps/:id)
- 削除 (DELETE /api/maps/:id)

✅ **Member API**
- 作成 (POST /api/members)
- 一覧取得 (GET /api/members?mapId=xxx)
- 更新 (PUT /api/members/:id)
- 削除 (DELETE /api/members/:id)

✅ **Relationship API**
- 作成 (POST /api/relationships)
- 一覧取得 (GET /api/relationships?mapId=xxx)
- 削除 (DELETE /api/relationships/:id)

✅ **Group API**
- 作成 (POST /api/groups)
- 一覧取得 (GET /api/groups?mapId=xxx)
- 削除 (DELETE /api/groups/:id)

✅ **カスケード削除**
- Map削除時のサブコレクション自動削除
- Member削除時のRelationship自動削除

---

## 🔍 トラブルシューティング

### テストが "Map作成失敗" で止まる

**原因**: Firestore接続エラー

**解決策**:
1. Firebase Emulatorが起動しているか確認: `firebase emulators:start`
2. または実Firestore認証情報を設定（上記参照）

---

### Emulatorが起動しない

**エラー**: `firebase: command not found`

**解決策**:
```bash
npm install -g firebase-tools
firebase login
```

---

### ポート競合エラー

**エラー**: `EADDRINUSE: address already in use :::4000`

**解決策**:
```bash
# プロセス確認
lsof -ti:4000

# プロセス停止
lsof -ti:4000 | xargs kill -9
```

---

## 📚 関連ドキュメント

- [環境変数設定ガイド](./ENVIRONMENT_SETUP.md)
- [進捗レポート](./PROGRESS_REPORT_20251223.md)
- [Firebase Emulator公式ドキュメント](https://firebase.google.com/docs/emulator-suite)

---

## 🚀 次のステップ

1. **Firebase Emulatorセットアップ** (未完了の場合)
2. **API動作確認テスト実行**: `./test-api.sh`
3. **パフォーマンステスト実施** (Week 1 Day 5 残タスク)
4. **Week 2開始**: 認証機能実装

---

**ドキュメント作成者**: Claude Code
**作成日**: 2025-12-23
