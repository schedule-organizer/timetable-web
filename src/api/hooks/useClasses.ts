import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ClassDto, ClassesDto, CreateClassRequest } from '@/types/class.types'

export const CLASSES_QUERY_KEY = ['classes'] as const

export function useClasses() {
  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: () => api.get<ClassesDto>('/api/v1/classes').then((res) => res.data),
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClassRequest) =>
      api.post<ClassDto>('/api/v1/classes', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateClassRequest }) =>
      api.patch<ClassDto>(`/api/v1/classes/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (classId: string) =>
      api.delete(`/api/v1/classes/${classId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY })
    },
  })
}
