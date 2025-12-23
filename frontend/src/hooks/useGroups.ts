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
    mutationFn: ({ id, input }: { id: string; input: UpdateGroupInput }) =>
      groupsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', mapId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupsApi.delete(id),
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
