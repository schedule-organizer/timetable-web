import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  TeacherAvailabilityDto,
  UpdateTeacherAvailabilityRequest,
} from '@/types/teacher-availability.types'

export const teacherAvailabilityQueryKey = (teacherId: string) =>
  ['teachers', teacherId, 'availability'] as const

export function useTeacherAvailability(teacherId: string | undefined) {
  return useQuery({
    queryKey: teacherId ? teacherAvailabilityQueryKey(teacherId) : ['teachers', 'availability', 'none'],
    queryFn: () =>
      api
        .get<TeacherAvailabilityDto>(`/api/v1/teachers/${teacherId}/availability`)
        .then((res) => res.data),
    enabled: Boolean(teacherId),
  })
}

export function useUpdateTeacherAvailability(teacherId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTeacherAvailabilityRequest) => {
      if (!teacherId) {
        return Promise.reject(new Error('Missing teacher id'))
      }
      return api
        .put<TeacherAvailabilityDto>(`/api/v1/teachers/${teacherId}/availability`, data)
        .then((res) => res.data)
    },
    onSuccess: (data) => {
      if (teacherId) {
        queryClient.setQueryData(teacherAvailabilityQueryKey(teacherId), data)
      }
    },
  })
}
