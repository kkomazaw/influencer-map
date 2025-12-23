import { Request, Response } from 'express'
import { groupService } from '../services/groupService.js'
import { CreateGroupInput, UpdateGroupInput } from '@shared/types'

export class GroupController {
  async getAll(req: Request, res: Response) {
    try {
      const mapId = req.query.mapId as string | undefined
      const groups = await groupService.getAllGroups(mapId)
      res.json({ success: true, data: groups })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch groups', details: error },
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

      const group = await groupService.getGroupById(mapId, id)

      if (!group) {
        return res.status(404).json({
          success: false,
          error: { message: 'Group not found' },
        })
      }

      res.json({ success: true, data: group })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch group', details: error },
      })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const input: CreateGroupInput = req.body
      const group = await groupService.createGroup(input)

      // Emit socket event
      req.app.get('io').emit('group:created', { data: group })

      res.status(201).json({ success: true, data: group })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Failed to create group', details: error },
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const input: UpdateGroupInput = req.body
      const mapId = req.query.mapId as string

      if (!mapId) {
        return res.status(400).json({
          success: false,
          error: { message: 'mapId query parameter is required' },
        })
      }

      const group = await groupService.updateGroup(mapId, id, input)

      if (!group) {
        return res.status(404).json({
          success: false,
          error: { message: 'Group not found' },
        })
      }

      // Emit socket event
      req.app.get('io').emit('group:updated', { data: group })

      res.json({ success: true, data: group })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { message: 'Failed to update group', details: error },
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

      const success = await groupService.deleteGroup(mapId, id)

      if (!success) {
        return res.status(404).json({
          success: false,
          error: { message: 'Group not found' },
        })
      }

      // Emit socket event
      req.app.get('io').emit('group:deleted', { data: { id } })

      res.json({ success: true })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete group', details: error },
      })
    }
  }
}

export const groupController = new GroupController()
