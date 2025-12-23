import { Group, CreateGroupInput, UpdateGroupInput } from '@shared/types'
import { storage } from '../models/InMemoryStorage.js'
import { v4 as uuidv4 } from 'uuid'

export class GroupService {
  async getAllGroups(mapId?: string): Promise<Group[]> {
    if (mapId) {
      return storage.getGroupsByMapId(mapId)
    }
    return storage.getAllGroups()
  }

  async getGroupById(id: string): Promise<Group | null> {
    const group = storage.getGroupById(id)
    return group || null
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    // Validate that all member IDs exist
    if (input.memberIds && input.memberIds.length > 0) {
      for (const memberId of input.memberIds) {
        const member = storage.getMemberById(memberId)
        if (!member) {
          throw new Error(`Member with ID ${memberId} not found`)
        }
      }
    }

    const group: Group = {
      id: uuidv4(),
      mapId: input.mapId,
      name: input.name,
      description: input.description,
      memberIds: input.memberIds || [],
      color: input.color || '#4CAF50',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return storage.createGroup(group)
  }

  async updateGroup(id: string, input: UpdateGroupInput): Promise<Group | null> {
    // Validate that all member IDs exist if memberIds is being updated
    if (input.memberIds && input.memberIds.length > 0) {
      for (const memberId of input.memberIds) {
        const member = storage.getMemberById(memberId)
        if (!member) {
          throw new Error(`Member with ID ${memberId} not found`)
        }
      }
    }

    const updated = storage.updateGroup(id, input)
    return updated || null
  }

  async deleteGroup(id: string): Promise<boolean> {
    return storage.deleteGroup(id)
  }
}

export const groupService = new GroupService()
