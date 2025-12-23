import { Member, CreateMemberInput, UpdateMemberInput } from '@shared/types'
import { memberRepository, relationshipRepository } from '../repositories'

export class MemberService {
  async getAllMembers(mapId?: string): Promise<Member[]> {
    if (!mapId) {
      throw new Error('mapId is required')
    }
    return memberRepository.findByMapId(mapId)
  }

  async getMemberById(mapId: string, id: string): Promise<Member | null> {
    return memberRepository.findById(mapId, id)
  }

  async getMembersByDepartment(mapId: string, department: string): Promise<Member[]> {
    return memberRepository.findByDepartment(mapId, department)
  }

  async searchMembersByName(mapId: string, query: string): Promise<Member[]> {
    return memberRepository.searchByName(mapId, query)
  }

  async createMember(input: CreateMemberInput): Promise<Member> {
    return memberRepository.create(input.mapId, input)
  }

  async updateMember(mapId: string, id: string, input: UpdateMemberInput): Promise<Member | null> {
    try {
      return await memberRepository.update(mapId, id, input)
    } catch (error) {
      return null
    }
  }

  async deleteMember(mapId: string, id: string): Promise<boolean> {
    try {
      // Delete associated relationships (cascade)
      await relationshipRepository.deleteByMemberId(mapId, id)

      // Delete member
      await memberRepository.delete(mapId, id)
      return true
    } catch (error) {
      return false
    }
  }
}

export const memberService = new MemberService()
