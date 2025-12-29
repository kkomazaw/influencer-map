import React, { memo, useMemo, useCallback } from 'react'
import { Member, Relationship } from '@shared/types'
import { useStore } from '../stores/useStore'

interface FilterPanelProps {
  members: Member[]
  relationships: Relationship[]
}

/**
 * フィルタリング機能を提供するパネルコンポーネント
 */
const FilterPanel: React.FC<FilterPanelProps> = memo(({ members, relationships }) => {
  const {
    filters,
    setSearchText,
    setDepartments,
    setPositions,
    setRelationshipTypes,
    setStrengthRange,
    clearFilters,
  } = useStore()

  // Extract unique departments and positions from members
  const uniqueDepartments = useMemo(() => {
    const departments = members
      .map((m) => m.department)
      .filter((d): d is string => !!d)
    return Array.from(new Set(departments)).sort()
  }, [members])

  const uniquePositions = useMemo(() => {
    const positions = members
      .map((m) => m.position)
      .filter((p): p is string => !!p)
    return Array.from(new Set(positions)).sort()
  }, [members])

  // Extract unique relationship types
  const uniqueRelationshipTypes = useMemo(() => {
    const types = relationships.map((r) => r.type)
    return Array.from(new Set(types)).sort()
  }, [relationships])

  const handleDepartmentToggle = useCallback((department: string) => {
    if (filters.departments.includes(department)) {
      setDepartments(filters.departments.filter((d) => d !== department))
    } else {
      setDepartments([...filters.departments, department])
    }
  }, [filters.departments, setDepartments])

  const handlePositionToggle = useCallback((position: string) => {
    if (filters.positions.includes(position)) {
      setPositions(filters.positions.filter((p) => p !== position))
    } else {
      setPositions([...filters.positions, position])
    }
  }, [filters.positions, setPositions])

  const handleRelationshipTypeToggle = useCallback((type: string) => {
    if (filters.relationshipTypes.includes(type)) {
      setRelationshipTypes(filters.relationshipTypes.filter((t) => t !== type))
    } else {
      setRelationshipTypes([...filters.relationshipTypes, type])
    }
  }, [filters.relationshipTypes, setRelationshipTypes])

  const hasActiveFilters = useMemo(() =>
    filters.searchText !== '' ||
    filters.departments.length > 0 ||
    filters.positions.length > 0 ||
    filters.relationshipTypes.length > 0 ||
    filters.strengthRange[0] !== 1 ||
    filters.strengthRange[1] !== 10,
    [filters]
  )

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>フィルタ</h3>
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            クリア
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="filter-section">
        <label className="filter-label">検索</label>
        <input
          type="text"
          className="filter-search-input"
          placeholder="名前で検索..."
          value={filters.searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Department Filter */}
      {uniqueDepartments.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">部署</label>
          <div className="filter-checkboxes">
            {uniqueDepartments.map((department) => (
              <label key={department} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.departments.includes(department)}
                  onChange={() => handleDepartmentToggle(department)}
                />
                <span>{department}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Position Filter */}
      {uniquePositions.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">役職</label>
          <div className="filter-checkboxes">
            {uniquePositions.map((position) => (
              <label key={position} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.positions.includes(position)}
                  onChange={() => handlePositionToggle(position)}
                />
                <span>{position}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Relationship Type Filter */}
      {uniqueRelationshipTypes.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">関係性タイプ</label>
          <div className="filter-checkboxes">
            {uniqueRelationshipTypes.map((type) => (
              <label key={type} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.relationshipTypes.includes(type)}
                  onChange={() => handleRelationshipTypeToggle(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Strength Range Filter */}
      <div className="filter-section">
        <label className="filter-label">
          関係強度: {filters.strengthRange[0]} - {filters.strengthRange[1]}
        </label>
        <div className="filter-range-inputs">
          <input
            type="range"
            min="1"
            max="10"
            value={filters.strengthRange[0]}
            onChange={(e) =>
              setStrengthRange([parseInt(e.target.value), filters.strengthRange[1]])
            }
          />
          <input
            type="range"
            min="1"
            max="10"
            value={filters.strengthRange[1]}
            onChange={(e) =>
              setStrengthRange([filters.strengthRange[0], parseInt(e.target.value)])
            }
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="filter-active-summary">
          <div className="filter-active-header">アクティブフィルタ</div>
          {filters.searchText && (
            <div className="filter-active-item">検索: "{filters.searchText}"</div>
          )}
          {filters.departments.length > 0 && (
            <div className="filter-active-item">
              部署: {filters.departments.join(', ')}
            </div>
          )}
          {filters.positions.length > 0 && (
            <div className="filter-active-item">
              役職: {filters.positions.join(', ')}
            </div>
          )}
          {filters.relationshipTypes.length > 0 && (
            <div className="filter-active-item">
              関係: {filters.relationshipTypes.join(', ')}
            </div>
          )}
          {(filters.strengthRange[0] !== 1 || filters.strengthRange[1] !== 10) && (
            <div className="filter-active-item">
              強度: {filters.strengthRange[0]}-{filters.strengthRange[1]}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

FilterPanel.displayName = 'FilterPanel'

export default FilterPanel
