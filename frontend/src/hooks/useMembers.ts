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
    mutationFn: ({ id, input }: { id: string; input: UpdateMemberInput }) => {
      console.log('🔵 updateMutation.mutationFn called with:', { id, input, mapId })
      if (!mapId) {
        console.error('❌ mapId is undefined! Cannot update member.')
        throw new Error('mapId is required')
      }
      console.log('🔵 Calling membersApi.update...')
      return membersApi.update(id, input, mapId)
    },
    onMutate: async ({ id, input }) => {
      console.log('🟡 updateMutation.onMutate called with:', { id, input })
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['members', mapId] })

      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData(['members', mapId])

      // Optimistically update to the new value
      queryClient.setQueryData(['members', mapId], (old: any) => {
        if (!old) return old
        return old.map((member: any) =>
          member.id === id ? { ...member, ...input } : member
        )
      })

      // Return a context object with the snapshotted value
      return { previousMembers }
    },
    onError: (err, variables, context) => {
      console.error('🔴 updateMutation.onError:', err)
      console.error('🔴 Error variables:', variables)
      console.error('🔴 Error context:', context)
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMembers) {
        queryClient.setQueryData(['members', mapId], context.previousMembers)
      }
    },
    onSuccess: (data, variables) => {
      console.log('🟢 updateMutation.onSuccess:', { data, variables })

      // Update cache with server response to ensure data consistency
      queryClient.setQueryData(['members', mapId], (old: any) => {
        if (!old) return old
        return old.map((member: any) =>
          member.id === variables.id ? data : member
        )
      })

      // Only invalidate if this is not a position-only update
      const keys = Object.keys(variables.input)
      const isPositionOnlyUpdate = keys.length === 2 &&
        variables.input.x !== undefined &&
        variables.input.y !== undefined

      if (!isPositionOnlyUpdate) {
        queryClient.invalidateQueries({ queryKey: ['members', mapId] })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!mapId) throw new Error('mapId is required')
      return membersApi.delete(id, mapId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', mapId] })
    },
  })

  return {
    members,
    isLoading,
    createMember: createMutation.mutate,
    updateMember: (variables: { id: string; input: UpdateMemberInput }) => {
      console.log('🟣 updateMember wrapper called with:', variables)
      return updateMutation.mutate(variables)
    },
    deleteMember: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
