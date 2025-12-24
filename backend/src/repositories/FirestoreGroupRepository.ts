/**
 * Firestore Group Repository Implementation
 *
 * /maps/{mapId}/groups サブコレクションに対するCRUD操作を実装
 */

import { db } from '../config/firebase'
import { IGroupRepository } from './interfaces'
import { Group, CreateGroupInput, UpdateGroupInput } from '@shared/types'
import { Timestamp } from 'firebase-admin/firestore'
import { removeUndefinedValues } from './utils'

export class FirestoreGroupRepository implements IGroupRepository {
  /**
   * グループサブコレクションの参照を取得
   */
  private getGroupsCollection(mapId: string) {
    return db.collection('maps').doc(mapId).collection('groups')
  }

  /**
   * グループを作成
   */
  async create(mapId: string, data: CreateGroupInput): Promise<Group> {
    const collectionRef = this.getGroupsCollection(mapId)
    const docRef = collectionRef.doc()
    const now = Timestamp.now()

    const group: Group = {
      id: docRef.id,
      mapId,
      name: data.name,
      description: data.description,
      memberIds: data.memberIds ?? [],
      color: data.color,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    }

    // undefined値を除外してFirestoreに保存
    const firestoreData = removeUndefinedValues({
      ...group,
      createdAt: now,
      updatedAt: now,
    })

    await docRef.set(firestoreData)

    return group
  }

  /**
   * IDでグループを取得
   */
  async findById(mapId: string, id: string): Promise<Group | null> {
    const docRef = this.getGroupsCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return this.mapDocToGroup(doc)
  }

  /**
   * マップIDでグループ一覧を取得
   */
  async findByMapId(mapId: string): Promise<Group[]> {
    const snapshot = await this.getGroupsCollection(mapId).get()
    return snapshot.docs.map((doc) => this.mapDocToGroup(doc))
  }

  /**
   * 特定メンバーが所属するグループを取得
   */
  async findByMemberId(mapId: string, memberId: string): Promise<Group[]> {
    const snapshot = await this.getGroupsCollection(mapId)
      .where('memberIds', 'array-contains', memberId)
      .get()

    return snapshot.docs.map((doc) => this.mapDocToGroup(doc))
  }

  /**
   * グループを更新
   */
  async update(mapId: string, id: string, data: UpdateGroupInput): Promise<Group> {
    const docRef = this.getGroupsCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Group with id ${id} not found in map ${mapId}`)
    }

    // undefined値を除外してFirestoreに保存
    const updateData = removeUndefinedValues({
      ...data,
      updatedAt: Timestamp.now(),
    })

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    return this.mapDocToGroup(updatedDoc)
  }

  /**
   * グループを削除
   */
  async delete(mapId: string, id: string): Promise<void> {
    const docRef = this.getGroupsCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Group with id ${id} not found in map ${mapId}`)
    }

    await docRef.delete()
  }

  /**
   * FirestoreドキュメントをGroupオブジェクトに変換
   */
  private mapDocToGroup(doc: FirebaseFirestore.DocumentSnapshot): Group {
    const data = doc.data()!
    return {
      id: doc.id,
      mapId: data.mapId,
      name: data.name,
      description: data.description,
      memberIds: data.memberIds ?? [],
      color: data.color,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  }
}

// シングルトンインスタンスをエクスポート
export const groupRepository = new FirestoreGroupRepository()
