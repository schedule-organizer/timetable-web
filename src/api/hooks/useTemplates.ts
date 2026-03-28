import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import {
  applyTemplateRequestSchema,
  appliedTemplateSettingsSchema,
  institutionTemplatesDtoSchema,
} from '@/types/template.schemas'
import type { ApplyTemplateRequest } from '@/types/template.types'

export const templateQueryKeys = {
  templates: () => ['settings', 'templates'] as const,
}

export function useInstitutionTemplates() {
  return useQuery({
    queryKey: templateQueryKeys.templates(),
    queryFn: () =>
      api.get('/api/v1/settings/templates').then((res) => institutionTemplatesDtoSchema.parse(res.data)),
  })
}

export function useApplyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApplyTemplateRequest) => {
      const body = applyTemplateRequestSchema.parse(data)
      return api
        .post('/api/v1/settings/apply-template', body)
        .then((res) => appliedTemplateSettingsSchema.parse(res.data))
    },
    onSuccess: () => {
      // Invalidate settings affected by the applied template
      queryClient.invalidateQueries({ queryKey: ['settings', 'bell-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'cycle'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'labels'] })
    },
  })
}
