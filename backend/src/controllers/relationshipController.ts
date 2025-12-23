import { Request, Response } from 'express'
import { relationshipService } from '../services/relationshipService.js'
import { CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'

export class RelationshipController {
  async getAll(req: Request, res: Response) {
    try {
      const mapId = req.query.mapId as string | undefined
      const relationships = await relationshipService.getAllRelationships(mapId)
      res.json({ success: true, data: relationships })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch relationships', details: error },
      })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
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

  async getByMemberId(req: Request, res: Response) {
    try {
      const { memberId } = req.params
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
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

  async create(req: Request, res: Response) {
    try {
      const input: CreateRelationshipInput = req.body
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

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const input: UpdateRelationshipInput = req.body
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
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

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
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
