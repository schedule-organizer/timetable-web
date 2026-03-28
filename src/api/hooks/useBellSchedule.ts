import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { BellScheduleDto } from '@/types/bell-schedule.types'

export const bellScheduleQueryKeys = {
  schedule: () => ['settings', 'bell-schedule'] as const,
}

export function useBellSchedule() {
  return useQuery({
    queryKey: bellScheduleQueryKeys.schedule(),
    queryFn: () => api.get<BellScheduleDto>('/api/v1/settings/bell-schedule').then((res) => res.data),
  })
}

export function useUpdateBellSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BellScheduleDto) =>
      api.put<BellScheduleDto>('/api/v1/settings/bell-schedule', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bellScheduleQueryKeys.schedule() })
    },
  })
}
