/**
 * useCommunities Hook
 *
 * コミュニティデータの取得・更新を管理するReact Queryフック
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Community, CommunityDetectionResult } from '@shared/types'
import { communityApi } from '../services/api'
import { handleApiError } from '../utils/errorHandling'

/**
 * コミュニティ一覧を取得するフック
 */
export function useCommunities(mapId: string) {
  return useQuery({
    queryKey: ['communities', mapId],
    queryFn: () => communityApi.getAll(mapId),
    enabled: !!mapId,
  })
}

/**
 * コミュニティ統計情報を取得するフック
 */
export function useCommunityStats(mapId: string) {
  return useQuery({
    queryKey: ['community-stats', mapId],
    queryFn: () => communityApi.getStats(mapId),
    enabled: !!mapId,
  })
}

/**
 * 特定のコミュニティを取得するフック
 */
export function useCommunity(mapId: string, communityId: string) {
  return useQuery({
    queryKey: ['community', mapId, communityId],
    queryFn: () => communityApi.getById(mapId, communityId),
    enabled: !!mapId && !!communityId,
  })
}

/**
 * コミュニティ再分析のミューテーション
 */
export function useRefreshCommunities(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => communityApi.refresh(mapId),
    onSuccess: (data: CommunityDetectionResult) => {
      // コミュニティ一覧を更新
      queryClient.setQueryData(['communities', mapId], data.communities)
      // 統計情報を無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['community-stats', mapId] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to refresh communities')
    },
  })
}

/**
 * コミュニティ更新のミューテーション
 */
export function useUpdateCommunity(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) =>
      communityApi.update(mapId, id, data),
    onSuccess: (updatedCommunity: Community) => {
      // コミュニティ一覧を更新
      queryClient.setQueryData<Community[]>(['communities', mapId], (old) => {
        if (!old) return [updatedCommunity]
        return old.map((c) => (c.id === updatedCommunity.id ? updatedCommunity : c))
      })
      // 個別コミュニティキャッシュを更新
      queryClient.setQueryData(['community', mapId, updatedCommunity.id], updatedCommunity)
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update community')
    },
  })
}

/**
 * コミュニティ削除のミューテーション
 */
export function useDeleteCommunity(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => communityApi.delete(mapId, id),
    onSuccess: (_, deletedId) => {
      // コミュニティ一覧から削除
      queryClient.setQueryData<Community[]>(['communities', mapId], (old) => {
        if (!old) return []
        return old.filter((c) => c.id !== deletedId)
      })
      // 統計情報を無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['community-stats', mapId] })
      // 個別コミュニティキャッシュを削除
      queryClient.removeQueries({ queryKey: ['community', mapId, deletedId] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to delete community')
    },
  })
}
