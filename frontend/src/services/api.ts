import axios from 'axios'
import {
  Member,
  Relationship,
  Group,
  Map,
  Community,
  CommunityDetectionResult,
  CreateMemberInput,
  UpdateMemberInput,
  CreateRelationshipInput,
  UpdateRelationshipInput,
  CreateGroupInput,
  UpdateGroupInput,
  CreateMapInput,
  UpdateMapInput,
  ApiResponse,
} from '@shared/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// トークン取得関数（AuthContextから設定される）
let getAuthToken: (() => Promise<string | null>) | null = null

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  getAuthToken = getter
}

// リクエストインターセプター: 認証トークンをヘッダーに追加
api.interceptors.request.use(
  async (config) => {
    if (getAuthToken) {
      const token = await getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// エラーメッセージ抽出ヘルパー
const extractErrorMessage = (error: any): string => {
  // APIレスポンスからエラーメッセージを抽出
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// レスポンスインターセプター: エラー処理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const errorMessage = extractErrorMessage(error)

    // ステータスコードに応じたエラーハンドリング
    switch (status) {
      case 401:
        console.error('Authentication error:', errorMessage)
        // トークンが無効な場合、ページをリロードして再ログインを促す
        // AuthContextでonAuthStateChangedが発火し、ログインページにリダイレクトされる
        if (errorMessage.includes('Token invalid or expired')) {
          window.location.reload()
        }
        break
      case 403:
        console.error('Authorization error:', errorMessage)
        break
      case 404:
        console.error('Resource not found:', errorMessage)
        break
      case 500:
        console.error('Server error:', errorMessage)
        break
      default:
        console.error('API error:', errorMessage)
    }

    // エラーメッセージを含めて reject
    return Promise.reject(new Error(errorMessage))
  }
)

// Members API
export const membersApi = {
  getAll: async (mapId?: string): Promise<Member[]> => {
    const params = mapId ? { mapId } : {}
    const response = await api.get<ApiResponse<Member[]>>('/members', { params })
    return response.data.data || []
  },

  getById: async (id: string, mapId: string): Promise<Member> => {
    const response = await api.get<ApiResponse<Member>>(`/members/${id}`, {
      params: { mapId },
    })
    if (!response.data.data) throw new Error('Member not found')
    return response.data.data
  },

  create: async (input: CreateMemberInput): Promise<Member> => {
    const response = await api.post<ApiResponse<Member>>('/members', input)
    if (!response.data.data) throw new Error('Failed to create member')
    return response.data.data
  },

  update: async (id: string, input: UpdateMemberInput, mapId: string): Promise<Member> => {
    const response = await api.put<ApiResponse<Member>>(`/members/${id}`, input, {
      params: { mapId },
    })
    if (!response.data.data) throw new Error('Failed to update member')
    return response.data.data
  },

  delete: async (id: string, mapId: string): Promise<void> => {
    await api.delete(`/members/${id}`, { params: { mapId } })
  },
}

// Relationships API
export const relationshipsApi = {
  getAll: async (mapId?: string): Promise<Relationship[]> => {
    const params = mapId ? { mapId } : {}
    const response = await api.get<ApiResponse<Relationship[]>>('/relationships', { params })
    return response.data.data || []
  },

  getById: async (id: string, mapId: string): Promise<Relationship> => {
    const response = await api.get<ApiResponse<Relationship>>(`/relationships/${id}`, {
      params: { mapId },
    })
    if (!response.data.data) throw new Error('Relationship not found')
    return response.data.data
  },

  getByMemberId: async (memberId: string, mapId: string): Promise<Relationship[]> => {
    const response = await api.get<ApiResponse<Relationship[]>>(
      `/relationships/member/${memberId}`,
      { params: { mapId } }
    )
    return response.data.data || []
  },

  create: async (input: CreateRelationshipInput): Promise<Relationship> => {
    const response = await api.post<ApiResponse<Relationship>>('/relationships', input)
    if (!response.data.data) throw new Error('Failed to create relationship')
    return response.data.data
  },

  update: async (
    id: string,
    input: UpdateRelationshipInput,
    mapId: string
  ): Promise<Relationship> => {
    const response = await api.put<ApiResponse<Relationship>>(`/relationships/${id}`, input, {
      params: { mapId },
    })
    if (!response.data.data) throw new Error('Failed to update relationship')
    return response.data.data
  },

  delete: async (id: string, mapId: string): Promise<void> => {
    await api.delete(`/relationships/${id}`, { params: { mapId } })
  },
}

// Groups API
export const groupsApi = {
  getAll: async (mapId?: string): Promise<Group[]> => {
    const params = mapId ? { mapId } : {}
    const response = await api.get<ApiResponse<Group[]>>('/groups', { params })
    return response.data.data || []
  },

  getById: async (id: string, mapId: string): Promise<Group> => {
    const response = await api.get<ApiResponse<Group>>(`/groups/${id}`, {
      params: { mapId },
    })
    if (!response.data.data) throw new Error('Group not found')
    return response.data.data
  },

  create: async (input: CreateGroupInput): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>('/groups', input)
    if (!response.data.data) throw new Error('Failed to create group')
    return response.data.data
  },

  update: async (id: string, input: UpdateGroupInput, mapId: string): Promise<Group> => {
    const response = await api.put<ApiResponse<Group>>(`/groups/${id}`, input, {
      params: { mapId },
    })
    if (!response.data.data) throw new Error('Failed to update group')
    return response.data.data
  },

  delete: async (id: string, mapId: string): Promise<void> => {
    await api.delete(`/groups/${id}`, { params: { mapId } })
  },
}

// Maps API
export const mapsApi = {
  getAll: async (): Promise<Map[]> => {
    const response = await api.get<ApiResponse<Map[]>>('/maps')
    return response.data.data || []
  },

  getById: async (id: string): Promise<Map> => {
    const response = await api.get<ApiResponse<Map>>(`/maps/${id}`)
    if (!response.data.data) throw new Error('Map not found')
    return response.data.data
  },

  create: async (input: CreateMapInput): Promise<Map> => {
    const response = await api.post<ApiResponse<Map>>('/maps', input)
    if (!response.data.data) throw new Error('Failed to create map')
    return response.data.data
  },

  update: async (id: string, input: UpdateMapInput): Promise<Map> => {
    const response = await api.put<ApiResponse<Map>>(`/maps/${id}`, input)
    if (!response.data.data) throw new Error('Failed to update map')
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/maps/${id}`)
  },
}

// ========================================
// Centrality API
// ========================================

export const centralityApi = {
  /**
   * 中心性分析を実行
   */
  calculate: async (mapId: string, topN: number = 10) => {
    const response = await api.post<ApiResponse<any>>(
      `/analysis/centrality/calculate?mapId=${mapId}&topN=${topN}`
    )
    if (!response.data.data) throw new Error('Failed to calculate centrality')
    return response.data.data
  },
}

// ========================================
// Community API
// ========================================

export const communityApi = {
  /**
   * コミュニティを再分析
   */
  refresh: async (mapId: string): Promise<CommunityDetectionResult> => {
    const response = await api.post<ApiResponse<CommunityDetectionResult>>(
      `/analysis/communities/refresh?mapId=${mapId}`
    )
    if (!response.data.data) throw new Error('Failed to refresh communities')
    return response.data.data
  },

  /**
   * コミュニティ一覧を取得
   */
  getAll: async (mapId: string): Promise<Community[]> => {
    const response = await api.get<ApiResponse<Community[]>>(
      `/analysis/communities?mapId=${mapId}`
    )
    return response.data.data || []
  },

  /**
   * コミュニティ統計情報を取得
   */
  getStats: async (mapId: string) => {
    const response = await api.get<ApiResponse<{
      totalCommunities: number
      averageSize: number
      largestCommunitySize: number
      smallestCommunitySize: number
      modularity: number
    }>>(`/analysis/communities/stats?mapId=${mapId}`)
    if (!response.data.data) throw new Error('Failed to get community stats')
    return response.data.data
  },

  /**
   * 特定のコミュニティを取得
   */
  getById: async (mapId: string, id: string): Promise<Community> => {
    const response = await api.get<ApiResponse<Community>>(
      `/analysis/communities/${id}?mapId=${mapId}`
    )
    if (!response.data.data) throw new Error('Community not found')
    return response.data.data
  },

  /**
   * コミュニティを更新
   */
  update: async (
    mapId: string,
    id: string,
    data: { name?: string; color?: string }
  ): Promise<Community> => {
    const response = await api.put<ApiResponse<Community>>(
      `/analysis/communities/${id}?mapId=${mapId}`,
      data
    )
    if (!response.data.data) throw new Error('Failed to update community')
    return response.data.data
  },

  /**
   * コミュニティを削除
   */
  delete: async (mapId: string, id: string): Promise<void> => {
    await api.delete(`/analysis/communities/${id}?mapId=${mapId}`)
  },
}

export default api
