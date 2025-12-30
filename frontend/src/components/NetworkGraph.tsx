import React, { useEffect, useRef, useState, useMemo } from 'react'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
import { Member, Relationship, Group, Community, MemberCentralityScore } from '@shared/types'

export type ColorMode = 'department' | 'community' | 'default'

interface NetworkGraphProps {
  members: Member[]
  relationships: Relationship[]
  groups?: Group[]
  communities?: Community[]
  centralityScores?: MemberCentralityScore[]
  colorMode?: ColorMode
  onNodeClick?: (memberId: string) => void
  onGraphReady?: (cy: Core) => void
}

// Cytoscape stylesheet - defined outside component to prevent recreation
const GRAPH_STYLESHEET = [
  {
    selector: 'node[type = "group"]',
    style: {
      'background-color': 'data(color)',
      'background-opacity': 0.1,
      'border-width': 2,
      'border-style': 'dashed',
      'border-color': 'data(color)',
      label: 'data(label)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '14px',
      'font-weight': 'bold',
      color: 'data(color)',
      'padding': '20px',
    },
  },
  {
    selector: 'node:parent',
    style: {
      'background-opacity': 0.1,
    },
  },
  {
    selector: 'node[!type]',
    style: {
      'background-color': 'data(nodeColor)',
      label: 'data(label)',
      color: '#fff',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '12px',
      width: 'data(nodeSize)',
      height: 'data(nodeSize)',
      'border-width': 2,
      'border-color': '#fff',
      'border-opacity': 0.5,
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

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  members,
  relationships,
  groups = [],
  communities = [],
  centralityScores = [],
  colorMode = 'default',
  onNodeClick,
  onGraphReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const layoutRef = useRef<any>(null)
  const graphReadyCalledRef = useRef<boolean>(false)
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
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
    return groups.map((group) => ({
      data: {
        id: `group-${group.id}`,
        label: group.name,
        type: 'group',
        color: group.color,
      },
    }))
  }, [groups])

  // Memoize member nodes
  const memberNodes = useMemo(() => {
    return members.map((member) => {
      const memberGroup = groups.find((g) => g.memberIds.includes(member.id))
      return {
        data: {
          id: member.id,
          label: member.name,
          department: member.department,
          position: member.position,
          parent: memberGroup ? `group-${memberGroup.id}` : undefined,
          nodeColor: getNodeColor(member),
          nodeSize: getNodeSize(member.id),
        },
      }
    }) as ElementDefinition[]
  }, [members, groups, colorMode, centralityScores, communities])

  // Memoize edges
  const edges = useMemo((): ElementDefinition[] => {
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

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    // Destroy existing graph if it exists
    if (cyRef.current) {
      try {
        // Stop any running layout
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

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: GRAPH_STYLESHEET as any,
    })

    // Run layout and save instance
    layoutRef.current = cyRef.current.layout(LAYOUT_CONFIG)

    // Only run layout if still mounted
    if (mounted) {
      layoutRef.current.run()

      // Notify parent that graph is ready (only once)
      if (onGraphReady && cyRef.current && !graphReadyCalledRef.current) {
        graphReadyCalledRef.current = true
        onGraphReady(cyRef.current)
      }
    }

    // Handle node clicks (only for member nodes, not groups)
    if (onNodeClick && mounted) {
      cyRef.current.on('tap', 'node[!type]', (event) => {
        if (!mounted) return
        const nodeId = event.target.id()
        onNodeClick(nodeId)
      })
    }

    // Handle node hover tooltip
    cyRef.current.on('mouseover', 'node[!type]', (event) => {
      if (!mounted) return
      const node = event.target
      const nodeId = node.id()
      const member = members.find((m) => m.id === nodeId)
      const centralityScore = centralityScores.find((s) => s.memberId === nodeId)

      if (!member) return

      const position = node.renderedPosition()
      setTooltip({
        visible: true,
        x: position.x,
        y: position.y - 50, // Position above the node
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
    })

    cyRef.current.on('mouseout', 'node[!type]', () => {
      if (!mounted) return
      setTooltip({ visible: false, x: 0, y: 0, content: null })
    })

    // Handle edge hover tooltip
    cyRef.current.on('mouseover', 'edge', (event) => {
      if (!mounted) return
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
    })

    cyRef.current.on('mouseout', 'edge', () => {
      if (!mounted) return
      setTooltip({ visible: false, x: 0, y: 0, content: null })
    })

    return () => {
      mounted = false
      if (cyRef.current) {
        try {
          // Stop any running layout
          if (layoutRef.current) {
            layoutRef.current.stop()
            layoutRef.current = null
          }
          // Remove all event listeners
          cyRef.current.removeAllListeners()
          // Destroy the graph
          cyRef.current.destroy()
        } catch (e) {
          // Ignore errors during cleanup
        }
        cyRef.current = null
      }
    }
  }, [elements, onNodeClick])

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
    </>
  )
}

export default NetworkGraph
