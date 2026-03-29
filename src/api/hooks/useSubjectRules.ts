import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  CreateSubjectRuleRequest,
  SubjectRuleDto,
  SubjectRulesListDto,
  UpdateSubjectRuleRequest,
} from '@/types/subject-rule.types'

export const SUBJECT_RULES_QUERY_KEY = ['subject-rules'] as const

export function useSubjectRules() {
  return useQuery({
    queryKey: SUBJECT_RULES_QUERY_KEY,
    queryFn: () =>
      api.get<SubjectRulesListDto>('/api/v1/constraints/subject-rules').then((res) => res.data),
  })
}

export function useCreateSubjectRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubjectRuleRequest) =>
      api
        .post<SubjectRuleDto>('/api/v1/constraints/subject-rules', data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_RULES_QUERY_KEY })
    },
  })
}

export function useUpdateSubjectRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectRuleRequest }) =>
      api
        .patch<SubjectRuleDto>(`/api/v1/constraints/subject-rules/${id}`, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_RULES_QUERY_KEY })
    },
  })
}

export function useDeleteSubjectRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/v1/constraints/subject-rules/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_RULES_QUERY_KEY })
    },
  })
}
