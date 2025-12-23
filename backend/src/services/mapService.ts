import { Map, CreateMapInput, UpdateMapInput } from '@shared/types'
import { storage } from '../models/InMemoryStorage'
import { randomUUID } from 'crypto'

export const mapService = {
  async getAllMaps(): Promise<Map[]> {
    return storage.getAllMaps()
  },

  async getMapById(id: string): Promise<Map | null> {
    const map = storage.getMapById(id)
    return map || null
  },

  async createMap(input: CreateMapInput): Promise<Map> {
    const map: Map = {
      id: randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return storage.createMap(map)
  },

  async updateMap(id: string, input: UpdateMapInput): Promise<Map | null> {
    const map = storage.updateMap(id, input)
    return map || null
  },

  async deleteMap(id: string): Promise<boolean> {
    return storage.deleteMap(id)
  },
}
