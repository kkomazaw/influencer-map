import { Response } from 'express'
import { relationshipService } from '../services/relationshipService.js'
import { CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'
import { AuthRequest } from '../middleware/auth'
import { mapService } from '../services/mapService'

export class RelationshipController {
  // Helper method to verify map ownership
  private async verifyMapOwnership(
    mapId: string,
    userId: string
  ): Promise<{ authorized: boolean; error?: string }> {
    const map = await mapService.getMapById(mapId)

    if (!map) {
      return { authorized: false, error: 'Map not found' }
    }

    if (map.ownerId !== userId) {
      return { authorized: false, error: 'Forbidden: You do not own this map' }
    }

    return { authorized: true }
  }
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const mapId = req.query.mapId as string | undefined

      // If mapId is provided, verify ownership
      if (mapId) {
        const { authorized, error } = await this.verifyMapOwnership(mapId, userId)
        if (!authorized) {
          return res.status(error === 'Map not found' ? 404 : 403).json({
            success: false,
            error: { message: error },
          })
        }
      }

      const relationships = await relationshipService.getAllRelationships(mapId)
      res.json({ success: true, data: relationships })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch relationships', details: error },
      })
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const { id } = req.params
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
        })
      }

      // Verify map ownership
      const { authorized, error } = await this.verifyMapOwnership(mapId, userId)
      if (!authorized) {
        return res.status(error === 'Map not found' ? 404 : 403).json({
          success: false,
          error: { message: error },
        })
      }

      const relationship = await relationshipService.getRelationshipById(mapId, id)

      if (!relationship) {
        return res.status(404).json({
          success: false,
          error: { message: 'Relationship not found' },
        })
      }

      res.json({ success: true, data: relationship })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch relationship', details: error },
      })
    }
  }

  async getByMemberId(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const { memberId } = req.params
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
        })
      }

      // Verify map ownership
      const { authorized, error } = await this.verifyMapOwnership(mapId, userId)
      if (!authorized) {
        return res.status(error === 'Map not found' ? 404 : 403).json({
          success: false,
          error: { message: error },
        })
      }

      const relationships = await relationshipService.getRelationshipsBySourceId(mapId, memberId)
      res.json({ success: true, data: relationships })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch relationships', details: error },
      })
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const input: CreateRelationshipInput = req.body

      // Verify map ownership
      if (!input.mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId is required in request body' },
        })
      }

      const { authorized, error } = await this.verifyMapOwnership(input.mapId, userId)
      if (!authorized) {
        return res.status(error === 'Map not found' ? 404 : 403).json({
          success: false,
          error: { message: error },
        })
      }

      const relationship = await relationshipService.createRelationship(input)

      // Emit socket event
      req.app.get('io').emit('relationship:created', { data: relationship })

      res.status(201).json({ success: true, data: relationship })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Failed to create relationship', details: error },
      })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const { id } = req.params
      const input: UpdateRelationshipInput = req.body
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
        })
      }

      // Verify map ownership
      const { authorized, error } = await this.verifyMapOwnership(mapId, userId)
      if (!authorized) {
        return res.status(error === 'Map not found' ? 404 : 403).json({
          success: false,
          error: { message: error },
        })
      }

      const relationship = await relationshipService.updateRelationship(mapId, id, input)

      if (!relationship) {
        return res.status(404).json({
          success: false,
          error: { message: 'Relationship not found' },
        })
      }

      // Emit socket event
      req.app.get('io').emit('relationship:updated', { data: relationship })

      res.json({ success: true, data: relationship })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Failed to update relationship', details: error },
      })
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const { id } = req.params
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
        })
      }

      // Verify map ownership
      const { authorized, error } = await this.verifyMapOwnership(mapId, userId)
      if (!authorized) {
        return res.status(error === 'Map not found' ? 404 : 403).json({
          success: false,
          error: { message: error },
        })
      }

      const success = await relationshipService.deleteRelationship(mapId, id)

      if (!success) {
        return res.status(404).json({
          success: false,
          error: { message: 'Relationship not found' },
        })
      }

      // Emit socket event
      req.app.get('io').emit('relationship:deleted', { data: { id } })

      res.json({ success: true })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete relationship', details: error },
      })
    }
  }
}

export const relationshipController = new RelationshipController()
