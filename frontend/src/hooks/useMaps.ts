import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mapsApi } from '../services/api'
import { CreateMapInput, UpdateMapInput } from '@shared/types'

export const useMaps = () => {
  const queryClient = useQueryClient()

  const { data: maps = [], isLoading } = useQuery({
    queryKey: ['maps'],
    queryFn: () => mapsApi.getAll(),
  })

  const { mutate: createMap, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateMapInput) => mapsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    },
  })

  const { mutate: updateMap, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMapInput }) =>
      mapsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    },
  })

  const { mutate: deleteMap, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => mapsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    },
  })

  return {
    maps,
    isLoading,
    createMap,
    updateMap,
    deleteMap,
    isCreating,
    isUpdating,
    isDeleting,
  }
}
