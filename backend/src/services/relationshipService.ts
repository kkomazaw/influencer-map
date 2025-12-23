import { Relationship, CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'
import { storage } from '../models/InMemoryStorage.js'
import { v4 as uuidv4 } from 'uuid'

export class RelationshipService {
  async getAllRelationships(mapId?: string): Promise<Relationship[]> {
    if (mapId) {
      return storage.getRelationshipsByMapId(mapId)
    }
    return storage.getAllRelationships()
  }

  async getRelationshipById(id: string): Promise<Relationship | null> {
    const relationship = storage.getRelationshipById(id)
    return relationship || null
  }

  async getRelationshipsByMemberId(memberId: string): Promise<Relationship[]> {
    return storage.getRelationshipsByMemberId(memberId)
  }

  async createRelationship(input: CreateRelationshipInput): Promise<Relationship> {
    // Validate that source and target members exist
    const sourceMember = storage.getMemberById(input.sourceId)
    const targetMember = storage.getMemberById(input.targetId)

    if (!sourceMember || !targetMember) {
      throw new Error('Source or target member not found')
    }

    if (input.sourceId === input.targetId) {
      throw new Error('Cannot create relationship with self')
    }

    const relationship: Relationship = {
      id: uuidv4(),
      ...input,
      bidirectional: input.bidirectional ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return storage.createRelationship(relationship)
  }

  async updateRelationship(
    id: string,
    input: UpdateRelationshipInput
  ): Promise<Relationship | null> {
    const updated = storage.updateRelationship(id, input)
    return updated || null
  }

  async deleteRelationship(id: string): Promise<boolean> {
    return storage.deleteRelationship(id)
  }
}

export const relationshipService = new RelationshipService()
