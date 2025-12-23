/**
 * Firestore Community Repository Implementation
 *
 * /maps/{mapId}/communities サブコレクションに対するCRUD操作を実装
 * コミュニティ検出結果の永続化に使用
 */

import { db } from '../config/firebase'
import { ICommunityRepository } from './interfaces'
import { Community, CreateCommunityInput, UpdateCommunityInput } from '@shared/types'
import { Timestamp } from 'firebase-admin/firestore'

export class FirestoreCommunityRepository implements ICommunityRepository {
  /**
   * コミュニティサブコレクションの参照を取得
   */
  private getCommunitiesCollection(mapId: string) {
    return db.collection('maps').doc(mapId).collection('communities')
  }

  /**
   * コミュニティを作成
   */
  async create(mapId: string, data: CreateCommunityInput): Promise<Community> {
    const collectionRef = this.getCommunitiesCollection(mapId)
    const docRef = collectionRef.doc()
    const now = Timestamp.now()

    const community: Community = {
      id: docRef.id,
      mapId,
      name: data.name,
      memberIds: data.memberIds,
      color: data.color,
      algorithm: data.algorithm,
      modularity: data.modularity,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    }

    await docRef.set({
      ...community,
      createdAt: now,
      updatedAt: now,
    })

    return community
  }

  /**
   * IDでコミュニティを取得
   */
  async findById(mapId: string, id: string): Promise<Community | null> {
    const docRef = this.getCommunitiesCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return this.mapDocToCommunity(doc)
  }

  /**
   * マップIDでコミュニティ一覧を取得
   */
  async findByMapId(mapId: string): Promise<Community[]> {
    const snapshot = await this.getCommunitiesCollection(mapId).get()
    return snapshot.docs.map((doc) => this.mapDocToCommunity(doc))
  }

  /**
   * 最新の分析結果を取得
   */
  async findLatest(mapId: string): Promise<Community[]> {
    const snapshot = await this.getCommunitiesCollection(mapId)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map((doc) => this.mapDocToCommunity(doc))
  }

  /**
   * コミュニティを更新（名前変更等）
   */
  async update(mapId: string, id: string, data: UpdateCommunityInput): Promise<Community> {
    const docRef = this.getCommunitiesCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Community with id ${id} not found in map ${mapId}`)
    }

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    return this.mapDocToCommunity(updatedDoc)
  }

  /**
   * コミュニティを削除
   */
  async delete(mapId: string, id: string): Promise<void> {
    const docRef = this.getCommunitiesCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Community with id ${id} not found in map ${mapId}`)
    }

    await docRef.delete()
  }

  /**
   * マップの全コミュニティを削除（再分析時）
   */
  async deleteAll(mapId: string): Promise<void> {
    const snapshot = await this.getCommunitiesCollection(mapId).get()

    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
  }

  /**
   * 複数コミュニティを一括作成（再分析時）
   */
  async batchCreate(
    mapId: string,
    communities: CreateCommunityInput[]
  ): Promise<Community[]> {
    const batch = db.batch()
    const collectionRef = this.getCommunitiesCollection(mapId)
    const now = Timestamp.now()

    const createdCommunities: Community[] = []

    communities.forEach((data) => {
      const docRef = collectionRef.doc()
      const community: Community = {
        id: docRef.id,
        mapId,
        name: data.name,
        memberIds: data.memberIds,
        color: data.color,
        algorithm: data.algorithm,
        modularity: data.modularity,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      }

      batch.set(docRef, {
        ...community,
        createdAt: now,
        updatedAt: now,
      })

      createdCommunities.push(community)
    })

    await batch.commit()

    return createdCommunities
  }

  /**
   * FirestoreドキュメントをCommunityオブジェクトに変換
   */
  private mapDocToCommunity(doc: FirebaseFirestore.DocumentSnapshot): Community {
    const data = doc.data()!
    return {
      id: doc.id,
      mapId: data.mapId,
      name: data.name,
      memberIds: data.memberIds ?? [],
      color: data.color,
      algorithm: data.algorithm,
      modularity: data.modularity,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  }
}

// シングルトンインスタンスをエクスポート
export const communityRepository = new FirestoreCommunityRepository()
