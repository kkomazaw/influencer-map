import { Map, CreateMapInput, UpdateMapInput } from '@shared/types'
import { mapRepository } from '../repositories'

export const mapService = {
  async getAllMaps(): Promise<Map[]> {
    return mapRepository.findAll()
  },

  async getMapById(id: string): Promise<Map | null> {
    return mapRepository.findById(id)
  },

  async getMapsByOwnerId(ownerId: string): Promise<Map[]> {
    return mapRepository.findByOwnerId(ownerId)
  },

  async createMap(input: CreateMapInput): Promise<Map> {
    return mapRepository.create(input)
  },

  async updateMap(id: string, input: UpdateMapInput): Promise<Map | null> {
    try {
      return await mapRepository.update(id, input)
    } catch (error) {
      return null
    }
  },

  async deleteMap(id: string): Promise<boolean> {
    try {
      await mapRepository.delete(id)
      return true
    } catch (error) {
      return false
    }
  },
}
