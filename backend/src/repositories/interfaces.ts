/**
 * Repository Interfaces
 *
 * データアクセス層の抽象インターフェース定義
 * 実装: FirestoreRepository（本番）、InMemoryRepository（テスト用）
 */

import {
  Map,
  CreateMapInput,
  UpdateMapInput,
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  Relationship,
  CreateRelationshipInput,
  UpdateRelationshipInput,
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  Community,
  CreateCommunityInput,
  UpdateCommunityInput,
} from '@shared/types'

// ========================================
// Map Repository Interface
// ========================================

export interface IMapRepository {
  /**
   * マップを作成
   * @param data マップ作成データ
   * @returns 作成されたマップ
   */
  create(data: CreateMapInput): Promise<Map>

  /**
   * IDでマップを取得
   * @param id マップID
   * @returns マップ（存在しない場合はnull）
   */
  findById(id: string): Promise<Map | null>

  /**
   * 所有者IDでマップ一覧を取得
   * @param ownerId 所有者ID（Firebase Auth UID）
   * @returns マップ配列
   */
  findByOwnerId(ownerId: string): Promise<Map[]>

  /**
   * 全マップを取得（管理用）
   * @returns マップ配列
   */
  findAll(): Promise<Map[]>

  /**
   * マップを更新
   * @param id マップID
   * @param data 更新データ
   * @returns 更新されたマップ
   */
  update(id: string, data: UpdateMapInput): Promise<Map>

  /**
   * マップを削除（カスケード削除: サブコレクションも削除）
   * @param id マップID
   */
  delete(id: string): Promise<void>
}

// ========================================
// Member Repository Interface
// ========================================

export interface IMemberRepository {
  /**
   * メンバーを作成
   * @param mapId 親マップID
   * @param data メンバー作成データ
   * @returns 作成されたメンバー
   */
  create(mapId: string, data: CreateMemberInput): Promise<Member>

  /**
   * IDでメンバーを取得
   * @param mapId 親マップID
   * @param id メンバーID
   * @returns メンバー（存在しない場合はnull）
   */
  findById(mapId: string, id: string): Promise<Member | null>

  /**
   * マップIDでメンバー一覧を取得
   * @param mapId 親マップID
   * @returns メンバー配列
   */
  findByMapId(mapId: string): Promise<Member[]>

  /**
   * 部署でメンバーを絞り込み
   * @param mapId 親マップID
   * @param department 部署名
   * @returns メンバー配列
   */
  findByDepartment(mapId: string, department: string): Promise<Member[]>

  /**
   * メンバー名で検索
   * @param mapId 親マップID
   * @param query 検索クエリ
   * @returns メンバー配列
   */
  searchByName(mapId: string, query: string): Promise<Member[]>

  /**
   * 中心性スコアでソート
   * @param mapId 親マップID
   * @param limit 取得件数
   * @returns メンバー配列（中心性スコア降順）
   */
  findTopByCentrality(mapId: string, limit: number): Promise<Member[]>

  /**
   * メンバーを更新
   * @param mapId 親マップID
   * @param id メンバーID
   * @param data 更新データ
   * @returns 更新されたメンバー
   */
  update(mapId: string, id: string, data: UpdateMemberInput): Promise<Member>

  /**
   * メンバーを削除
   * @param mapId 親マップID
   * @param id メンバーID
   */
  delete(mapId: string, id: string): Promise<void>

  /**
   * 複数メンバーのcommunityIdを一括更新
   * @param mapId 親マップID
   * @param updates { memberId: communityId } のマップ
   */
  batchUpdateCommunityId(mapId: string, updates: Record<string, string>): Promise<void>
}

// ========================================
// Relationship Repository Interface
// ========================================

export interface IRelationshipRepository {
  /**
   * 関係性を作成
   * @param mapId 親マップID
   * @param data 関係性作成データ
   * @returns 作成された関係性
   */
  create(mapId: string, data: CreateRelationshipInput): Promise<Relationship>

  /**
   * IDで関係性を取得
   * @param mapId 親マップID
   * @param id 関係性ID
   * @returns 関係性（存在しない場合はnull）
   */
  findById(mapId: string, id: string): Promise<Relationship | null>

  /**
   * マップIDで関係性一覧を取得
   * @param mapId 親マップID
   * @returns 関係性配列
   */
  findByMapId(mapId: string): Promise<Relationship[]>

