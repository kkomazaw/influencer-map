import axios from 'axios'
import {
  Member,
  Relationship,
  Group,
  Map,
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

// Members API
export const membersApi = {
  getAll: async (mapId?: string): Promise<Member[]> => {
    const params = mapId ? { mapId } : {}
    const response = await api.get<ApiResponse<Member[]>>('/members', { params })
    return response.data.data || []
  },

  getById: async (id: string): Promise<Member> => {
    const response = await api.get<ApiResponse<Member>>(`/members/${id}`)
    if (!response.data.data) throw new Error('Member not found')
    return response.data.data
  },

  create: async (input: CreateMemberInput): Promise<Member> => {
    const response = await api.post<ApiResponse<Member>>('/members', input)
    if (!response.data.data) throw new Error('Failed to create member')
    return response.data.data
  },

  update: async (id: string, input: UpdateMemberInput): Promise<Member> => {
    const response = await api.put<ApiResponse<Member>>(`/members/${id}`, input)
    if (!response.data.data) throw new Error('Failed to update member')
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/members/${id}`)
  },
}

// Relationships API
export const relationshipsApi = {
  getAll: async (mapId?: string): Promise<Relationship[]> => {
    const params = mapId ? { mapId } : {}
    const response = await api.get<ApiResponse<Relationship[]>>('/relationships', { params })
    return response.data.data || []
  },

  getById: async (id: string): Promise<Relationship> => {
    const response = await api.get<ApiResponse<Relationship>>(`/relationships/${id}`)
    if (!response.data.data) throw new Error('Relationship not found')
    return response.data.data
  },

  getByMemberId: async (memberId: string): Promise<Relationship[]> => {
    const response = await api.get<ApiResponse<Relationship[]>>(
      `/relationships/member/${memberId}`
    )
    return response.data.data || []
  },

  create: async (input: CreateRelationshipInput): Promise<Relationship> => {
    const response = await api.post<ApiResponse<Relationship>>('/relationships', input)
    if (!response.data.data) throw new Error('Failed to create relationship')
    return response.data.data
  },

  update: async (id: string, input: UpdateRelationshipInput): Promise<Relationship> => {
    const response = await api.put<ApiResponse<Relationship>>(`/relationships/${id}`, input)
    if (!response.data.data) throw new Error('Failed to update relationship')
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/relationships/${id}`)
  },
}

// Groups API
export const groupsApi = {
  getAll: async (mapId?: string): Promise<Group[]> => {
    const params = mapId ? { mapId } : {}
    const response = await api.get<ApiResponse<Group[]>>('/groups', { params })
    return response.data.data || []
  },

  getById: async (id: string): Promise<Group> => {
    const response = await api.get<ApiResponse<Group>>(`/groups/${id}`)
    if (!response.data.data) throw new Error('Group not found')
    return response.data.data
  },

  create: async (input: CreateGroupInput): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>('/groups', input)
    if (!response.data.data) throw new Error('Failed to create group')
    return response.data.data
  },

  update: async (id: string, input: UpdateGroupInput): Promise<Group> => {
    const response = await api.put<ApiResponse<Group>>(`/groups/${id}`, input)
    if (!response.data.data) throw new Error('Failed to update group')
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`)
  },
}

// Maps API
export const mapsApi = {
  getAll: async (): Promise<Map[]> => {
    const response = await api.get<Map[]>('/maps')
    return response.data
  },

  getById: async (id: string): Promise<Map> => {
    const response = await api.get<Map>(`/maps/${id}`)
    return response.data
  },

  create: async (input: CreateMapInput): Promise<Map> => {
    const response = await api.post<Map>('/maps', input)
    return response.data
  },

  update: async (id: string, input: UpdateMapInput): Promise<Map> => {
    const response = await api.put<Map>(`/maps/${id}`, input)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/maps/${id}`)
  },
}

export default api
