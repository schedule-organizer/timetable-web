import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useTenantStore } from '@/store/tenantStore'
import type { TerminologyLabels, UpdateTerminologyRequest } from '@/types/settings.types'

export const settingsQueryKeys = {
  labels: () => ['settings', 'labels'] as const,
}

export function useTerminologyLabels() {
  return useQuery({
    queryKey: settingsQueryKeys.labels(),
    queryFn: () =>
      api.get<TerminologyLabels>('/api/v1/settings/labels').then((res) => res.data),
    staleTime: Infinity, // Labels change only when a Timetabler updates terminology.
  })
}

export function useUpdateTerminologyLabels() {
  const queryClient = useQueryClient()
  const { setLabels } = useTenantStore()

  return useMutation({
    mutationFn: (data: UpdateTerminologyRequest) =>
      api.put<TerminologyLabels>('/api/v1/settings/labels', data).then((res) => res.data),
    onSuccess: (data) => {
      // Sync updated labels to store so useLabels() reflects changes immediately.
      setLabels(data)
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.labels() })
    },
  })
}
