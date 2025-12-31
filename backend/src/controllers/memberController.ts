import { Response } from 'express'
import { memberService } from '../services/memberService.js'
import { CreateMemberInput, UpdateMemberInput } from '@shared/types'
import { AuthRequest } from '../middleware/auth'
import { mapService } from '../services/mapService'

export class MemberController {
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

      const members = await memberService.getAllMembers(mapId)

      // Debug: Log first member to verify x, y are included
      if (members.length > 0) {
        console.log('Sample member data:', JSON.stringify(members[0], null, 2))
      }

      res.json({ success: true, data: members })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch members', details: error },
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

      const member = await memberService.getMemberById(mapId, id)

      if (!member) {
        return res.status(404).json({
          success: false,
          error: { message: 'Member not found' },
        })
      }

      res.json({ success: true, data: member })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch member', details: error },
      })
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.uid
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })
      }

      const input: CreateMemberInput = req.body

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

      const member = await memberService.createMember(input)

      // Emit socket event
      req.app.get('io').emit('member:created', { data: member })

      res.status(201).json({ success: true, data: member })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Failed to create member', details: error },
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
      const input: UpdateMemberInput = req.body
      const mapId = req.query.mapId as string

      console.log('🔷 memberController.update called with:', { id, input, mapId })

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

      console.log('🔷 Calling memberService.updateMember...')
      const member = await memberService.updateMember(mapId, id, input)
      console.log('🔷 memberService.updateMember returned:', member)

      if (!member) {
        return res.status(404).json({
          success: false,
          error: { message: 'Member not found' },
        })
      }

      // Emit socket event
      req.app.get('io').emit('member:updated', { data: member })

      res.json({ success: true, data: member })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Failed to update member', details: error },
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

      const success = await memberService.deleteMember(mapId, id)

      if (!success) {
        return res.status(404).json({
          success: false,
          error: { message: 'Member not found' },
        })
      }

      // Emit socket event
      req.app.get('io').emit('member:deleted', { data: { id } })

      res.json({ success: true })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete member', details: error },
      })
    }
  }
}

export const memberController = new MemberController()