  /**
   * 特定メンバーが関係元の関係性を取得
   * @param mapId 親マップID
   * @param sourceId 関係元メンバーID
   * @returns 関係性配列
   */
  findBySourceId(mapId: string, sourceId: string): Promise<Relationship[]>

  /**
   * 特定メンバーが関係先の関係性を取得
   * @param mapId 親マップID
   * @param targetId 関係先メンバーID
   * @returns 関係性配列
   */
  findByTargetId(mapId: string, targetId: string): Promise<Relationship[]>

  /**
   * 関係性種別で絞り込み
   * @param mapId 親マップID
   * @param type 関係性種別
   * @returns 関係性配列
   */
  findByType(mapId: string, type: string): Promise<Relationship[]>

  /**
   * 関係性を更新
   * @param mapId 親マップID
   * @param id 関係性ID
   * @param data 更新データ
   * @returns 更新された関係性
   */
  update(mapId: string, id: string, data: UpdateRelationshipInput): Promise<Relationship>

  /**
   * 関係性を削除
   * @param mapId 親マップID
   * @param id 関係性ID
   */
  delete(mapId: string, id: string): Promise<void>

  /**
   * 特定メンバーに関連する全関係性を削除（メンバー削除時のカスケード）
   * @param mapId 親マップID
   * @param memberId メンバーID
   */
  deleteByMemberId(mapId: string, memberId: string): Promise<void>
}

// ========================================
// Group Repository Interface
// ========================================

export interface IGroupRepository {
  /**
   * グループを作成
   * @param mapId 親マップID
   * @param data グループ作成データ
   * @returns 作成されたグループ
   */
  create(mapId: string, data: CreateGroupInput): Promise<Group>

  /**
   * IDでグループを取得
   * @param mapId 親マップID
   * @param id グループID
   * @returns グループ（存在しない場合はnull）
   */
  findById(mapId: string, id: string): Promise<Group | null>

  /**
   * マップIDでグループ一覧を取得
   * @param mapId 親マップID
   * @returns グループ配列
   */
  findByMapId(mapId: string): Promise<Group[]>

  /**
   * 特定メンバーが所属するグループを取得
   * @param mapId 親マップID
   * @param memberId メンバーID
   * @returns グループ配列
   */
  findByMemberId(mapId: string, memberId: string): Promise<Group[]>

  /**
   * グループを更新
   * @param mapId 親マップID
   * @param id グループID
   * @param data 更新データ
   * @returns 更新されたグループ
   */
  update(mapId: string, id: string, data: UpdateGroupInput): Promise<Group>

  /**
   * グループを削除
   * @param mapId 親マップID
   * @param id グループID
   */
  delete(mapId: string, id: string): Promise<void>
}

// ========================================
// Community Repository Interface
// ========================================

export interface ICommunityRepository {
  /**
   * コミュニティを作成
   * @param mapId 親マップID
   * @param data コミュニティ作成データ
   * @returns 作成されたコミュニティ
   */
  create(mapId: string, data: CreateCommunityInput): Promise<Community>

  /**
   * IDでコミュニティを取得
   * @param mapId 親マップID
   * @param id コミュニティID
   * @returns コミュニティ（存在しない場合はnull）
   */
  findById(mapId: string, id: string): Promise<Community | null>

  /**
   * マップIDでコミュニティ一覧を取得
   * @param mapId 親マップID
   * @returns コミュニティ配列
   */
  findByMapId(mapId: string): Promise<Community[]>

  /**
   * 最新の分析結果を取得
   * @param mapId 親マップID
   * @returns コミュニティ配列（作成日時降順）
   */
  findLatest(mapId: string): Promise<Community[]>

  /**
   * コミュニティを更新（名前変更等）
   * @param mapId 親マップID
   * @param id コミュニティID
   * @param data 更新データ
   * @returns 更新されたコミュニティ
   */
  update(mapId: string, id: string, data: UpdateCommunityInput): Promise<Community>

  /**
   * コミュニティを削除
   * @param mapId 親マップID
   * @param id コミュニティID
   */
  delete(mapId: string, id: string): Promise<void>

  /**
   * マップの全コミュニティを削除（再分析時）
   * @param mapId 親マップID
   */
  deleteAll(mapId: string): Promise<void>

  /**
   * 複数コミュニティを一括作成（再分析時）
   * @param mapId 親マップID
   * @param communities コミュニティデータ配列
   * @returns 作成されたコミュニティ配列
   */
  batchCreate(mapId: string, communities: CreateCommunityInput[]): Promise<Community[]>
}
