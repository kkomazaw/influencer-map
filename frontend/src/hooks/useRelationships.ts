import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { relationshipsApi } from '../services/api'
import { useStore } from '../stores/useStore'
import { CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'

export const useRelationships = (mapId?: string) => {
  const queryClient = useQueryClient()
  const setRelationships = useStore((state) => state.setRelationships)

  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['relationships', mapId],
    queryFn: async () => {
      const data = await relationshipsApi.getAll(mapId)
      setRelationships(data)
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateRelationshipInput) => relationshipsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', mapId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRelationshipInput }) => {
      if (!mapId) throw new Error('mapId is required')
      return relationshipsApi.update(id, input, mapId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', mapId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!mapId) throw new Error('mapId is required')
      return relationshipsApi.delete(id, mapId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', mapId] })
    },
  })

  return {
    relationships,
    isLoading,
    createRelationship: createMutation.mutate,
    updateRelationship: updateMutation.mutate,
    deleteRelationship: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
