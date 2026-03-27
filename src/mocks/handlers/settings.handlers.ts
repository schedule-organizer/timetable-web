import { http, HttpResponse } from 'msw'
import { mockTerminologyLabels } from '@/mocks/pages/settings-page.mock'
import type { TerminologyLabels } from '@/types/settings.types'

// In-memory store for terminology labels; reset between MSW server resets.
let currentLabels: TerminologyLabels = { ...mockTerminologyLabels }

export function resetTerminologyLabels() {
  currentLabels = { ...mockTerminologyLabels }
}

export const settingsHandlers = [
  http.get('/api/v1/settings/labels', () => {
    return HttpResponse.json(currentLabels)
  }),

  http.put('/api/v1/settings/labels', async ({ request }) => {
    const body = (await request.json()) as TerminologyLabels
    currentLabels = { ...body }
    return HttpResponse.json(currentLabels)
  }),

  http.get('/api/v1/settings/public', () => {
    return HttpResponse.json({ locale: 'en', timezone: 'UTC' })
  }),
]
