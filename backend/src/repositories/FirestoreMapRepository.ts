/**
 * Firestore Map Repository Implementation
 *
 * Mapsコレクションに対するCRUD操作を実装
 */

import { db } from '../config/firebase'
import { IMapRepository } from './interfaces'
import { Map, CreateMapInput, UpdateMapInput } from '@shared/types'
import { Timestamp } from 'firebase-admin/firestore'

export class FirestoreMapRepository implements IMapRepository {
  private readonly collectionName = 'maps'

  /**
   * マップを作成
   */
  async create(data: CreateMapInput): Promise<Map> {
    const docRef = db.collection(this.collectionName).doc()
    const now = Timestamp.now()

    const map: Map = {
      id: docRef.id,
      name: data.name,
      description: data.description,
      thumbnail: data.thumbnail,
      ownerId: data.ownerId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    }

    await docRef.set({
      ...map,
      createdAt: now,
      updatedAt: now,
    })

    return map
  }

  /**
   * IDでマップを取得
   */
  async findById(id: string): Promise<Map | null> {
    const docRef = db.collection(this.collectionName).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data()!
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      thumbnail: data.thumbnail,
      ownerId: data.ownerId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  }

  /**
   * 所有者IDでマップ一覧を取得
   */
  async findByOwnerId(ownerId: string): Promise<Map[]> {
    const snapshot = await db
      .collection(this.collectionName)
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        ownerId: data.ownerId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      }
    })
  }

  /**
   * 全マップを取得（管理用）
   */
  async findAll(): Promise<Map[]> {
    const snapshot = await db
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        ownerId: data.ownerId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      }
    })
  }

  /**
   * マップを更新
   */
  async update(id: string, data: UpdateMapInput): Promise<Map> {
    const docRef = db.collection(this.collectionName).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Map with id ${id} not found`)
    }

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    const updatedData = updatedDoc.data()!

    return {
      id: updatedDoc.id,
      name: updatedData.name,
      description: updatedData.description,
      thumbnail: updatedData.thumbnail,
      ownerId: updatedData.ownerId,
      createdAt: updatedData.createdAt.toDate(),
      updatedAt: updatedData.updatedAt.toDate(),
    }
  }

  /**
   * マップを削除（カスケード削除: サブコレクションも削除）
   */
  async delete(id: string): Promise<void> {
    const docRef = db.collection(this.collectionName).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Map with id ${id} not found`)
    }

    // サブコレクション削除
    await this.deleteSubcollection(docRef, 'members')
    await this.deleteSubcollection(docRef, 'relationships')
    await this.deleteSubcollection(docRef, 'groups')
    await this.deleteSubcollection(docRef, 'communities')

    // マップドキュメント削除
    await docRef.delete()
  }

  /**
   * サブコレクションを削除（ヘルパーメソッド）
   */
  private async deleteSubcollection(
    docRef: FirebaseFirestore.DocumentReference,
    subcollectionName: string
  ): Promise<void> {
    const subcollection = docRef.collection(subcollectionName)
    const snapshot = await subcollection.get()

    // バッチ削除（最大500件まで）
    const batchSize = 500
    const batches: FirebaseFirestore.WriteBatch[] = []
    let currentBatch = db.batch()
    let operationCount = 0

    snapshot.docs.forEach((doc) => {
      currentBatch.delete(doc.ref)
      operationCount++

      if (operationCount === batchSize) {
        batches.push(currentBatch)
        currentBatch = db.batch()
        operationCount = 0
      }
    })

    if (operationCount > 0) {
      batches.push(currentBatch)
    }

    // すべてのバッチをコミット
    await Promise.all(batches.map((batch) => batch.commit()))
  }
}

// シングルトンインスタンスをエクスポート
export const mapRepository = new FirestoreMapRepository()
