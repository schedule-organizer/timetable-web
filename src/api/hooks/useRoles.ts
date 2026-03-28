import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  UsersWithRolesDto,
  AssignRolesRequest,
  AssignRolesResponse,
  SubscriptionLimits,
} from '@/types/rbac.types'

export const USERS_QUERY_KEY = ['users'] as const
export const SUBSCRIPTION_LIMITS_QUERY_KEY = ['subscription-limits'] as const

export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () =>
      api.get<UsersWithRolesDto>('/api/v1/users').then((res) => res.data),
  })
}

export function useAssignUserRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRolesRequest }) =>
      api
        .put<AssignRolesResponse>(`/api/v1/users/${userId}/roles`, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })
}

export function useSubscriptionLimits() {
  return useQuery({
    queryKey: SUBSCRIPTION_LIMITS_QUERY_KEY,
    queryFn: () =>
      api.get<SubscriptionLimits>('/api/v1/subscription/limits').then((res) => res.data),
  })
}
