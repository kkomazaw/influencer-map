import { useMemo } from 'react'
import { Member, Relationship } from '@shared/types'
import { FilterState } from '../stores/useStore'

/**
 * メンバーと関係性をフィルタリングするカスタムフック
 */
export const useFilteredData = (
  members: Member[],
  relationships: Relationship[],
  filters: FilterState
) => {
  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        const matchesName = member.name.toLowerCase().includes(searchLower)
        const matchesDepartment = member.department?.toLowerCase().includes(searchLower)
        const matchesPosition = member.position?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDepartment && !matchesPosition) {
          return false
        }
      }

      // Department filter
      if (filters.departments.length > 0) {
        if (!member.department || !filters.departments.includes(member.department)) {
          return false
        }
      }

      // Position filter
      if (filters.positions.length > 0) {
        if (!member.position || !filters.positions.includes(member.position)) {
          return false
        }
      }

      return true
    })
  }, [members, filters.searchText, filters.departments, filters.positions])

  // Create a Set of filtered member IDs for efficient lookup
  const filteredMemberIds = useMemo(
    () => new Set(filteredMembers.map((m) => m.id)),
    [filteredMembers]
  )

  // Filter relationships
  const filteredRelationships = useMemo(() => {
    console.log('🟡 useFilteredData: Filtering relationships, input count:', relationships.length)
    const filtered = relationships.filter((relationship) => {
      // Only include relationships where both members are in filtered set
      if (
        !filteredMemberIds.has(relationship.sourceId) ||
        !filteredMemberIds.has(relationship.targetId)
      ) {
        return false
      }

      // Relationship type filter
      if (filters.relationshipTypes.length > 0) {
        if (!filters.relationshipTypes.includes(relationship.type)) {
          return false
        }
      }

      // Strength range filter
      if (
        relationship.strength < filters.strengthRange[0] ||
        relationship.strength > filters.strengthRange[1]
      ) {
        return false
      }

      return true
    })

    console.log('🟡 useFilteredData: Filtered relationships count:', filtered.length)
    return filtered
  }, [filteredMemberIds, relationships, filters.relationshipTypes, filters.strengthRange])

  return {
    filteredMembers,
    filteredRelationships,
  }
}
