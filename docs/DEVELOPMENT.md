# 開発ガイド

## 開発環境のセットアップ

### 必要なツール

- Node.js 18.0.0 以上
- npm 9.0.0 以上
- Git
- VSCode（推奨）

### 推奨VSCode拡張機能

プロジェクトルートの `.vscode/extensions.json` に記載されている拡張機能をインストールしてください：

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense（将来的に使用する場合）

## コーディング規約

### TypeScript

- `strict` モードを有効化
- `any` の使用は最小限に（警告レベル）
- 未使用の変数は `_` プレフィックスで無視可能

### 命名規則

- **ファイル名**: PascalCase（コンポーネント）、camelCase（その他）
- **コンポーネント**: PascalCase
- **関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **型/インターフェース**: PascalCase

### インポート順序

```typescript
// 1. 外部ライブラリ
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 内部モジュール（絶対パス）
import { Member } from '@shared/types'

// 3. 相対パス
import { MemberCard } from './MemberCard'
import './styles.css'
```

## Git ワークフロー

### ブランチ戦略

```
main          # 本番環境
  └── develop # 開発環境
       └── feature/xxx  # 機能開発
       └── fix/xxx      # バグ修正
```

### コミットメッセージ

コミットメッセージは以下の形式に従ってください：

```
<type>: <subject>

<body>
```

#### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセス等の変更

#### 例

```
feat: メンバー一覧ページの実装

- メンバー一覧表示コンポーネントを追加
- フィルタ機能を実装
- ページネーション対応
```

## テスト

### フロントエンドテスト

```bash
# ユニットテスト（将来実装）
npm run test -w frontend

# E2Eテスト（将来実装）
npm run test:e2e -w frontend
```

### バックエンドテスト

```bash
# ユニットテスト（将来実装）
npm run test -w backend

# 統合テスト（将来実装）
npm run test:integration -w backend
```

## デバッグ

### フロントエンド

- ブラウザのDevToolsを使用
- React DevTools拡張機能を活用
- `console.log` は開発中のみ使用（本番前に削除）

### バックエンド

- VSCodeのデバッガーを使用
- ログレベルを調整（`morgan` の設定）

#### VSCodeデバッグ設定例

`.vscode/launch.json` を作成：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "npm: dev:backend",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

## よくある問題と解決方法

### 依存関係のインストールエラー

```bash
# node_modulesとpackage-lock.jsonを削除
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf shared/node_modules shared/package-lock.json

# 再インストール
npm install
```

### TypeScriptのパス解決エラー

- `tsconfig.json` の `paths` 設定を確認
- VSCodeを再起動
- TypeScriptサーバーを再起動（Command Palette → "TypeScript: Restart TS Server"）

### ポート競合エラー

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :4000

# プロセスを終了
kill -9 <PID>
```

## パフォーマンス最適化のヒント

### フロントエンド

1. **React.memo** を使用してコンポーネントのメモ化
2. **useMemo/useCallback** でコストの高い計算をキャッシュ
3. **仮想スクロール** で大量データを効率的に表示
4. **遅延ローディング** でバンドルサイズを削減

### バックエンド

1. データベースクエリの最適化
2. レスポンスデータの最小化
3. 適切なインデックスの使用
4. キャッシュの活用

## コードレビューチェックリスト

- [ ] TypeScriptの型エラーがないか
- [ ] ESLintの警告・エラーがないか
- [ ] フォーマットが統一されているか（Prettier）
- [ ] テストが通るか
- [ ] コミットメッセージが適切か
- [ ] 不要なコメントやconsole.logが残っていないか
- [ ] パフォーマンスへの影響を考慮したか
- [ ] セキュリティリスクがないか

## リリースプロセス

1. developブランチで開発
2. プルリクエストを作成
3. コードレビュー
4. テスト実行
5. mainブランチへマージ
6. タグ付け（バージョニング）
7. デプロイ

## 参考リンク

- [React公式ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Express公式ドキュメント](https://expressjs.com/)
- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Socket.io公式ドキュメント](https://socket.io/docs/)
