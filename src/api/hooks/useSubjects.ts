import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateSubjectRequest, SubjectDto, SubjectsDto } from '@/types/subject.types'

export const SUBJECTS_QUERY_KEY = ['subjects'] as const

export function useSubjects() {
  return useQuery({
    queryKey: SUBJECTS_QUERY_KEY,
    queryFn: () => api.get<SubjectsDto>('/api/v1/subjects').then((res) => res.data),
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubjectRequest) =>
      api.post<SubjectDto>('/api/v1/subjects', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY })
    },
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateSubjectRequest }) =>
      api.patch<SubjectDto>(`/api/v1/subjects/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY })
    },
  })
}
