import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { AcademicTermsDto } from '@/types/cycle-term.types'

export const academicTermsQueryKeys = {
  terms: () => ['settings', 'academic-terms'] as const,
}

export function useAcademicTerms() {
  return useQuery({
    queryKey: academicTermsQueryKeys.terms(),
    queryFn: () => api.get<AcademicTermsDto>('/api/v1/settings/academic-terms').then((res) => res.data),
  })
}

export function useUpdateAcademicTerms() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AcademicTermsDto) =>
      api.put<AcademicTermsDto>('/api/v1/settings/academic-terms', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicTermsQueryKeys.terms() })
    },
  })
}
