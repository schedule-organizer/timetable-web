import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CycleSettingsDto } from '@/types/cycle-term.types'

export const cycleSettingsQueryKeys = {
  cycle: () => ['settings', 'cycle'] as const,
}

export function useCycleSettings() {
  return useQuery({
    queryKey: cycleSettingsQueryKeys.cycle(),
    queryFn: () => api.get<CycleSettingsDto>('/api/v1/settings/cycle').then((res) => res.data),
  })
}

export function useUpdateCycleSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CycleSettingsDto) =>
      api.put<CycleSettingsDto>('/api/v1/settings/cycle', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleSettingsQueryKeys.cycle() })
    },
  })
}
