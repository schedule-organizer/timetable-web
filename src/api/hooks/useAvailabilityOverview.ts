import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  TeacherAvailabilityOverrideDto,
  TeacherAvailabilitySummary,
  UpdateTeacherAvailabilityOverrideRequest,
} from '@/types/teacher-availability-override.types'

export const availabilitySummaryQueryKey = () => ['teachers', 'availability-summary'] as const

export const teacherAvailabilityOverrideQueryKey = (teacherId: string) =>
  ['teachers', teacherId, 'availability', 'override'] as const

export function useAvailabilitySummary() {
  return useQuery({
    queryKey: availabilitySummaryQueryKey(),
    queryFn: () =>
      api
        .get<TeacherAvailabilitySummary>('/api/v1/teachers/availability-summary')
        .then((r) => r.data),
  })
}

export function useTeacherAvailabilityOverride(teacherId: string | undefined) {
  return useQuery({
    queryKey: teacherId
      ? teacherAvailabilityOverrideQueryKey(teacherId)
      : ['teachers', 'availability', 'override', 'none'],
    queryFn: () =>
      api
        .get<TeacherAvailabilityOverrideDto>(
          `/api/v1/teachers/${teacherId}/availability/override`,
        )
        .then((r) => r.data),
    enabled: Boolean(teacherId),
  })
}

export function useUpdateTeacherAvailabilityOverride(teacherId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTeacherAvailabilityOverrideRequest) => {
      if (!teacherId) return Promise.reject(new Error('Missing teacher id'))
      return api
        .put<TeacherAvailabilityOverrideDto>(
          `/api/v1/teachers/${teacherId}/availability/override`,
          data,
        )
        .then((r) => r.data)
    },
    onSuccess: (data) => {
      if (teacherId) {
        queryClient.setQueryData(teacherAvailabilityOverrideQueryKey(teacherId), data)
        queryClient.invalidateQueries({ queryKey: availabilitySummaryQueryKey() })
      }
    },
  })
}
