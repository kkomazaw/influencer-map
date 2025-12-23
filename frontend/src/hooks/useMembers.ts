import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { membersApi } from '../services/api'
import { useStore } from '../stores/useStore'
import { CreateMemberInput, UpdateMemberInput } from '@shared/types'

export const useMembers = (mapId?: string) => {
  const queryClient = useQueryClient()
  const setMembers = useStore((state) => state.setMembers)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', mapId],
    queryFn: async () => {
      const data = await membersApi.getAll(mapId)
      setMembers(data)
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateMemberInput) => membersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', mapId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMemberInput }) =>
      membersApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', mapId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', mapId] })
    },
  })

  return {
    members,
    isLoading,
    createMember: createMutation.mutate,
    updateMember: updateMutation.mutate,
    deleteMember: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
