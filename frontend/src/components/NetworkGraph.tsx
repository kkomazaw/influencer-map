import React, { useEffect, useRef } from 'react'
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
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  members,
  relationships,
  groups = [],
  communities = [],
  centralityScores = [],
  colorMode = 'default',
  onNodeClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

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

  useEffect(() => {
    if (!containerRef.current) return

    // Create group nodes (parent nodes)
    const groupNodes: ElementDefinition[] = groups.map((group) => ({
      data: {
        id: `group-${group.id}`,
        label: group.name,
        type: 'group',
        color: group.color,
      },
    }))

    // Create nodes from members
    const nodes = members.map((member) => {
      // Check if member belongs to any group
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

    // Create edges from relationships
    const edges: ElementDefinition[] = relationships.map((rel) => ({
      data: {
        id: rel.id,
        source: rel.sourceId,
        target: rel.targetId,
        strength: rel.strength,
        type: rel.type,
        bidirectional: rel.bidirectional,
      },
    }))

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...groupNodes, ...nodes, ...edges],
      style: [
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
            width: 'data(strength)',
            'line-color': '#888',
            'target-arrow-color': '#888',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[bidirectional = true]',
          style: {
            'target-arrow-shape': 'triangle',
            'source-arrow-shape': 'triangle',
            'source-arrow-color': '#888',
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
      ],
      layout: {
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
      },
    })

    // Handle node clicks (only for member nodes, not groups)
    if (onNodeClick) {
      cyRef.current.on('tap', 'node[!type]', (event) => {
        const nodeId = event.target.id()
        onNodeClick(nodeId)
      })
    }

    return () => {
      cyRef.current?.destroy()
    }
  }, [members, relationships, groups, communities, centralityScores, colorMode, onNodeClick])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e1e',
      }}
    />
  )
}

export default NetworkGraph
