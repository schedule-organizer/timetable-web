import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  CreateSoftPreferenceRequest,
  SoftPreferenceDto,
  SoftPreferencesListDto,
  UpdateSoftPreferenceRequest,
} from '@/types/soft-preference.types'

export const SOFT_PREFERENCES_QUERY_KEY = ['soft-preferences'] as const

export function useSoftPreferences() {
  return useQuery({
    queryKey: SOFT_PREFERENCES_QUERY_KEY,
    queryFn: () =>
      api.get<SoftPreferencesListDto>('/api/v1/constraints/soft').then((res) => res.data),
  })
}

export function useCreateSoftPreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSoftPreferenceRequest) =>
      api.post<SoftPreferenceDto>('/api/v1/constraints/soft', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOFT_PREFERENCES_QUERY_KEY })
    },
  })
}

export function useUpdateSoftPreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSoftPreferenceRequest }) =>
      api
        .patch<SoftPreferenceDto>(`/api/v1/constraints/soft/${id}`, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOFT_PREFERENCES_QUERY_KEY })
    },
  })
}

export function useDeleteSoftPreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/constraints/soft/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOFT_PREFERENCES_QUERY_KEY })
    },
  })
}
