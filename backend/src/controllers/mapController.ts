import { Response } from 'express'
import { mapService } from '../services/mapService'
import { CreateMapInput, UpdateMapInput } from '@shared/types'
import { io } from '../index'
import { AuthRequest } from '../middleware/auth'

export const mapController = {
  async getAllMaps(req: AuthRequest, res: Response) {
    try {
      // 認証されたユーザーのマップのみ取得
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const maps = await mapService.getMapsByOwnerId(userId)
      res.json(maps)
    } catch (error) {
      console.error('Error getting maps:', error)
      res.status(500).json({ error: 'Failed to get maps' })
    }
  },

  async getMapById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.uid

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const map = await mapService.getMapById(id)

      if (!map) {
        return res.status(404).json({ error: 'Map not found' })
      }

      // 所有者チェック
      if (map.ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this map' })
      }

      res.json(map)
    } catch (error) {
      console.error('Error getting map:', error)
      res.status(500).json({ error: 'Failed to get map' })
    }
  },

  async createMap(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // ownerIdを認証ユーザーから自動設定
      const input: CreateMapInput = {
        ...req.body,
        ownerId: userId,
      }

      const map = await mapService.createMap(input)

      // Emit real-time event
      io.emit('map:created', map)

      res.status(201).json(map)
    } catch (error) {
      console.error('Error creating map:', error)
      res.status(500).json({ error: 'Failed to create map' })
    }
  },

  async updateMap(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.uid

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // まず既存のマップを取得して所有者チェック
      const existingMap = await mapService.getMapById(id)

      if (!existingMap) {
        return res.status(404).json({ error: 'Map not found' })
      }

      if (existingMap.ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this map' })
      }

      const input: UpdateMapInput = req.body
      const map = await mapService.updateMap(id, input)

      // Emit real-time event
      io.emit('map:updated', map)

      res.json(map)
    } catch (error) {
      console.error('Error updating map:', error)
      res.status(500).json({ error: 'Failed to update map' })
    }
  },

  async deleteMap(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.uid

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // まず既存のマップを取得して所有者チェック
      const existingMap = await mapService.getMapById(id)

      if (!existingMap) {
        return res.status(404).json({ error: 'Map not found' })
      }

      if (existingMap.ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this map' })
      }

      const success = await mapService.deleteMap(id)

      // Emit real-time event
      io.emit('map:deleted', { id })

      res.status(204).send()
    } catch (error) {
      console.error('Error deleting map:', error)
      res.status(500).json({ error: 'Failed to delete map' })
    }
  },
}
