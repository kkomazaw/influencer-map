import { Member, CreateMemberInput, UpdateMemberInput } from '@shared/types'
import { storage } from '../models/InMemoryStorage.js'
import { v4 as uuidv4 } from 'uuid'

export class MemberService {
  async getAllMembers(mapId?: string): Promise<Member[]> {
    if (mapId) {
      return storage.getMembersByMapId(mapId)
    }
    return storage.getAllMembers()
  }

  async getMemberById(id: string): Promise<Member | null> {
    const member = storage.getMemberById(id)
    return member || null
  }

  async createMember(input: CreateMemberInput): Promise<Member> {
    const member: Member = {
      id: uuidv4(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return storage.createMember(member)
  }

  async updateMember(id: string, input: UpdateMemberInput): Promise<Member | null> {
    const updated = storage.updateMember(id, input)
    return updated || null
  }

  async deleteMember(id: string): Promise<boolean> {
    // Delete associated relationships
    const relationships = storage.getRelationshipsByMemberId(id)
    relationships.forEach((rel) => storage.deleteRelationship(rel.id))

    return storage.deleteMember(id)
  }
}

export const memberService = new MemberService()
