/**
 * Centrality Algorithms Test
 *
 * 中心性計算アルゴリズムの検証テスト
 */

import { Member, Relationship } from '@shared/types'
import { buildGraph } from '../../utils/graphStructure.js'
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculateClosenessCentrality,
  calculateAllCentralities,
  rankByCentrality,
} from '../centrality.js'

// テストヘルパー関数
function createMember(id: string, name: string): Member {
  return {
    id,
    mapId: 'test-map',
    name,
    email: `${name.toLowerCase()}@example.com`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function createRelationship(
  id: string,
  sourceId: string,
  targetId: string,
  strength: 1 | 2 | 3 | 4 | 5
): Relationship {
  return {
    id,
    mapId: 'test-map',
    sourceId,
    targetId,
    type: 'collaboration',
    strength,
    bidirectional: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Test 1: スターネットワーク
 * 中心に1つのハブがあり、他の全ノードがそのハブに接続
 *
 * Structure:
 *     2   3   4
 *      \ | /
 *       \|/
 *        1  (hub)
 *       /|\
 *      / | \
 *     5  6  7
 */
function test1_StarNetwork() {
  console.log('\n=== Test 1: Star Network (Hub-and-Spoke) ===')

  const members: Member[] = [
    createMember('1', 'Hub'),
    createMember('2', 'Node2'),
    createMember('3', 'Node3'),
    createMember('4', 'Node4'),
    createMember('5', 'Node5'),
    createMember('6', 'Node6'),
    createMember('7', 'Node7'),
  ]

  const relationships: Relationship[] = [
    createRelationship('r1', '1', '2', 5),
    createRelationship('r2', '1', '3', 5),
    createRelationship('r3', '1', '4', 5),
    createRelationship('r4', '1', '5', 5),
    createRelationship('r5', '1', '6', 5),
    createRelationship('r6', '1', '7', 5),
  ]

  const graph = buildGraph(members, relationships)
  const degreeScores = calculateDegreeCentrality(graph)
  const betweennessScores = calculateBetweennessCentrality(graph)
  const closenessScores = calculateClosenessCentrality(graph)

  console.log('Degree Centrality:', degreeScores)
  console.log('Betweenness Centrality:', betweennessScores)
  console.log('Closeness Centrality:', closenessScores)

  // 期待: ハブ(1)が全ての指標で最高スコア
  console.log('✓ Hub (1) has highest degree:', degreeScores['1'] === 1.0)
  console.log('✓ Hub (1) has highest betweenness:', betweennessScores['1'] > 0.9)
  console.log('✓ Hub (1) has highest closeness:', closenessScores['1'] > 0.9)
}

/**
 * Test 2: パスネットワーク（一直線）
 * 1 - 2 - 3 - 4 - 5
 *
 * 期待:
 * - Degree: 全て同じ（両端は0.5、中間は1.0）
 * - Betweenness: 中央のノード(3)が最高
 * - Closeness: 中央のノード(3)が最高
 */
function test2_PathNetwork() {
  console.log('\n=== Test 2: Path Network (Linear Chain) ===')

  const members: Member[] = [
    createMember('1', 'Node1'),
    createMember('2', 'Node2'),
    createMember('3', 'Node3'),
    createMember('4', 'Node4'),
    createMember('5', 'Node5'),
  ]

  const relationships: Relationship[] = [
    createRelationship('r1', '1', '2', 5),
    createRelationship('r2', '2', '3', 5),
    createRelationship('r3', '3', '4', 5),
    createRelationship('r4', '4', '5', 5),
  ]

  const graph = buildGraph(members, relationships)
  const degreeScores = calculateDegreeCentrality(graph)
  const betweennessScores = calculateBetweennessCentrality(graph)
  const closenessScores = calculateClosenessCentrality(graph)

  console.log('Degree Centrality:', degreeScores)
  console.log('Betweenness Centrality:', betweennessScores)
  console.log('Closeness Centrality:', closenessScores)

  // 期待: 中央のノード(3)が媒介中心性と近接中心性で最高
  console.log('✓ Center (3) has highest betweenness:', betweennessScores['3'] > betweennessScores['2'])
  console.log('✓ Center (3) has highest closeness:', closenessScores['3'] > closenessScores['1'])
}

/**
 * Test 3: ブリッジネットワーク
 * 2つのクラスターがブリッジノードで繋がっている
 *
 * Structure:
 *   1 - 2 - 3
 *       |
 *       4 (bridge)
 *       |
 *   5 - 6 - 7
 *
 * 期待: ブリッジノード(4)が媒介中心性で最高スコア
 */
function test3_BridgeNetwork() {
  console.log('\n=== Test 3: Bridge Network ===')

  const members: Member[] = [
    createMember('1', 'Node1'),
    createMember('2', 'Node2'),
    createMember('3', 'Node3'),
    createMember('4', 'Bridge'),
    createMember('5', 'Node5'),
    createMember('6', 'Node6'),
    createMember('7', 'Node7'),
  ]

  const relationships: Relationship[] = [
    // Cluster 1
    createRelationship('r1', '1', '2', 5),
    createRelationship('r2', '2', '3', 5),
    // Bridge
    createRelationship('r3', '2', '4', 5),
    // Cluster 2
    createRelationship('r4', '4', '6', 5),
    createRelationship('r5', '5', '6', 5),
    createRelationship('r6', '6', '7', 5),
  ]

  const graph = buildGraph(members, relationships)
  const betweennessScores = calculateBetweennessCentrality(graph)

  console.log('Betweenness Centrality:', betweennessScores)

  // 期待: ブリッジノード(2と4)が高い媒介中心性を持つ
  console.log('✓ Bridge nodes (2, 4) have high betweenness:',
    betweennessScores['2'] > 0.2 && betweennessScores['4'] > 0.2)
}

/**
 * Test 4: 完全グラフ
 * 全てのノードが相互に接続
 *
 * 期待: 全てのノードが同じスコア
 */
function test4_CompleteGraph() {
  console.log('\n=== Test 4: Complete Graph (K4) ===')

  const members: Member[] = [
    createMember('1', 'Node1'),
    createMember('2', 'Node2'),
    createMember('3', 'Node3'),
    createMember('4', 'Node4'),
  ]

  const relationships: Relationship[] = [
    createRelationship('r1', '1', '2', 5),
    createRelationship('r2', '1', '3', 5),
    createRelationship('r3', '1', '4', 5),
    createRelationship('r4', '2', '3', 5),
    createRelationship('r5', '2', '4', 5),
    createRelationship('r6', '3', '4', 5),
  ]

  const graph = buildGraph(members, relationships)
  const allScores = calculateAllCentralities(graph)

  console.log('All Centrality Scores:', allScores)

  // 期待: 全てのノードが同じスコア（完全グラフは対称）
  const degreeValues = Object.values(allScores.degree)
  const allEqual = degreeValues.every(v => Math.abs(v - degreeValues[0]) < 0.001)
  console.log('✓ All nodes have equal centrality in complete graph:', allEqual)
}

/**
 * Test 5: ランキング機能のテスト
 */
function test5_RankingFunction() {
  console.log('\n=== Test 5: Ranking Function ===')

  const scores = {
    '1': 0.8,
    '2': 0.5,
    '3': 0.9,
    '4': 0.3,
    '5': 0.7,
  }

  const ranking = rankByCentrality(scores)
  console.log('Full Ranking:', ranking)

  const top3 = rankByCentrality(scores, 3)
  console.log('Top 3:', top3)

  // 期待: 降順にソートされている
  console.log('✓ Ranked in descending order:',
    top3[0].nodeId === '3' && top3[1].nodeId === '1' && top3[2].nodeId === '5')
  console.log('✓ Top 3 has correct ranks:',
    top3[0].rank === 1 && top3[1].rank === 2 && top3[2].rank === 3)
}

/**
 * Test 6: 孤立ノードのテスト
 */
function test6_IsolatedNode() {
  console.log('\n=== Test 6: Isolated Node ===')

  const members: Member[] = [
    createMember('1', 'Node1'),
    createMember('2', 'Node2'),
    createMember('3', 'Isolated'),
  ]

  const relationships: Relationship[] = [
    createRelationship('r1', '1', '2', 5),
  ]

  const graph = buildGraph(members, relationships)
  const allScores = calculateAllCentralities(graph)

  console.log('Isolated Node Scores:', {
    degree: allScores.degree['3'],
    betweenness: allScores.betweenness['3'],
    closeness: allScores.closeness['3'],
  })

  // 期待: 孤立ノードは全てのスコアが0
  console.log('✓ Isolated node has zero scores:',
    allScores.degree['3'] === 0 &&
    allScores.betweenness['3'] === 0 &&
    allScores.closeness['3'] === 0)
}

// テスト実行
console.log('==========================================')
console.log('  Centrality Algorithms Test Suite')
console.log('==========================================')

test1_StarNetwork()
test2_PathNetwork()
test3_BridgeNetwork()
test4_CompleteGraph()
test5_RankingFunction()
test6_IsolatedNode()

console.log('\n==========================================')
console.log('  All Tests Completed')
console.log('==========================================\n')
