import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  BulkImportTeachersRequest,
  CreateTeacherRequest,
  ImportTeachersResponse,
  TeacherDto,
  TeachersDto,
} from '@/types/teacher.types'

export const TEACHERS_QUERY_KEY = ['teachers'] as const
export const MY_PROFILE_QUERY_KEY = ['teachers', 'me'] as const

export function useTeachers() {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEY,
    queryFn: () =>
      api.get<TeachersDto>('/api/v1/teachers').then((res) => res.data),
  })
}

export function useCreateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTeacherRequest) =>
      api.post<TeacherDto>('/api/v1/teachers', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY })
    },
  })
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTeacherRequest }) =>
      api.patch<TeacherDto>(`/api/v1/teachers/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY })
    },
  })
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (teacherId: string) =>
      api.delete(`/api/v1/teachers/${teacherId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY })
    },
  })
}

export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: () => api.get<TeacherDto>('/api/v1/teachers/me').then((res) => res.data),
  })
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTeacherRequest) =>
      api.patch<TeacherDto>('/api/v1/teachers/me', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY })
    },
  })
}

export function useImportTeachers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BulkImportTeachersRequest) =>
      api
        .post<ImportTeachersResponse>('/api/v1/teachers/import', data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY })
    },
  })
}
