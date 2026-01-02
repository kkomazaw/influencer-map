import { create } from 'zustand'
import { Member, Relationship, Group } from '@shared/types'

export interface FilterState {
  // Member filters
  searchText: string
  departments: string[]
  positions: string[]

  // Relationship filters
  relationshipTypes: string[]
  strengthRange: [number, number]
}

interface AppState {
  members: Member[]
  relationships: Relationship[]
  groups: Group[]
  selectedMemberId: string | null
  filters: FilterState

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

  // Filter actions
  setSearchText: (text: string) => void
  setDepartments: (departments: string[]) => void
  setPositions: (positions: string[]) => void
  setRelationshipTypes: (types: string[]) => void
  setStrengthRange: (range: [number, number]) => void
  clearFilters: () => void
}

const initialFilterState: FilterState = {
  searchText: '',
  departments: [],
  positions: [],
  relationshipTypes: [],
  strengthRange: [1, 10],
}

export const useStore = create<AppState>((set) => ({
  members: [],
  relationships: [],
  groups: [],
  selectedMemberId: null,
  filters: initialFilterState,

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
    set((state) => {
      console.log('🟣 Store addRelationship called with:', relationship)
      console.log('🟣 Current relationships count:', state.relationships.length)

      // Prevent duplicates: check if relationship with same source, target, and type already exists
      const isDuplicate = state.relationships.some(
        (r) =>
          r.sourceId === relationship.sourceId &&
          r.targetId === relationship.targetId &&
          r.type === relationship.type
      )

      if (isDuplicate) {
        console.log('🟡 Store: Duplicate relationship detected, not adding')
        return state
      }

      console.log('🟢 Store: Adding relationship to store')
      return { relationships: [...state.relationships, relationship] }
    }),
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

  // Filter actions
  setSearchText: (searchText) =>
    set((state) => ({
      filters: { ...state.filters, searchText },
    })),
  setDepartments: (departments) =>
    set((state) => ({
      filters: { ...state.filters, departments },
    })),
  setPositions: (positions) =>
    set((state) => ({
      filters: { ...state.filters, positions },
    })),
  setRelationshipTypes: (relationshipTypes) =>
    set((state) => ({
      filters: { ...state.filters, relationshipTypes },
    })),
  setStrengthRange: (strengthRange) =>
    set((state) => ({
      filters: { ...state.filters, strengthRange },
    })),
  clearFilters: () =>
    set({
      filters: initialFilterState,
    }),
}))
