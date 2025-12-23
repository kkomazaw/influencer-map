import { Request, Response } from 'express'
import { memberService } from '../services/memberService.js'
import { CreateMemberInput, UpdateMemberInput } from '@shared/types'

export class MemberController {
  async getAll(req: Request, res: Response) {
    try {
      const mapId = req.query.mapId as string | undefined
      const members = await memberService.getAllMembers(mapId)
      res.json({ success: true, data: members })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch members', details: error },
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

  async create(req: Request, res: Response) {
    try {
      const input: CreateMemberInput = req.body
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

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const input: UpdateMemberInput = req.body
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
        })
      }

      const member = await memberService.updateMember(mapId, id, input)

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
