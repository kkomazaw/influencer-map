import { create } from 'zustand'
import { Member, Relationship, Group } from '@shared/types'

interface AppState {
  members: Member[]
  relationships: Relationship[]
  groups: Group[]
  selectedMemberId: string | null

  // Actions
  setMembers: (members: Member[]) => void
  addMember: (member: Member) => void
  updateMember: (id: string, member: Member) => void
  removeMember: (id: string) => void

  setRelationships: (relationships: Relationship[]) => void
  addRelationship: (relationship: Relationship) => void
  updateRelationship: (id: string, relationship: Relationship) => void
  removeRelationship: (id: string) => void

  setGroups: (groups: Group[]) => void
  addGroup: (group: Group) => void
  updateGroup: (id: string, group: Group) => void
  removeGroup: (id: string) => void

  setSelectedMemberId: (id: string | null) => void
}

export const useStore = create<AppState>((set) => ({
  members: [],
  relationships: [],
  groups: [],
  selectedMemberId: null,

  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, member) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? member : m)),
    })),
  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      relationships: state.relationships.filter(
        (r) => r.sourceId !== id && r.targetId !== id
      ),
    })),

  setRelationships: (relationships) => set({ relationships }),
  addRelationship: (relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),
  updateRelationship: (id, relationship) =>
    set((state) => ({
      relationships: state.relationships.map((r) => (r.id === id ? relationship : r)),
    })),
  removeRelationship: (id) =>
    set((state) => ({
      relationships: state.relationships.filter((r) => r.id !== id),
    })),

  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (id, group) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? group : g)),
    })),
  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
}))
