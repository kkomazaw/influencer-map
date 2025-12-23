import { Relationship, CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'
import { relationshipRepository, memberRepository } from '../repositories'

export class RelationshipService {
  async getAllRelationships(mapId?: string): Promise<Relationship[]> {
    if (!mapId) {
      throw new Error('mapId is required')
    }
    return relationshipRepository.findByMapId(mapId)
  }

  async getRelationshipById(mapId: string, id: string): Promise<Relationship | null> {
    return relationshipRepository.findById(mapId, id)
  }

  async getRelationshipsBySourceId(mapId: string, sourceId: string): Promise<Relationship[]> {
    return relationshipRepository.findBySourceId(mapId, sourceId)
  }

  async getRelationshipsByTargetId(mapId: string, targetId: string): Promise<Relationship[]> {
    return relationshipRepository.findByTargetId(mapId, targetId)
  }

  async getRelationshipsByType(mapId: string, type: string): Promise<Relationship[]> {
    return relationshipRepository.findByType(mapId, type)
  }

  async createRelationship(input: CreateRelationshipInput): Promise<Relationship> {
    // Validate that source and target members exist
    const sourceMember = await memberRepository.findById(input.mapId, input.sourceId)
    const targetMember = await memberRepository.findById(input.mapId, input.targetId)

    if (!sourceMember || !targetMember) {
      throw new Error('Source or target member not found')
    }

    if (input.sourceId === input.targetId) {
      throw new Error('Cannot create relationship with self')
    }

    return relationshipRepository.create(input.mapId, input)
  }

  async updateRelationship(
    mapId: string,
    id: string,
    input: UpdateRelationshipInput
  ): Promise<Relationship | null> {
    try {
      return await relationshipRepository.update(mapId, id, input)
    } catch (error) {
      return null
    }
  }

  async deleteRelationship(mapId: string, id: string): Promise<boolean> {
    try {
      await relationshipRepository.delete(mapId, id)
      return true
    } catch (error) {
      return false
    }
  }
}

export const relationshipService = new RelationshipService()
