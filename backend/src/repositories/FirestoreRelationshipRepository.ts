/**
 * Firestore Relationship Repository Implementation
 *
 * /maps/{mapId}/relationships サブコレクションに対するCRUD操作を実装
 */

import { db } from '../config/firebase'
import { IRelationshipRepository } from './interfaces'
import { Relationship, CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'
import { Timestamp } from 'firebase-admin/firestore'
import { removeUndefinedValues } from './utils'

export class FirestoreRelationshipRepository implements IRelationshipRepository {
  /**
   * 関係性サブコレクションの参照を取得
   */
  private getRelationshipsCollection(mapId: string) {
    return db.collection('maps').doc(mapId).collection('relationships')
  }

  /**
   * 関係性を作成
   */
  async create(mapId: string, data: CreateRelationshipInput): Promise<Relationship> {
    const collectionRef = this.getRelationshipsCollection(mapId)
    const docRef = collectionRef.doc()
    const now = Timestamp.now()

    const relationship: Relationship = {
      id: docRef.id,
      mapId,
      sourceId: data.sourceId,
      targetId: data.targetId,
      type: data.type,
      strength: data.strength,
      bidirectional: data.bidirectional ?? false,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    }

    // undefined値を除外してFirestoreに保存
    const firestoreData = removeUndefinedValues({
      ...relationship,
      createdAt: now,
      updatedAt: now,
    })

    await docRef.set(firestoreData)

    return relationship
  }

  /**
   * IDで関係性を取得
   */
  async findById(mapId: string, id: string): Promise<Relationship | null> {
    const docRef = this.getRelationshipsCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return this.mapDocToRelationship(doc)
  }

  /**
   * マップIDで関係性一覧を取得
   */
  async findByMapId(mapId: string): Promise<Relationship[]> {
    const snapshot = await this.getRelationshipsCollection(mapId).get()
    return snapshot.docs.map((doc) => this.mapDocToRelationship(doc))
  }

  /**
   * 特定メンバーが関係元の関係性を取得
   */
  async findBySourceId(mapId: string, sourceId: string): Promise<Relationship[]> {
    const snapshot = await this.getRelationshipsCollection(mapId)
      .where('sourceId', '==', sourceId)
      .get()

    return snapshot.docs.map((doc) => this.mapDocToRelationship(doc))
  }

  /**
   * 特定メンバーが関係先の関係性を取得
   */
  async findByTargetId(mapId: string, targetId: string): Promise<Relationship[]> {
    const snapshot = await this.getRelationshipsCollection(mapId)
      .where('targetId', '==', targetId)
      .get()

    return snapshot.docs.map((doc) => this.mapDocToRelationship(doc))
  }

  /**
   * 関係性種別で絞り込み
   */
  async findByType(mapId: string, type: string): Promise<Relationship[]> {
    const snapshot = await this.getRelationshipsCollection(mapId)
      .where('type', '==', type)
      .get()

    return snapshot.docs.map((doc) => this.mapDocToRelationship(doc))
  }

  /**
   * 関係性を更新
   */
  async update(
    mapId: string,
    id: string,
    data: UpdateRelationshipInput
  ): Promise<Relationship> {
    const docRef = this.getRelationshipsCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Relationship with id ${id} not found in map ${mapId}`)
    }

    // undefined値を除外してFirestoreに保存
    const updateData = removeUndefinedValues({
      ...data,
      updatedAt: Timestamp.now(),
    })

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    return this.mapDocToRelationship(updatedDoc)
  }

  /**
   * 関係性を削除
   */
  async delete(mapId: string, id: string): Promise<void> {
    const docRef = this.getRelationshipsCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Relationship with id ${id} not found in map ${mapId}`)
    }

    await docRef.delete()
  }

  /**
   * 特定メンバーに関連する全関係性を削除（メンバー削除時のカスケード）
   */
  async deleteByMemberId(mapId: string, memberId: string): Promise<void> {
    const collectionRef = this.getRelationshipsCollection(mapId)

    // sourceId が memberId の関係性を取得
    const sourceSnapshot = await collectionRef
      .where('sourceId', '==', memberId)
      .get()

    // targetId が memberId の関係性を取得
    const targetSnapshot = await collectionRef
      .where('targetId', '==', memberId)
      .get()

    // バッチ削除
    const batch = db.batch()

    sourceSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    targetSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
  }

  /**
   * FirestoreドキュメントをRelationshipオブジェクトに変換
   */
  private mapDocToRelationship(doc: FirebaseFirestore.DocumentSnapshot): Relationship {
    const data = doc.data()!
    return {
      id: doc.id,
      mapId: data.mapId,
      sourceId: data.sourceId,
      targetId: data.targetId,
      type: data.type,
      strength: data.strength,
      bidirectional: data.bidirectional,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  }
}

// シングルトンインスタンスをエクスポート
export const relationshipRepository = new FirestoreRelationshipRepository()
