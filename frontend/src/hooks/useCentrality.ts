/**
 * useCentrality Hook
 *
 * 中心性分析データの取得・計算を管理するReact Queryフック
 */

import { useMutation } from '@tanstack/react-query'
import { centralityApi } from '../services/api'

/**
 * 中心性分析を実行するフック
 */
export function useCalculateCentrality(mapId: string, topN: number = 10) {
  return useMutation({
    mutationFn: () => centralityApi.calculate(mapId, topN),
    onError: (error) => {
      console.error('Failed to calculate centrality:', error)
    },
  })
}
