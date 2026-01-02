import React, { useEffect, useRef, useState, useMemo } from 'react'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import { Member, Relationship, Group, Community, MemberCentralityScore } from '@shared/types'

// Register edgehandles extension
cytoscape.use(edgehandles)

export type ColorMode = 'department' | 'community' | 'default'

interface NetworkGraphProps {
  members: Member[]
  relationships: Relationship[]
  groups?: Group[]
  communities?: Community[]
  centralityScores?: MemberCentralityScore[]
  colorMode?: ColorMode
  selectedMemberId?: string | null
  onNodeClick?: (memberId: string) => void
  onNodeDelete?: (memberId: string) => void
  onRelationshipCreate?: (sourceId: string, targetId: string) => void
  onRelationshipDelete?: (relationshipId: string) => void
  onBackgroundRightClick?: (x: number, y: number) => void
  onGraphReady?: (cy: Core) => void
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void
}

// Cytoscape stylesheet - defined outside component to prevent recreation
const GRAPH_STYLESHEET = [
  {
    selector: 'node[type = "group"]',
    style: {
      shape: 'ellipse',
      'background-color': 'data(color)',
      'background-opacity': 0.08,
      'border-width': 3,
      'border-style': 'dashed',
      'border-color': 'data(color)',
      'border-opacity': 0.5,
      label: 'data(label)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '14px',
      'font-weight': 'bold',
      color: 'data(color)',
      width: 'data(width)',
      height: 'data(height)',
      'z-index': 1,
    },
  },
  {
    selector: 'node[!type]',
    style: {
      'background-color': 'data(nodeColor)',
      label: 'data(label)',
      color: '#fff',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 5,
      'font-size': '12px',
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
      'border-width': 2,
      'border-color': '#fff',
      'border-opacity': 0.5,
      'z-index': 10,
    },
  },
  {
    selector: 'node[avatarUrl]',
    style: {
      'background-image': 'data(avatarUrl)',
      'background-fit': 'cover',
      'background-clip': 'node',
      'border-width': 3,
      'border-color': '#4CAF50',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 'data(edgeWidth)',
      'line-color': 'data(edgeColor)',
      'target-arrow-color': 'data(edgeColor)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'opacity': 0.8,
    },
  },
  {
    selector: 'edge.bidirectional',
    style: {
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'triangle',
      'source-arrow-color': 'data(edgeColor)',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#FF5722',
      'target-arrow-color': '#FF5722',
      'source-arrow-color': '#FF5722',
      'opacity': 1,
      'width': (ele: any) => ele.data('edgeWidth') * 1.5,
      'z-index': 999,
    },
  },
  {
    selector: 'node[!type]:selected',
    style: {
      'background-color': '#FF5722',
      'border-width': 3,
      'border-color': '#FF5722',
    },
  },
  {
    selector: '.selected-for-edge',
    style: {
      'border-width': 4,
      'border-color': '#4CAF50',
      'border-opacity': 1,
    },
  },
  {
    selector: '.eh-handle',
    style: {
      'background-color': '#FF5722',
      width: 50,
      height: 50,
      shape: 'ellipse',
      'overlay-opacity': 0,
      'border-width': 6,
      'border-color': '#fff',
      'border-opacity': 1,
      'z-index': 9999,
      'opacity': 1,
    },
  },
  {
    selector: '.eh-hover',
    style: {
      'border-width': 4,
      'border-color': '#4CAF50',
      'border-opacity': 1,
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
  {
    selector: '.eh-source',
    style: {
      'border-width': 4,
      'border-color': '#4CAF50',
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
  {
    selector: '.eh-target',
    style: {
      'border-width': 4,
      'border-color': '#4CAF50',
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
  {
    selector: '.eh-preview',
    style: {
      'line-color': '#FF5722',
      'target-arrow-color': '#FF5722',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      width: 4,
      'line-style': 'solid',
      'opacity': 0.8,
      'z-index': 9999,
    },
  },
  {
    selector: '.eh-ghost-edge',
    style: {
      'line-color': '#FF5722',
      'target-arrow-color': '#FF5722',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      width: 4,
      'line-style': 'dashed',
      'opacity': 0.6,
      'z-index': 9999,
    },
  },
  // Avatar-specific styles - must be last to override edgehandles classes
  {
    selector: 'node[avatarUrl].eh-hover',
    style: {
      'background-image': 'data(avatarUrl)',
      'background-fit': 'cover',
      'background-clip': 'node',
      'border-width': 5,
      'border-color': '#4CAF50',
      'border-opacity': 1,
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
  {
    selector: 'node[avatarUrl].eh-target',
    style: {
      'background-image': 'data(avatarUrl)',
      'background-fit': 'cover',
      'background-clip': 'node',
      'border-width': 5,
      'border-color': '#4CAF50',
      'border-opacity': 1,
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
  {
    selector: 'node[avatarUrl].eh-source',
    style: {
      'background-image': 'data(avatarUrl)',
      'background-fit': 'cover',
      'background-clip': 'node',
      'border-width': 5,
      'border-color': '#4CAF50',
      'border-opacity': 1,
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
  {
    selector: 'node[avatarUrl].eh-presumptive-target',
    style: {
      'background-image': 'data(avatarUrl)',
      'background-fit': 'cover',
      'background-clip': 'node',
      'border-width': 5,
      'border-color': '#4CAF50',
      'border-opacity': 1,
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
    },
  },
]

// Layout configuration - constant to prevent recreation
const LAYOUT_CONFIG = {
  name: 'cose',
  idealEdgeLength: 100,
  nodeOverlap: 20,
  refresh: 20,
  fit: true,
  padding: 30,
  randomize: false,
  componentSpacing: 100,
  nodeRepulsion: 400000,
  edgeElasticity: 100,
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
  animate: false,
} as const

interface TooltipData {
  visible: boolean
  x: number
  y: number
  content: React.ReactNode
}

interface ContextMenuData {
  visible: boolean
  x: number
  y: number
  memberId: string | null
  memberName: string | null
}

interface BackgroundContextMenuData {
  visible: boolean
  x: number
  y: number
  graphX: number
  graphY: number
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  members,
  relationships,
  groups = [],
  communities = [],
  centralityScores = [],
  colorMode = 'default',
  selectedMemberId,
  onNodeClick,
  onNodeDelete,
  onRelationshipCreate,
  onRelationshipDelete,
  onBackgroundRightClick,
  onGraphReady,
  onNodePositionChange
}) => {
  console.log('🟣 NetworkGraph rendered with props:', {
    selectedMemberId,
    hasOnRelationshipCreate: !!onRelationshipCreate,
    membersCount: members.length,
    relationshipsCount: relationships.length,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const layoutRef = useRef<any>(null)
  const graphReadyCalledRef = useRef<boolean>(false)
  const isDraggingRef = useRef<boolean>(false)
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })
  const [contextMenu, setContextMenu] = useState<ContextMenuData>({
    visible: false,
    x: 0,
    y: 0,
    memberId: null,
    memberName: null,
  })
  const [backgroundContextMenu, setBackgroundContextMenu] = useState<BackgroundContextMenuData>({
    visible: false,
    x: 0,
    y: 0,
    graphX: 0,
    graphY: 0,
  })

  // Helper: Get department color
  const getDepartmentColor = (department: string): string => {
    const colors: { [key: string]: string } = {
      '営業': '#2196F3',
      '開発': '#4CAF50',
      '人事': '#FF9800',
      'マーケティング': '#9C27B0',
      '財務': '#F44336',
      '総務': '#795548',
    }
    return colors[department] || '#607D8B'
  }

  // Helper: Get community color for a member
  const getCommunityColor = (memberId: string): string => {
    const community = communities.find(c => c.memberIds.includes(memberId))
    return community?.color || '#607D8B'
  }

  // Helper: Get node color based on color mode
  const getNodeColor = (member: Member): string => {
    switch (colorMode) {
      case 'department':
        return getDepartmentColor(member.department || '')
      case 'community':
        return getCommunityColor(member.id)
      default:
        return '#4CAF50'
    }
  }

  // Helper: Get node size based on centrality score
  const getNodeSize = (memberId: string): number => {
    const baseSize = 40
    const maxSize = 80
    const minSize = 30

    if (centralityScores.length === 0) {
      return baseSize
    }

    const score = centralityScores.find(s => s.memberId === memberId)
    if (!score) {
      return minSize
    }

    // Use degree centrality for node sizing (most intuitive)
    // Normalize between minSize and maxSize
    const maxDegree = Math.max(...centralityScores.map(s => s.degree), 0.01)
    const normalizedScore = score.degree / maxDegree
    return minSize + (maxSize - minSize) * normalizedScore
  }

  // Helper: Convert English relationship type to Japanese display name
  const getRelationshipDisplayName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'reporting': '報告',
      'collaboration': '協力',
      'mentoring': 'メンター',
      'friendship': '友人',
      'consulting': '相談',
      'project': 'プロジェクト',
      'other': 'その他',
    }
    return typeMap[type] || type
  }

  // Helper: Get edge color based on relationship type
  const getEdgeColor = (type: string): string => {
    const displayName = getRelationshipDisplayName(type)
    const colors: { [key: string]: string } = {
      '報告': '#2196F3',       // Blue - Reporting
      '協力': '#4CAF50',       // Green - Collaboration
      'メンター': '#FF9800',   // Orange - Mentoring
      '友人': '#9C27B0',       // Purple - Friendship
      '相談': '#00BCD4',       // Cyan - Consulting
      'プロジェクト': '#FFC107', // Yellow - Project
      'その他': '#888',         // Gray - Other
    }
    return colors[displayName] || '#888'
  }

  // Helper: Get edge width based on strength
  const getEdgeWidth = (strength: number): number => {
    const minWidth = 1
    const maxWidth = 6
    // Strength is typically 1-10
    return minWidth + ((strength - 1) / 9) * (maxWidth - minWidth)
  }

  // Memoize group nodes
  const groupNodes = useMemo((): ElementDefinition[] => {
    return groups.map((group) => {
      // Calculate bounding box for group members
      const groupMembers = members.filter((m) => group.memberIds.includes(m.id))

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      let hasPositions = false

      groupMembers.forEach((member) => {
        if (member.x !== undefined && member.y !== undefined) {
          hasPositions = true
          minX = Math.min(minX, member.x)
          maxX = Math.max(maxX, member.x)
          minY = Math.min(minY, member.y)
          maxY = Math.max(maxY, member.y)
        }
      })

      // Calculate center and size with padding
      const padding = 80
      const width = hasPositions ? (maxX - minX) + padding * 2 : 300
      const height = hasPositions ? (maxY - minY) + padding * 2 : 200
      const centerX = hasPositions ? (minX + maxX) / 2 : group.x || 0
      const centerY = hasPositions ? (minY + maxY) / 2 : group.y || 0

      const groupData: any = {
        data: {
          id: `group-${group.id}`,
          label: group.name,
          type: 'group',
          color: group.color,
          width: width,
          height: height,
          memberIds: group.memberIds, // Store member IDs for drag handling
        },
        position: { x: centerX, y: centerY },
        grabbable: true, // Allow group nodes to be dragged
      }

      return groupData
    })
  }, [groups, members])

  // Memoize member nodes
  const memberNodes = useMemo(() => {
    console.log('🟢 Building member nodes from members:', members.length)
    const nodes = members.map((member) => {
      console.log('🟢 Member data:', {
        id: member.id,
        name: member.name,
        x: member.x,
        y: member.y,
        hasX: member.x !== undefined,
        hasY: member.y !== undefined,
      })

      const avatarUrl = member.avatarUrl && member.avatarUrl.trim() !== '' ? member.avatarUrl : undefined

      const nodeData: any = {
        data: {
          id: member.id,
          label: member.name,
          department: member.department,
          position: member.position,
          // Removed parent assignment - members are now independent nodes
          // This allows them to appear in overlapping groups
          nodeColor: getNodeColor(member),
          nodeSize: getNodeSize(member.id),
          avatarUrl: avatarUrl,
        },
      }

      // If member has saved position, use it
      if (member.x !== undefined && member.y !== undefined) {
        console.log('🟢 Using saved position for', member.name, ':', { x: member.x, y: member.y })
        nodeData.position = { x: member.x, y: member.y }
      } else {
        console.log('🔴 No saved position for', member.name)
      }

      return nodeData
    }) as ElementDefinition[]

    console.log('🟢 Built member nodes:', nodes.length)
    return nodes
  }, [members, colorMode, centralityScores, communities])

  // Memoize edges
  const edges = useMemo((): ElementDefinition[] => {
    console.log('🟠 NetworkGraph: Building edges from relationships:', relationships.length)
    return relationships.map((rel) => ({
      data: {
        id: rel.id,
        source: rel.sourceId,
        target: rel.targetId,
        strength: rel.strength,
        type: rel.type,
        bidirectional: rel.bidirectional,
        edgeColor: getEdgeColor(rel.type),
        edgeWidth: getEdgeWidth(rel.strength),
      },
      classes: rel.bidirectional ? 'bidirectional' : '',
    }))
  }, [relationships])

  // Memoize all elements
  const elements = useMemo(() => {
    return [...groupNodes, ...memberNodes, ...edges]
  }, [groupNodes, memberNodes, edges])

  // Separate effect for component unmount cleanup
  useEffect(() => {
    return () => {
      // Component is unmounting - destroy the graph
      console.log('🔴 Component unmounting - destroying graph')
      if (cyRef.current) {
        try {
          if (layoutRef.current) {
            layoutRef.current.stop()
            layoutRef.current = null
          }
          cyRef.current.removeAllListeners()
          cyRef.current.destroy()
        } catch (e) {
          // Ignore errors during cleanup
        }
        cyRef.current = null
      }
    }
  }, []) // Empty deps - only runs on mount/unmount

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    console.log('NetworkGraph useEffect triggered, elements count:', elements.length)
    console.log('members count:', members.length)
    console.log('isDraggingRef.current:', isDraggingRef.current)

    // Skip updates while dragging to prevent position overwrite
    if (isDraggingRef.current) {
      console.log('⚠️ Skipping update because isDraggingRef is true')
      return
    }

    // If graph exists, just update elements instead of recreating
    if (cyRef.current) {
      try {
        console.log('✅ Updating existing graph')
        // Get current elements
        const currentElements = cyRef.current.elements()
        console.log('Current cytoscape elements:', currentElements.length)

        // Remove elements that no longer exist
        currentElements.forEach((ele: any) => {
          const stillExists = elements.some((e: any) => e.data.id === ele.id())
          if (!stillExists) {
            console.log('Removing element:', ele.id())
            ele.remove()
          }
        })

        // Add or update elements
        elements.forEach((eleData: any) => {
          const existing = cyRef.current!.$id(eleData.data.id)
          if (existing.length > 0) {
            // Update existing element data
            existing.data(eleData.data)
            // Only update position if it's provided
            if (eleData.position) {
              const currentPos = existing.position()
              // Only update if position has changed significantly (more than 0.1 pixel)
              const posChanged = Math.abs(currentPos.x - eleData.position.x) > 0.1 ||
                                Math.abs(currentPos.y - eleData.position.y) > 0.1
              if (posChanged) {
                console.log(`Updating position for ${eleData.data.id} from (${currentPos.x}, ${currentPos.y}) to (${eleData.position.x}, ${eleData.position.y})`)
                existing.position(eleData.position)
              }
            }
            if (eleData.classes) {
              existing.classes(eleData.classes)
            }
          } else {
            // Add new element
            console.log('Adding new element:', eleData.data.id)
            cyRef.current!.add(eleData)
          }
        })

        console.log('✅ Graph update complete')
        // Don't return - continue to re-setup event handlers
      } catch (e) {
        console.error('Failed to update elements, reinitializing graph:', e)
        // Destroy the broken graph before reinitializing
        try {
          if (layoutRef.current) {
            layoutRef.current.stop()
            layoutRef.current = null
          }
          cyRef.current.removeAllListeners()
          cyRef.current.destroy()
        } catch (destroyError) {
          // Ignore errors during cleanup
        }
        cyRef.current = null
        // Fall through to reinitialization
      }
    }

    // Initialize Cytoscape (only if graph doesn't exist or update failed)
    if (!cyRef.current) {
      console.log('🟡 Initializing new graph')
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: GRAPH_STYLESHEET as any,
      })

      // Check if all member nodes (not groups, not edges) have saved positions
      const allMemberNodesHavePositions = elements.every((ele: any) => {
        // Skip edges (they have source and target)
        if (ele.data && (ele.data.source || ele.data.target)) {
          return true
        }
        // Skip group nodes - their positions are dynamically calculated
        if (ele.data && ele.data.type === 'group') {
          return true
        }
        // For member nodes, check if position is defined
        return ele.position !== undefined
      })

      console.log('All member nodes have positions?', allMemberNodesHavePositions)

      // Only run layout if member nodes don't have saved positions
      if (!allMemberNodesHavePositions) {
        console.log('Running layout because not all member nodes have positions')
        // Run layout only on member nodes (exclude group nodes)
        const layoutConfig = {
          ...LAYOUT_CONFIG,
          // Only apply layout to member nodes, not group nodes
          eles: cyRef.current.$('node[!type]'),
        }
        layoutRef.current = cyRef.current.layout(layoutConfig)

        // Only run layout if still mounted
        if (mounted) {
          layoutRef.current.run()
        }
      } else {
        console.log('Skipping layout because all member nodes have saved positions')
      }

      // Notify parent that graph is ready (only once)
      if (onGraphReady && cyRef.current && !graphReadyCalledRef.current && mounted) {
        graphReadyCalledRef.current = true
        onGraphReady(cyRef.current)
      }
    }

    return () => {
      mounted = false
    }
  }, [elements])

  // Separate useEffect for interactive event handlers
  useEffect(() => {
    if (!cyRef.current) return

    console.log('🔵 Setting up interactive event handlers')

    // Handle node hover tooltip
    const handleNodeMouseOver = (event: any) => {
      const node = event.target
      const nodeId = node.id()
      const member = members.find((m) => m.id === nodeId)
      const centralityScore = centralityScores.find((s) => s.memberId === nodeId)

      if (!member) return

      const position = node.renderedPosition()
      setTooltip({
        visible: true,
        x: position.x,
        y: position.y - 50,
        content: (
          <div className="graph-tooltip">
            <div className="tooltip-header">{member.name}</div>
            {member.department && <div className="tooltip-item">部署: {member.department}</div>}
            {member.position && <div className="tooltip-item">役職: {member.position}</div>}
            {centralityScore && (
              <div className="tooltip-section">
                <div className="tooltip-subtitle">影響力スコア</div>
                <div className="tooltip-item">次数: {centralityScore.degree.toFixed(3)}</div>
                <div className="tooltip-item">媒介: {centralityScore.betweenness.toFixed(3)}</div>
                <div className="tooltip-item">近接: {centralityScore.closeness.toFixed(3)}</div>
              </div>
            )}
          </div>
        ),
      })
    }

    const handleNodeMouseOut = () => {
      setTooltip({ visible: false, x: 0, y: 0, content: null })
    }

    // Handle edge hover tooltip
    const handleEdgeMouseOver = (event: any) => {
      const edge = event.target
      const sourceId = edge.data('source')
      const targetId = edge.data('target')
      const type = edge.data('type')
      const strength = edge.data('strength')
      const bidirectional = edge.data('bidirectional')

      const sourceMember = members.find((m) => m.id === sourceId)
      const targetMember = members.find((m) => m.id === targetId)

      if (!sourceMember || !targetMember) return

      const position = edge.renderedMidpoint()
      setTooltip({
        visible: true,
        x: position.x,
        y: position.y - 40,
        content: (
          <div className="graph-tooltip">
            <div className="tooltip-header">
              {sourceMember.name} {bidirectional ? '↔' : '→'} {targetMember.name}
            </div>
            <div className="tooltip-item">種類: {type}</div>
            <div className="tooltip-item">強度: {strength} / 10</div>
            {bidirectional && <div className="tooltip-item">双方向の関係</div>}
          </div>
        ),
      })
    }

    const handleEdgeMouseOut = () => {
      setTooltip({ visible: false, x: 0, y: 0, content: null })
    }

    // Handle right-click on nodes (context menu)
    const handleNodeContextMenu = (event: any) => {
      const node = event.target
      const nodeId = node.id()
      const member = members.find((m) => m.id === nodeId)

      if (!member) return

      const position = event.renderedPosition
      setContextMenu({
        visible: true,
        x: position.x,
        y: position.y,
        memberId: nodeId,
        memberName: member.name,
      })
      setTooltip({ visible: false, x: 0, y: 0, content: null })
    }

    // Handle right-click on edges (relationship context menu)
    const handleEdgeContextMenu = (event: any) => {
      if (!onRelationshipDelete) return

      const edge = event.target
      const relationshipId = edge.id()
      const sourceId = edge.data('source')
      const targetId = edge.data('target')
      const type = edge.data('type')

      const sourceMember = members.find((m) => m.id === sourceId)
      const targetMember = members.find((m) => m.id === targetId)

      if (!sourceMember || !targetMember) return

      const position = event.renderedPosition

      if (confirm(`「${sourceMember.name}」→「${targetMember.name}」の関係性を削除しますか？`)) {
        onRelationshipDelete(relationshipId)
      }
    }

    // Close context menu on background click
    const handleBackgroundTap = (event: any) => {
      if (event.target === cyRef.current) {
        setContextMenu({ visible: false, x: 0, y: 0, memberId: null, memberName: null })
        setBackgroundContextMenu({ visible: false, x: 0, y: 0, graphX: 0, graphY: 0 })
      }
    }

    // Handle background right-click to show context menu
    const handleBackgroundRightClick = (event: any) => {
      if (event.target === cyRef.current) {
        // Get the position in the graph coordinate system (not screen coordinates)
        const graphPosition = event.position
        const renderedPosition = event.renderedPosition
        console.log('Background right-click at position:', graphPosition)
        setBackgroundContextMenu({
          visible: true,
          x: renderedPosition.x,
          y: renderedPosition.y,
          graphX: graphPosition.x,
          graphY: graphPosition.y,
        })
        setContextMenu({ visible: false, x: 0, y: 0, memberId: null, memberName: null })
      }
    }

    // Register event handlers
    cyRef.current.on('mouseover', 'node[!type]', handleNodeMouseOver)
    cyRef.current.on('mouseout', 'node[!type]', handleNodeMouseOut)
    cyRef.current.on('mouseover', 'edge', handleEdgeMouseOver)
    cyRef.current.on('mouseout', 'edge', handleEdgeMouseOut)
    cyRef.current.on('cxttap', 'node[!type]', handleNodeContextMenu)
    cyRef.current.on('cxttap', 'edge', handleEdgeContextMenu)
    cyRef.current.on('tap', handleBackgroundTap)
    cyRef.current.on('cxttap', handleBackgroundRightClick)

    return () => {
      console.log('🔴 Cleaning up interactive event handlers')
      if (cyRef.current) {
        try {
          cyRef.current.off('mouseover', 'node[!type]', handleNodeMouseOver)
          cyRef.current.off('mouseout', 'node[!type]', handleNodeMouseOut)
          cyRef.current.off('mouseover', 'edge', handleEdgeMouseOver)
          cyRef.current.off('mouseout', 'edge', handleEdgeMouseOut)
          cyRef.current.off('cxttap', 'node[!type]', handleNodeContextMenu)
          cyRef.current.off('cxttap', 'edge', handleEdgeContextMenu)
          cyRef.current.off('tap', handleBackgroundTap)
          cyRef.current.off('cxttap', handleBackgroundRightClick)
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [members, centralityScores, onRelationshipDelete, onBackgroundRightClick])

  // Separate useEffect for selected node styling
  useEffect(() => {
    if (!cyRef.current) return

    console.log('🔵 Updating selected node class', selectedMemberId)

    // Remove selected-for-edge class from all nodes
    cyRef.current.$('node[!type]').removeClass('selected-for-edge')

    // Add selected-for-edge class to the selected node
    if (selectedMemberId) {
      const selectedNode = cyRef.current.$id(selectedMemberId)
      if (selectedNode.length > 0) {
        selectedNode.addClass('selected-for-edge')
      }
    }
  }, [selectedMemberId])

  // Simplified edgehandles for relationship creation
  useEffect(() => {
    if (!cyRef.current || !onRelationshipCreate || !selectedMemberId) {
      return
    }

    console.log('🔵 Setting up edgehandles for selected node:', selectedMemberId)

    const eh = cyRef.current.edgehandles({
      preview: true,
      hoverDelay: 0,
      handleNodes: `#${selectedMemberId}`, // Only show handle on selected node
      handlePosition: (node: any) => {
        console.log('🟢 handlePosition called for node:', node.id())
        return 'right middle'
      },
      handleInDrawMode: true,
      loopAllowed: (node: any) => {
        console.log('🟢 loopAllowed called')
        return false
      },
      canConnect: (sourceNode: any, targetNode: any) => {
        const canConnect = sourceNode.id() !== targetNode.id() && !targetNode.data('type')
        console.log('🟢 canConnect:', sourceNode.id(), '->', targetNode?.id(), '=', canConnect)
        return canConnect
      },
      snap: true,
      snapThreshold: 50,
      edgeParams: (sourceNode: any, targetNode: any) => {
        console.log('🟢 edgeParams called - source:', sourceNode?.id(), 'target:', targetNode?.id())
        return {
          data: {
            source: sourceNode.id(),
            target: targetNode?.id() || '',
            edgeWidth: 4,
            edgeColor: '#FF5722',
          },
        }
      },
    })

    const handleComplete = (event: any, sourceNode: any, targetNode: any, addedEdge: any) => {
      if (addedEdge) addedEdge.remove()
      onRelationshipCreate(sourceNode.id(), targetNode.id())
      // Clean up any preview edges
      cleanupPreviewEdges()
      // Reset dragging flag
      console.log('🟢 Resetting isDraggingRef to false after edge complete')
      isDraggingRef.current = false
    }

    const handleCancel = (event: any, sourceNode: any) => {
      console.log('🔴 Edge creation cancelled')
      // Clean up any preview edges
      cleanupPreviewEdges()
      // Reset dragging flag
      console.log('🟢 Resetting isDraggingRef to false after edge cancel')
      isDraggingRef.current = false
    }

    const handleStop = () => {
      console.log('🔴 Edge drawing stopped')
      // Clean up any preview edges
      cleanupPreviewEdges()
      // Reset dragging flag
      console.log('🟢 Resetting isDraggingRef to false after edge drawing stopped')
      isDraggingRef.current = false
    }

    const cleanupPreviewEdges = () => {
      if (!cyRef.current) return
      // Remove all preview and ghost edges
      cyRef.current.$('.eh-preview').remove()
      cyRef.current.$('.eh-ghost-edge').remove()
      cyRef.current.$('.eh-presumptive-target').removeClass('eh-presumptive-target')
    }

    const handleStart = (event: any, sourceNode: any) => {
      console.log('🟢 Edge drawing started from:', sourceNode.id())
    }

    cyRef.current.on('ehstart', handleStart)
    cyRef.current.on('ehcomplete', handleComplete)
    cyRef.current.on('ehcancel', handleCancel)
    cyRef.current.on('ehstop', handleStop)

    // Enable draw mode to show handles
    eh.enableDrawMode()
    console.log('🔵 Draw mode enabled')

    return () => {
      if (cyRef.current) {
        try {
          cyRef.current.off('ehstart', handleStart)
          cyRef.current.off('ehcomplete', handleComplete)
          cyRef.current.off('ehcancel', handleCancel)
          cyRef.current.off('ehstop', handleStop)
          // Clean up any remaining preview edges
          cleanupPreviewEdges()
          eh.disableDrawMode()
          eh.destroy()
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [onRelationshipCreate, selectedMemberId])

  // Separate useEffect for drag handlers
  useEffect(() => {
    if (!cyRef.current) return

    console.log('🔵 Setting up drag handlers')

    // Track initial positions for group drag (using plain object instead of useRef)
    let groupDragState: {
      groupId: string | null
      initialGroupPos: { x: number; y: number } | null
      initialMemberPositions: Map<string, { x: number; y: number }>
    } = {
      groupId: null,
      initialGroupPos: null,
      initialMemberPositions: new Map(),
    }

    const handleGrab = (event: any) => {
      console.log('🔴 Drag started - setting isDraggingRef to true')
      isDraggingRef.current = true

      const node = event.target
      const nodeId = node.id()

      // Check if this is a group node
      if (node.data('type') === 'group') {
        const memberIds = node.data('memberIds') || []
        const groupPos = node.position()

        // Store initial positions
        groupDragState.groupId = nodeId
        groupDragState.initialGroupPos = { x: groupPos.x, y: groupPos.y }
        groupDragState.initialMemberPositions.clear()

        // Store initial positions of all member nodes
        memberIds.forEach((memberId: string) => {
          const memberNode = cyRef.current!.$id(memberId)
          if (memberNode.length > 0) {
            const memberPos = memberNode.position()
            groupDragState.initialMemberPositions.set(memberId, {
              x: memberPos.x,
              y: memberPos.y
            })
          }
        })

        console.log('🟡 Group drag started:', nodeId, 'with', memberIds.length, 'members')
      }
    }

    const handleDrag = (event: any) => {
      const node = event.target
      const nodeId = node.id()

      // If dragging a group, move all member nodes
      if (node.data('type') === 'group' && groupDragState.groupId === nodeId) {
        const currentGroupPos = node.position()
        const initialGroupPos = groupDragState.initialGroupPos

        if (initialGroupPos) {
          // Calculate delta
          const deltaX = currentGroupPos.x - initialGroupPos.x
          const deltaY = currentGroupPos.y - initialGroupPos.y

          // Move all member nodes by the same delta
          groupDragState.initialMemberPositions.forEach((initialPos, memberId) => {
            const memberNode = cyRef.current!.$id(memberId)
            if (memberNode.length > 0) {
              memberNode.position({
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              })
            }
          })
        }
      }
    }

    const handleDragFree = (event: any) => {
      if (!onNodePositionChange) return

      const node = event.target
      const nodeId = node.id()
      const position = node.position()

      console.log('🟡 dragfree event:', nodeId, 'position:', position)

      // If this is a group node, save positions for group and all members
      if (node.data('type') === 'group') {
        const memberIds = node.data('memberIds') || []

        // Save group position
        onNodePositionChange(nodeId, position.x, position.y)

        // Save all member positions
        memberIds.forEach((memberId: string) => {
          const memberNode = cyRef.current!.$id(memberId)
          if (memberNode.length > 0) {
            const memberPos = memberNode.position()
            onNodePositionChange(memberId, memberPos.x, memberPos.y)
          }
        })

        // Clear group drag state
        groupDragState.groupId = null
        groupDragState.initialGroupPos = null
        groupDragState.initialMemberPositions.clear()

        console.log('🟡 Group drag complete, saved positions for group and', memberIds.length, 'members')
      } else if (nodeId && position) {
        // Regular node drag
        console.log('🟡 Calling onNodePositionChange with:', { x: position.x, y: position.y })
        onNodePositionChange(nodeId, position.x, position.y)
      }

      setTimeout(() => {
        console.log('🟢 Drag ended - setting isDraggingRef to false')
        isDraggingRef.current = false
      }, 500)
    }

    cyRef.current.on('grab', 'node', handleGrab)
    cyRef.current.on('drag', 'node[type="group"]', handleDrag)
    if (onNodePositionChange) {
      cyRef.current.on('dragfree', 'node', handleDragFree)
    }

    return () => {
      console.log('🔴 Cleaning up drag handlers')
      if (cyRef.current) {
        try {
          cyRef.current.off('grab', 'node', handleGrab)
          cyRef.current.off('drag', 'node[type="group"]', handleDrag)
          if (onNodePositionChange) {
            cyRef.current.off('dragfree', 'node', handleDragFree)
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [onNodePositionChange])

  // Separate useEffect for node click handler
  useEffect(() => {
    if (!cyRef.current) return

    console.log('🔵 Setting up node click handler')

    const handleNodeTap = (event: any) => {
      const nodeId = event.target.id()
      console.log('🟢 NetworkGraph: Node clicked!', nodeId)
      if (onNodeClick) {
        onNodeClick(nodeId)
      }
    }

    if (onNodeClick) {
      cyRef.current.on('tap', 'node[!type]', handleNodeTap)
    }

    return () => {
      console.log('🔴 Cleaning up node click handler')
      if (cyRef.current) {
        try {
          if (onNodeClick) {
            cyRef.current.off('tap', 'node[!type]', handleNodeTap)
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [onNodeClick])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1e1e1e',
        }}
      />
      {tooltip.visible && (
        <div
          className="graph-tooltip-container"
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {tooltip.content}
        </div>
      )}
      {contextMenu.visible && (
        <div
          className="graph-context-menu"
          style={{
            position: 'absolute',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 1001,
            backgroundColor: '#2d2d2d',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '4px 0',
            minWidth: '150px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              color: '#999',
              borderBottom: '1px solid #444',
            }}
          >
            {contextMenu.memberName}
          </div>
          <button
            className="context-menu-item"
            onClick={() => {
              if (onNodeDelete && contextMenu.memberId) {
                onNodeDelete(contextMenu.memberId)
              }
              setContextMenu({ visible: false, x: 0, y: 0, memberId: null, memberName: null })
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: '#ff5252',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3d3d3d'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            🗑️ 削除
          </button>
        </div>
      )}
      {backgroundContextMenu.visible && onBackgroundRightClick && (
        <div
          className="graph-context-menu"
          style={{
            position: 'absolute',
            left: `${backgroundContextMenu.x}px`,
            top: `${backgroundContextMenu.y}px`,
            zIndex: 1001,
            backgroundColor: '#2d2d2d',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '4px 0',
            minWidth: '150px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              if (onBackgroundRightClick) {
                onBackgroundRightClick(backgroundContextMenu.graphX, backgroundContextMenu.graphY)
              }
              setBackgroundContextMenu({ visible: false, x: 0, y: 0, graphX: 0, graphY: 0 })
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: '#4CAF50',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3d3d3d'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ➕ メンバーを追加
          </button>
        </div>
      )}
    </>
  )
}

export default NetworkGraph
