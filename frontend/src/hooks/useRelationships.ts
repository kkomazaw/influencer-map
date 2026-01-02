import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { relationshipsApi } from '../services/api'
import { useStore } from '../stores/useStore'
import { CreateRelationshipInput, UpdateRelationshipInput } from '@shared/types'

export const useRelationships = (mapId?: string) => {
  const queryClient = useQueryClient()
  const setRelationships = useStore((state) => state.setRelationships)
  const addRelationshipToStore = useStore((state) => state.addRelationship)
  const relationshipsFromStore = useStore((state) => state.relationships)

  const { isLoading } = useQuery({
    queryKey: ['relationships', mapId],
    queryFn: async () => {
      const data = await relationshipsApi.getAll(mapId)
      setRelationships(data)
      return data
    },
  })

  // Use relationships from store for immediate updates
  const relationships = relationshipsFromStore

  const createMutation = useMutation({
    mutationFn: (input: CreateRelationshipInput) => relationshipsApi.create(input),
    onMutate: async (input) => {
      console.log('🔵 useRelationships: onMutate called with input:', input)

      // Create temporary relationship with placeholder ID
      const tempRelationship = {
        id: `temp-${Date.now()}`,
        mapId: input.mapId,
        sourceId: input.sourceId,
        targetId: input.targetId,
        type: input.type,
        strength: input.strength,
        bidirectional: input.bidirectional,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log('🔵 useRelationships: Created temp relationship:', tempRelationship)

      // Optimistically update store for immediate UI update
      addRelationshipToStore(tempRelationship)

      console.log('🔵 useRelationships: Called addRelationshipToStore')

      // Return context for rollback
      return { tempRelationshipId: tempRelationship.id }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, rollback by refreshing from server
      console.error('Failed to create relationship:', err)
      queryClient.invalidateQueries({ queryKey: ['relationships', mapId] })
    },
    onSuccess: async (data, variables, context) => {
      console.log('🟢 useRelationships: onSuccess - server returned:', data)
      console.log('🟢 useRelationships: Temp relationship ID was:', context?.tempRelationshipId)

      // Refresh from server to get the authoritative data
      // This will replace the temp relationship with the real one from the server
      await queryClient.invalidateQueries({ queryKey: ['relationships', mapId] })
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
    createRelationship: createMutation.mutateAsync,
    updateRelationship: updateMutation.mutate,
    deleteRelationship: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
