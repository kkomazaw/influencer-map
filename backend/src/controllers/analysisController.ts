/**
 * Analysis Controller
 *
 * グラフ分析API（コミュニティ検出、中心性分析など）のコントローラー
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import {
  refreshCommunities,
  getAllCommunities,
  getLatestCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  getCommunityStats,
} from '../services/communityService.js'
import { mapService } from '../services/mapService.js'

export class AnalysisController {
  /**
   * マップのコミュニティを再分析
   * POST /api/analysis/communities/refresh?mapId=xxx
   */
  async refreshCommunities(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        })
      }

      const mapId = req.query.mapId as string
      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required' },
        })
      }

      // マップ所有権確認
      const map = await mapService.getMapById(mapId)
      if (!map) {
        return res.status(404).json({
          success: false,
          error: { message: 'Map not found' },
        })
      }

      if (map.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this map' },
        })
      }

      // コミュニティ再分析
      const result = await refreshCommunities(mapId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('Error refreshing communities:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to refresh communities', details: error },
      })
    }
  }

  /**
   * マップのコミュニティ一覧を取得
   * GET /api/analysis/communities?mapId=xxx
   */
  async getCommunities(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        })
      }

      const mapId = req.query.mapId as string
      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required' },
        })
      }

      // マップ所有権確認
      const map = await mapService.getMapById(mapId)
      if (!map) {
        return res.status(404).json({
          success: false,
          error: { message: 'Map not found' },
        })
      }

      if (map.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this map' },
        })
      }

      // コミュニティ一覧取得
      const communities = await getAllCommunities(mapId)

      res.json({
        success: true,
        data: communities,
      })
    } catch (error) {
      console.error('Error getting communities:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get communities', details: error },
      })
    }
  }

  /**
   * 特定のコミュニティを取得
   * GET /api/analysis/communities/:id?mapId=xxx
   */
  async getCommunityById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        })
      }

      const mapId = req.query.mapId as string
      const communityId = req.params.id

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required' },
        })
      }

      // マップ所有権確認
      const map = await mapService.getMapById(mapId)
      if (!map) {
        return res.status(404).json({
          success: false,
          error: { message: 'Map not found' },
        })
      }

      if (map.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this map' },
        })
      }

      // コミュニティ取得
      const community = await getCommunityById(mapId, communityId)

      if (!community) {
        return res.status(404).json({
          success: false,
          error: { message: 'Community not found' },
        })
      }

      res.json({
        success: true,
        data: community,
      })
    } catch (error) {
      console.error('Error getting community:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get community', details: error },
      })
    }
  }

  /**
   * コミュニティ統計情報を取得
   * GET /api/analysis/communities/stats?mapId=xxx
   */
  async getCommunityStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        })
      }

      const mapId = req.query.mapId as string
      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required' },
        })
      }

      // マップ所有権確認
      const map = await mapService.getMapById(mapId)
      if (!map) {
        return res.status(404).json({
          success: false,
          error: { message: 'Map not found' },
        })
      }

      if (map.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this map' },
        })
      }

      // 統計情報取得
      const stats = await getCommunityStats(mapId)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error getting community stats:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get community stats', details: error },
      })
    }
  }

  /**
   * コミュニティを更新（名前変更等）
   * PUT /api/analysis/communities/:id?mapId=xxx
   */
  async updateCommunity(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        })
      }

      const mapId = req.query.mapId as string
      const communityId = req.params.id
      const { name, color } = req.body

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required' },
        })
      }

      // マップ所有権確認
      const map = await mapService.getMapById(mapId)
      if (!map) {
        return res.status(404).json({
          success: false,
          error: { message: 'Map not found' },
        })
      }

      if (map.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this map' },
        })
      }

      // コミュニティ更新
      const updated = await updateCommunity(mapId, communityId, { name, color })

      res.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('Error updating community:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update community', details: error },
      })
    }
  }

  /**
   * コミュニティを削除
   * DELETE /api/analysis/communities/:id?mapId=xxx
   */
  async deleteCommunity(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        })
      }

      const mapId = req.query.mapId as string
      const communityId = req.params.id

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required' },
        })
      }

      // マップ所有権確認
      const map = await mapService.getMapById(mapId)
      if (!map) {
        return res.status(404).json({
          success: false,
          error: { message: 'Map not found' },
        })
      }

      if (map.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this map' },
        })
      }

      // コミュニティ削除
      await deleteCommunity(mapId, communityId)

      res.json({
        success: true,
        message: 'Community deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting community:', error)
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete community', details: error },
      })
    }
  }
}

export const analysisController = new AnalysisController()
