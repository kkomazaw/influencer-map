import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi } from '../services/api'
import { useStore } from '../stores/useStore'
import { CreateGroupInput, UpdateGroupInput } from '@shared/types'

export const useGroups = (mapId?: string) => {
  const queryClient = useQueryClient()
  const setGroups = useStore((state) => state.setGroups)

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups', mapId],
    queryFn: async () => {
      const data = await groupsApi.getAll(mapId)
      setGroups(data)
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateGroupInput) => groupsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', mapId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGroupInput }) => {
      if (!mapId) throw new Error('mapId is required')
      return groupsApi.update(id, input, mapId)
    },
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['groups', mapId] })

      // Snapshot the previous value
      const previousGroups = queryClient.getQueryData(['groups', mapId])

      // Optimistically update to the new value
      queryClient.setQueryData(['groups', mapId], (old: any) => {
        if (!old) return old
        return old.map((group: any) =>
          group.id === id ? { ...group, ...input } : group
        )
      })

      // Return a context object with the snapshotted value
      return { previousGroups }
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGroups) {
        queryClient.setQueryData(['groups', mapId], context.previousGroups)
      }
    },
    onSuccess: (data, variables) => {
      // Update cache with server response to ensure data consistency
      queryClient.setQueryData(['groups', mapId], (old: any) => {
        if (!old) return old
        return old.map((group: any) =>
          group.id === variables.id ? data : group
        )
      })

      // Only invalidate if this is not a position-only update
      const isPositionOnlyUpdate = variables.input.x !== undefined && variables.input.y !== undefined &&
        Object.keys(variables.input).length === 2

      if (!isPositionOnlyUpdate) {
        queryClient.invalidateQueries({ queryKey: ['groups', mapId] })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!mapId) throw new Error('mapId is required')
      return groupsApi.delete(id, mapId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', mapId] })
    },
  })

  return {
    groups,
    isLoading,
    createGroup: createMutation.mutate,
    updateGroup: updateMutation.mutate,
    deleteGroup: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
