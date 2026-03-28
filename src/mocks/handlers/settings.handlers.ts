import { http, HttpResponse } from 'msw'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockTerminologyLabels } from '@/mocks/pages/settings-page.mock'
import { findFirstOverlappingPair } from '@/lib/bell-schedule-utils'
import type { BellScheduleDto } from '@/types/bell-schedule.types'
import type { TerminologyLabels } from '@/types/settings.types'

// In-memory store for terminology labels; reset between MSW server resets.
let currentLabels: TerminologyLabels = { ...mockTerminologyLabels }

let currentBellSchedule: BellScheduleDto = {
  periods: mockBellSchedule.periods.map((p) => ({ ...p })),
}

export function resetTerminologyLabels() {
  currentLabels = { ...mockTerminologyLabels }
}

export function resetBellScheduleMock() {
  currentBellSchedule = {
    periods: mockBellSchedule.periods.map((p) => ({ ...p })),
  }
}

/** Call in afterEach when using settingsHandlers in a shared MSW server. */
export function resetAllSettingsMocks() {
  resetTerminologyLabels()
  resetBellScheduleMock()
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

  http.get('/api/v1/settings/bell-schedule', () => {
    return HttpResponse.json(currentBellSchedule)
  }),

  http.put('/api/v1/settings/bell-schedule', async ({ request }) => {
    const body = (await request.json()) as BellScheduleDto
    const invalidPeriod = body.periods.find((p) => {
      const s = p.startTime.match(/^(\d{2}):(\d{2})$/)
      const e = p.endTime.match(/^(\d{2}):(\d{2})$/)
      if (!s || !e) return true
      const start = Number(s[1]) * 60 + Number(s[2])
      const end = Number(e[1]) * 60 + Number(e[2])
      return end <= start
    })
    if (invalidPeriod) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_PERIOD_TIME', message: `Period "${invalidPeriod.name}" has an end time that is not after its start time.` },
        { status: 400 },
      )
    }
    const overlap = findFirstOverlappingPair(body.periods)
    if (overlap) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'BELL_SCHEDULE_OVERLAP',
          message: `Time ranges overlap between "${overlap.periodA.name}" and "${overlap.periodB.name}". Adjust the times so periods do not overlap.`,
          details: {
            periodA: { id: overlap.periodA.id, name: overlap.periodA.name },
            periodB: { id: overlap.periodB.id, name: overlap.periodB.name },
          },
        },
        { status: 400 },
      )
    }
    currentBellSchedule = { periods: body.periods.map((p) => ({ ...p })) }
    return HttpResponse.json(currentBellSchedule)
  }),
]
