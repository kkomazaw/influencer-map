import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mapsApi } from '../services/api'
import { UpdateMapInput } from '@shared/types'

export const useMap = (mapId: string | undefined) => {
  const queryClient = useQueryClient()

  const { data: map, isLoading } = useQuery({
    queryKey: ['map', mapId],
    queryFn: () => {
      if (!mapId) throw new Error('mapId is required')
      return mapsApi.getById(mapId)
    },
    enabled: !!mapId,
  })

  const { mutate: updateMap, isPending: isUpdating } = useMutation({
    mutationFn: (input: UpdateMapInput) => {
      if (!mapId) throw new Error('mapId is required')
      return mapsApi.update(mapId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['map', mapId] })
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    },
  })

  return {
    map,
    isLoading,
    updateMap,
    isUpdating,
  }
}
