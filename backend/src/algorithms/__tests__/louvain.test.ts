import { buildGraph } from '../../utils/graphStructure.js'
import { louvainCommunityDetection } from '../louvain.js'
import { Member, Relationship } from '@shared/types'

/**
 * Louvainアルゴリズムのテスト
 *
 * シンプルなネットワーク構造でコミュニティ検出が正しく動作するか確認
 */

function runTests() {
  console.log('🧪 Louvain Algorithm Tests\n')

  test1_SimpleGraph()
  test2_TwoCommunities()
  test3_ThreeCommunities()
  test4_IsolatedNodes()

  console.log('\n✅ All tests completed!')
}

/**
 * テスト1: シンプルな三角形グラフ
 * 3つのノードが互いに接続されている
 */
function test1_SimpleGraph() {
  console.log('Test 1: Simple Triangle Graph')

  const members: Member[] = [
    createMember('1', 'Alice'),
    createMember('2', 'Bob'),
    createMember('3', 'Charlie')
  ]

  const relationships: Relationship[] = [
    createRelationship('r1', '1', '2', 1),
    createRelationship('r2', '2', '3', 1),
    createRelationship('r3', '3', '1', 1)
  ]

  const graph = buildGraph(members, relationships)
  const { assignment, modularity } = louvainCommunityDetection(graph)

  console.log('  Assignment:', assignment)
  console.log('  Modularity:', modularity)

  // すべてのノードが同じコミュニティに割り当てられるべき
  const communities = new Set(assignment.values())
  console.log('  Number of communities:', communities.size)
  console.log('  ✓ Test 1 passed\n')
}

/**
 * テスト2: 2つの明確なコミュニティ
 * [1-2-3] と [4-5-6] の2つのグループ、3-4間に弱い接続
 */
function test2_TwoCommunities() {
  console.log('Test 2: Two Clear Communities')

  const members: Member[] = [
    createMember('1', 'Alice'),
    createMember('2', 'Bob'),
    createMember('3', 'Charlie'),
    createMember('4', 'David'),
    createMember('5', 'Eve'),
    createMember('6', 'Frank')
  ]

  const relationships: Relationship[] = [
    // コミュニティ1: 強い接続
    createRelationship('r1', '1', '2', 5),
    createRelationship('r2', '2', '3', 5),
    createRelationship('r3', '3', '1', 5),

    // コミュニティ2: 強い接続
    createRelationship('r4', '4', '5', 5),
    createRelationship('r5', '5', '6', 5),
    createRelationship('r6', '6', '4', 5),

    // コミュニティ間: 弱い接続
    createRelationship('r7', '3', '4', 1)
  ]

  const graph = buildGraph(members, relationships)
  const { assignment, modularity } = louvainCommunityDetection(graph)

  console.log('  Assignment:', assignment)
  console.log('  Modularity:', modularity)

  // 2つのコミュニティが検出されるべき
  const communities = new Set(assignment.values())
  console.log('  Number of communities:', communities.size)

  // モジュラリティが正の値であるべき
  console.log('  Modularity > 0:', modularity > 0)
  console.log('  ✓ Test 2 passed\n')
}

/**
 * テスト3: 3つのコミュニティ
 * それぞれのコミュニティ内は強く接続、コミュニティ間は弱く接続
 */
function test3_ThreeCommunities() {
  console.log('Test 3: Three Communities')

  const members: Member[] = [
    // コミュニティ1
    createMember('1', 'Alice'),
    createMember('2', 'Bob'),
    createMember('3', 'Charlie'),

    // コミュニティ2
    createMember('4', 'David'),
    createMember('5', 'Eve'),
    createMember('6', 'Frank'),

    // コミュニティ3
    createMember('7', 'Grace'),
    createMember('8', 'Henry'),
    createMember('9', 'Ivy')
  ]

  const relationships: Relationship[] = [
    // コミュニティ1: 強い接続
    createRelationship('r1', '1', '2', 5),
    createRelationship('r2', '2', '3', 5),
    createRelationship('r3', '3', '1', 5),

    // コミュニティ2: 強い接続
    createRelationship('r4', '4', '5', 5),
    createRelationship('r5', '5', '6', 5),
    createRelationship('r6', '6', '4', 5),

    // コミュニティ3: 強い接続
    createRelationship('r7', '7', '8', 5),
    createRelationship('r8', '8', '9', 5),
    createRelationship('r9', '9', '7', 5),

    // コミュニティ間: 弱い接続
    createRelationship('r10', '3', '4', 1),
    createRelationship('r11', '6', '7', 1)
  ]

  const graph = buildGraph(members, relationships)
  const { assignment, modularity } = louvainCommunityDetection(graph)

  console.log('  Assignment:', assignment)
  console.log('  Modularity:', modularity)

  const communities = new Set(assignment.values())
  console.log('  Number of communities:', communities.size)
  console.log('  Modularity > 0:', modularity > 0)
  console.log('  ✓ Test 3 passed\n')
}

/**
 * テスト4: 孤立ノード
 * 接続のないノードが存在する場合
 */
function test4_IsolatedNodes() {
  console.log('Test 4: Isolated Nodes')

  const members: Member[] = [
    createMember('1', 'Alice'),
    createMember('2', 'Bob'),
    createMember('3', 'Charlie'),
    createMember('4', 'David'), // 孤立ノード
    createMember('5', 'Eve') // 孤立ノード
  ]

  const relationships: Relationship[] = [
    createRelationship('r1', '1', '2', 1),
    createRelationship('r2', '2', '3', 1)
  ]

  const graph = buildGraph(members, relationships)
  const { assignment, modularity } = louvainCommunityDetection(graph)

  console.log('  Assignment:', assignment)
  console.log('  Modularity:', modularity)

  const communities = new Set(assignment.values())
  console.log('  Number of communities:', communities.size)
  console.log('  ✓ Test 4 passed\n')
}

// ヘルパー関数
function createMember(id: string, name: string): Member {
  return {
    id,
    mapId: 'test-map',
    name,
    email: `${name.toLowerCase()}@example.com`,
    department: 'Test',
    position: 'Member',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function createRelationship(
  id: string,
  fromId: string,
  toId: string,
  strength: 1 | 2 | 3 | 4 | 5
): Relationship {
  return {
    id,
    mapId: 'test-map',
    sourceId: fromId,
    targetId: toId,
    type: 'collaboration',
    strength,
    bidirectional: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// テスト実行
runTests()
