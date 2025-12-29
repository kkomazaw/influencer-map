/**
 * Analysis Routes
 *
 * グラフ分析API（コミュニティ検出、中心性分析など）のルート定義
 */

import { Router } from 'express'
import { analysisController } from '../controllers/analysisController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// すべてのルートで認証が必要
router.use(authenticate)

/**
 * コミュニティ検出エンドポイント
 */

// コミュニティを再分析
router.post('/communities/refresh', (req, res) =>
  analysisController.refreshCommunities(req, res)
)

// コミュニティ統計情報を取得
router.get('/communities/stats', (req, res) =>
  analysisController.getCommunityStats(req, res)
)

// コミュニティ一覧を取得
router.get('/communities', (req, res) => analysisController.getCommunities(req, res))

// 特定のコミュニティを取得
router.get('/communities/:id', (req, res) =>
  analysisController.getCommunityById(req, res)
)

// コミュニティを更新
router.put('/communities/:id', (req, res) =>
  analysisController.updateCommunity(req, res)
)

// コミュニティを削除
router.delete('/communities/:id', (req, res) =>
  analysisController.deleteCommunity(req, res)
)

/**
 * 中心性分析エンドポイント（Phase 2 Week 5で実装予定）
 */

// TODO: Phase 2 Week 5
// router.post('/centrality/calculate', ...)
// router.get('/centrality/top', ...)

export default router
