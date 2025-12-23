/**
 * Firestore Member Repository Implementation
 *
 * /maps/{mapId}/members サブコレクションに対するCRUD操作を実装
 */

import { db } from '../config/firebase'
import { IMemberRepository } from './interfaces'
import { Member, CreateMemberInput, UpdateMemberInput } from '@shared/types'
import { Timestamp } from 'firebase-admin/firestore'

export class FirestoreMemberRepository implements IMemberRepository {
  /**
   * メンバーサブコレクションの参照を取得
   */
  private getMembersCollection(mapId: string) {
    return db.collection('maps').doc(mapId).collection('members')
  }

  /**
   * メンバーを作成
   */
  async create(mapId: string, data: CreateMemberInput): Promise<Member> {
    const collectionRef = this.getMembersCollection(mapId)
    const docRef = collectionRef.doc()
    const now = Timestamp.now()

    const member: Member = {
      id: docRef.id,
      mapId,
      name: data.name,
      email: data.email,
      department: data.department,
      position: data.position,
      avatarUrl: data.avatarUrl,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    }

    await docRef.set({
      ...member,
      createdAt: now,
      updatedAt: now,
    })

    return member
  }

  /**
   * IDでメンバーを取得
   */
  async findById(mapId: string, id: string): Promise<Member | null> {
    const docRef = this.getMembersCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    return this.mapDocToMember(doc)
  }

  /**
   * マップIDでメンバー一覧を取得
   */
  async findByMapId(mapId: string): Promise<Member[]> {
    const snapshot = await this.getMembersCollection(mapId).get()
    return snapshot.docs.map((doc) => this.mapDocToMember(doc))
  }

  /**
   * 部署でメンバーを絞り込み
   */
  async findByDepartment(mapId: string, department: string): Promise<Member[]> {
    const snapshot = await this.getMembersCollection(mapId)
      .where('department', '==', department)
      .get()

    return snapshot.docs.map((doc) => this.mapDocToMember(doc))
  }

  /**
   * メンバー名で検索（部分一致）
   */
  async searchByName(mapId: string, query: string): Promise<Member[]> {
    // Firestoreは部分一致検索をネイティブサポートしていないため、
    // クライアント側でフィルタリングする
    const allMembers = await this.findByMapId(mapId)
    return allMembers.filter((member) =>
      member.name.toLowerCase().includes(query.toLowerCase())
    )
  }

  /**
   * 中心性スコアでソート
   */
  async findTopByCentrality(mapId: string, limit: number): Promise<Member[]> {
    const snapshot = await this.getMembersCollection(mapId)
      .where('centralityScore', '>', 0)
      .orderBy('centralityScore', 'desc')
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => this.mapDocToMember(doc))
  }

  /**
   * メンバーを更新
   */
  async update(mapId: string, id: string, data: UpdateMemberInput): Promise<Member> {
    const docRef = this.getMembersCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Member with id ${id} not found in map ${mapId}`)
    }

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    return this.mapDocToMember(updatedDoc)
  }

  /**
   * メンバーを削除
   */
  async delete(mapId: string, id: string): Promise<void> {
    const docRef = this.getMembersCollection(mapId).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error(`Member with id ${id} not found in map ${mapId}`)
    }

    await docRef.delete()
  }

  /**
   * 複数メンバーのcommunityIdを一括更新
   */
  async batchUpdateCommunityId(
    mapId: string,
    updates: Record<string, string>
  ): Promise<void> {
    const batch = db.batch()
    const collectionRef = this.getMembersCollection(mapId)

    Object.entries(updates).forEach(([memberId, communityId]) => {
      const docRef = collectionRef.doc(memberId)
      batch.update(docRef, {
        communityId,
        updatedAt: Timestamp.now(),
      })
    })

    await batch.commit()
  }

  /**
   * FirestoreドキュメントをMemberオブジェクトに変換
   */
  private mapDocToMember(doc: FirebaseFirestore.DocumentSnapshot): Member {
    const data = doc.data()!
    return {
      id: doc.id,
      mapId: data.mapId,
      name: data.name,
      email: data.email,
      department: data.department,
      position: data.position,
      avatarUrl: data.avatarUrl,
      centralityScore: data.centralityScore,
      communityId: data.communityId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    }
  }
}

// シングルトンインスタンスをエクスポート
export const memberRepository = new FirestoreMemberRepository()
