import { http, HttpResponse } from 'msw'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockAcademicTerms, mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { mockTerminologyLabels } from '@/mocks/pages/settings-page.mock'
import {
  mockInstitutionTemplates,
  mockTemplateBellSchedules,
  mockTemplateCycles,
  mockTemplateTerminologyOverrides,
} from '@/mocks/pages/onboarding-page.mock'
import { padDayLabels } from '@/lib/cycle-term-utils'
import { findFirstOverlappingPair } from '@/lib/bell-schedule-utils'
import type { AcademicTermsDto, CycleSettingsDto } from '@/types/cycle-term.types'
import type { BellScheduleDto } from '@/types/bell-schedule.types'
import type { TerminologyLabels } from '@/types/settings.types'
import { applyTemplateRequestSchema } from '@/types/template.schemas'
import type { AppliedTemplateSettings } from '@/types/template.types'

// In-memory store for terminology labels; reset between MSW server resets.
let currentLabels: TerminologyLabels = { ...mockTerminologyLabels }

let currentBellSchedule: BellScheduleDto = {
  periods: mockBellSchedule.periods.map((p) => ({ ...p })),
}

let currentCycle: CycleSettingsDto = {
  cycleLengthDays: mockCycleSettings.cycleLengthDays,
  dayLabels: padDayLabels(mockCycleSettings.dayLabels, mockCycleSettings.cycleLengthDays),
}

let currentAcademicTerms: AcademicTermsDto = {
  terms: mockAcademicTerms.terms.map((t) => ({ ...t })),
}

export function resetTerminologyLabels() {
  currentLabels = { ...mockTerminologyLabels }
}

export function resetBellScheduleMock() {
  currentBellSchedule = {
    periods: mockBellSchedule.periods.map((p) => ({ ...p })),
  }
}

export function resetCycleSettingsMock() {
  currentCycle = {
    cycleLengthDays: mockCycleSettings.cycleLengthDays,
    dayLabels: padDayLabels(mockCycleSettings.dayLabels, mockCycleSettings.cycleLengthDays),
  }
}

export function resetAcademicTermsMock() {
  currentAcademicTerms = {
    terms: mockAcademicTerms.terms.map((t) => ({ ...t })),
  }
}

/** Call in afterEach when using settingsHandlers in a shared MSW server. */
export function resetAllSettingsMocks() {
  resetTerminologyLabels()
  resetBellScheduleMock()
  resetCycleSettingsMock()
  resetAcademicTermsMock()
}

export const settingsHandlers = [
  http.get('/api/v1/settings/templates', () => {
    return HttpResponse.json(mockInstitutionTemplates)
  }),

  http.post('/api/v1/settings/apply-template', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }
    const parsed = applyTemplateRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid apply-template request.' },
        { status: 400 },
      )
    }
    const body = parsed.data
    const template = mockInstitutionTemplates.templates.find((t) => t.id === body.templateId)
    if (!template) {
      return HttpResponse.json(
        { status: 404, code: 'TEMPLATE_NOT_FOUND', message: 'Template not found.' },
        { status: 404 },
      )
    }

    const bellPeriodsRaw = mockTemplateBellSchedules[body.templateId] ?? []
    const cycleConfig = mockTemplateCycles[body.templateId]
    const terminologyOverrides = mockTemplateTerminologyOverrides[body.templateId] ?? {}

    // Apply bell schedule
    currentBellSchedule = {
      periods: bellPeriodsRaw.map((p, i) => ({
        id: `period-tpl-${i + 1}`,
        ...p,
      })),
    }

    // Apply cycle
    if (cycleConfig) {
      currentCycle = {
        cycleLengthDays: cycleConfig.cycleLengthDays,
        dayLabels: padDayLabels(cycleConfig.dayLabels, cycleConfig.cycleLengthDays),
      }
    }

    // Apply terminology
    currentLabels = { ...mockTerminologyLabels, ...terminologyOverrides } as TerminologyLabels

    const response: AppliedTemplateSettings = {
      templateId: template.id,
      templateName: template.name,
      bellSchedule: {
        periodsApplied: bellPeriodsRaw.length,
        firstPeriodStart: bellPeriodsRaw[0]?.startTime ?? '',
        lastPeriodEnd: bellPeriodsRaw[bellPeriodsRaw.length - 1]?.endTime ?? '',
      },
      cycle: {
        cycleLengthDays: cycleConfig?.cycleLengthDays ?? 5,
        cycleDescription: template.previewDetails.cycleDescription,
      },
      terminology: {
        overridesApplied: Object.keys(terminologyOverrides),
      },
    }

    return HttpResponse.json(response)
  }),


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

  http.get('/api/v1/settings/cycle', () => {
    return HttpResponse.json(currentCycle)
  }),

  http.put('/api/v1/settings/cycle', async ({ request }) => {
    const body = (await request.json()) as CycleSettingsDto
    if (body.dayLabels.length !== body.cycleLengthDays) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'CYCLE_LABEL_COUNT',
          message: `Day labels must match cycle length (${body.cycleLengthDays} positions).`,
        },
        { status: 400 },
      )
    }
    currentCycle = {
      cycleLengthDays: body.cycleLengthDays,
      dayLabels: padDayLabels(body.dayLabels, body.cycleLengthDays),
    }
    return HttpResponse.json(currentCycle)
  }),

  http.get('/api/v1/settings/academic-terms', () => {
    return HttpResponse.json(currentAcademicTerms)
  }),

  http.put('/api/v1/settings/academic-terms', async ({ request }) => {
    const body = (await request.json()) as AcademicTermsDto
    for (const t of body.terms) {
      if (t.endDate < t.startDate) {
        return HttpResponse.json(
          {
            status: 400,
            code: 'TERM_DATE_ORDER',
            message: 'End date must be on or after the start date.',
          },
          { status: 400 },
        )
      }
    }
    currentAcademicTerms = {
      terms: body.terms.map((t) => ({ ...t })),
    }
    return HttpResponse.json(currentAcademicTerms)
  }),
]
