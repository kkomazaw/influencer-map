import { Request, Response } from 'express'
import { mapService } from '../services/mapService'
import { CreateMapInput, UpdateMapInput } from '@shared/types'
import { io } from '../index'

export const mapController = {
  async getAllMaps(req: Request, res: Response) {
    try {
      const maps = await mapService.getAllMaps()
      res.json(maps)
    } catch (error) {
      console.error('Error getting maps:', error)
      res.status(500).json({ error: 'Failed to get maps' })
    }
  },

  async getMapById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const map = await mapService.getMapById(id)

      if (!map) {
        return res.status(404).json({ error: 'Map not found' })
      }

      res.json(map)
    } catch (error) {
      console.error('Error getting map:', error)
      res.status(500).json({ error: 'Failed to get map' })
    }
  },

  async createMap(req: Request, res: Response) {
    try {
      const input: CreateMapInput = req.body
      const map = await mapService.createMap(input)

      // Emit real-time event
      io.emit('map:created', map)

      res.status(201).json(map)
    } catch (error) {
      console.error('Error creating map:', error)
      res.status(500).json({ error: 'Failed to create map' })
    }
  },

  async updateMap(req: Request, res: Response) {
    try {
      const { id } = req.params
      const input: UpdateMapInput = req.body
      const map = await mapService.updateMap(id, input)

      if (!map) {
        return res.status(404).json({ error: 'Map not found' })
      }

      // Emit real-time event
      io.emit('map:updated', map)

      res.json(map)
    } catch (error) {
      console.error('Error updating map:', error)
      res.status(500).json({ error: 'Failed to update map' })
    }
  },

  async deleteMap(req: Request, res: Response) {
    try {
      const { id } = req.params
      const success = await mapService.deleteMap(id)

      if (!success) {
        return res.status(404).json({ error: 'Map not found' })
      }

      // Emit real-time event
      io.emit('map:deleted', { id })

      res.status(204).send()
    } catch (error) {
      console.error('Error deleting map:', error)
      res.status(500).json({ error: 'Failed to delete map' })
    }
  },
}
