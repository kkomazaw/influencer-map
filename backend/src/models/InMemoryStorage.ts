import { Member, Relationship, Community, Group, Map as MapType } from '@shared/types'

class InMemoryStorage {
  private maps: Map<string, MapType> = new Map()
  private members: Map<string, Member> = new Map()
  private relationships: Map<string, Relationship> = new Map()
  private communities: Map<string, Community> = new Map()
  private groups: Map<string, Group> = new Map()

  // Members
  getAllMembers(): Member[] {
    return Array.from(this.members.values())
  }

  getMemberById(id: string): Member | undefined {
    return this.members.get(id)
  }

  createMember(member: Member): Member {
    this.members.set(member.id, member)
    return member
  }

  updateMember(id: string, updates: Partial<Member>): Member | undefined {
    const member = this.members.get(id)
    if (!member) return undefined

    const updatedMember = { ...member, ...updates, updatedAt: new Date() }
    this.members.set(id, updatedMember)
    return updatedMember
  }

  deleteMember(id: string): boolean {
    return this.members.delete(id)
  }

  // Relationships
  getAllRelationships(): Relationship[] {
    return Array.from(this.relationships.values())
  }

  getRelationshipById(id: string): Relationship | undefined {
    return this.relationships.get(id)
  }

  getRelationshipsByMemberId(memberId: string): Relationship[] {
    return this.getAllRelationships().filter(
      (rel) => rel.sourceId === memberId || rel.targetId === memberId
    )
  }

  createRelationship(relationship: Relationship): Relationship {
    this.relationships.set(relationship.id, relationship)
    return relationship
  }

  updateRelationship(id: string, updates: Partial<Relationship>): Relationship | undefined {
    const relationship = this.relationships.get(id)
    if (!relationship) return undefined

    const updatedRelationship = { ...relationship, ...updates, updatedAt: new Date() }
    this.relationships.set(id, updatedRelationship)
    return updatedRelationship
  }

  deleteRelationship(id: string): boolean {
    return this.relationships.delete(id)
  }

  // Communities
  getAllCommunities(): Community[] {
    return Array.from(this.communities.values())
  }

  getCommunityById(id: string): Community | undefined {
    return this.communities.get(id)
  }

  createCommunity(community: Community): Community {
    this.communities.set(community.id, community)
    return community
  }

  deleteAllCommunities(): void {
    this.communities.clear()
  }

  // Groups
  getAllGroups(): Group[] {
    return Array.from(this.groups.values())
  }

  getGroupById(id: string): Group | undefined {
    return this.groups.get(id)
  }

  createGroup(group: Group): Group {
    this.groups.set(group.id, group)
    return group
  }

  updateGroup(id: string, updates: Partial<Group>): Group | undefined {
    const group = this.groups.get(id)
    if (!group) return undefined

    const updatedGroup = { ...group, ...updates, updatedAt: new Date() }
    this.groups.set(id, updatedGroup)
    return updatedGroup
  }

  deleteGroup(id: string): boolean {
    return this.groups.delete(id)
  }

  // Maps
  getAllMaps(): MapType[] {
    return Array.from(this.maps.values())
  }

  getMapById(id: string): MapType | undefined {
    return this.maps.get(id)
  }

  createMap(map: MapType): MapType {
    this.maps.set(map.id, map)
    return map
  }

  updateMap(id: string, updates: Partial<MapType>): MapType | undefined {
    const map = this.maps.get(id)
    if (!map) return undefined

    const updatedMap = { ...map, ...updates, updatedAt: new Date() }
    this.maps.set(id, updatedMap)
    return updatedMap
  }

  deleteMap(id: string): boolean {
    // Also delete all associated members, relationships, and groups
    const members = this.getAllMembers().filter(m => m.mapId === id)
    const relationships = this.getAllRelationships().filter(r => r.mapId === id)
    const groups = this.getAllGroups().filter(g => g.mapId === id)

    members.forEach(m => this.deleteMember(m.id))
    relationships.forEach(r => this.deleteRelationship(r.id))
    groups.forEach(g => this.deleteGroup(g.id))

    return this.maps.delete(id)
  }

  // Helper methods to get data by mapId
  getMembersByMapId(mapId: string): Member[] {
    return this.getAllMembers().filter(m => m.mapId === mapId)
  }

  getRelationshipsByMapId(mapId: string): Relationship[] {
    return this.getAllRelationships().filter(r => r.mapId === mapId)
  }

  getGroupsByMapId(mapId: string): Group[] {
    return this.getAllGroups().filter(g => g.mapId === mapId)
  }
}

export const storage = new InMemoryStorage()
