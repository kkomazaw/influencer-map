import { Group, CreateGroupInput, UpdateGroupInput } from '@shared/types'
import { groupRepository, memberRepository } from '../repositories'

export class GroupService {
  async getAllGroups(mapId?: string): Promise<Group[]> {
    if (!mapId) {
      throw new Error('mapId is required')
    }
    return groupRepository.findByMapId(mapId)
  }

  async getGroupById(mapId: string, id: string): Promise<Group | null> {
    return groupRepository.findById(mapId, id)
  }

  async getGroupsByMemberId(mapId: string, memberId: string): Promise<Group[]> {
    return groupRepository.findByMemberId(mapId, memberId)
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    // Validate that all member IDs exist
    if (input.memberIds && input.memberIds.length > 0) {
      for (const memberId of input.memberIds) {
        const member = await memberRepository.findById(input.mapId, memberId)
        if (!member) {
          throw new Error(`Member with ID ${memberId} not found`)
        }
      }
    }

    return groupRepository.create(input.mapId, {
      ...input,
      color: input.color || '#4CAF50',
    })
  }

  async updateGroup(mapId: string, id: string, input: UpdateGroupInput): Promise<Group | null> {
    // Validate that all member IDs exist if memberIds is being updated
    if (input.memberIds && input.memberIds.length > 0) {
      for (const memberId of input.memberIds) {
        const member = await memberRepository.findById(mapId, memberId)
        if (!member) {
          throw new Error(`Member with ID ${memberId} not found`)
        }
      }
    }

    try {
      return await groupRepository.update(mapId, id, input)
    } catch (error) {
      return null
    }
  }

  async deleteGroup(mapId: string, id: string): Promise<boolean> {
    try {
      await groupRepository.delete(mapId, id)
      return true
    } catch (error) {
      return false
    }
  }
}

export const groupService = new GroupService()
