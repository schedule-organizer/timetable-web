import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  CreateHardConstraintRequest,
  HardConstraintDto,
  HardConstraintsListDto,
  UpdateHardConstraintRequest,
} from '@/types/hard-constraint.types'

export const HARD_CONSTRAINTS_QUERY_KEY = ['hard-constraints'] as const

export function useHardConstraints() {
  return useQuery({
    queryKey: HARD_CONSTRAINTS_QUERY_KEY,
    queryFn: () =>
      api.get<HardConstraintsListDto>('/api/v1/constraints/hard').then((res) => res.data),
  })
}

export function useCreateHardConstraint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHardConstraintRequest) =>
      api.post<HardConstraintDto>('/api/v1/constraints/hard', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARD_CONSTRAINTS_QUERY_KEY })
    },
  })
}

export function useUpdateHardConstraint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHardConstraintRequest }) =>
      api
        .patch<HardConstraintDto>(`/api/v1/constraints/hard/${id}`, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARD_CONSTRAINTS_QUERY_KEY })
    },
  })
}

export function useDeleteHardConstraint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/constraints/hard/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HARD_CONSTRAINTS_QUERY_KEY })
    },
  })
}
