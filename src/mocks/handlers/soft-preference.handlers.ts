import { http, HttpResponse } from 'msw'
import { mockSoftPreferences } from '@/mocks/fixtures/soft-preferences.fixtures'
import {
  createSoftPreferenceRequestSchema,
  updateSoftPreferenceRequestSchema,
} from '@/types/soft-preference.schemas'
import type { SoftPreferenceDto } from '@/types/soft-preference.types'

let preferences: SoftPreferenceDto[] = []
let idCounter = 0

export function resetSoftPreferenceMocks() {
  preferences = mockSoftPreferences.map((p) => ({ ...p }))
  idCounter = preferences.length
}

resetSoftPreferenceMocks()

function paginationInfo() {
  return {
    page: 0,
    size: preferences.length,
    totalElements: preferences.length,
    totalPages: 1,
  }
}

const parseJson = async (request: Request) => {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return HttpResponse.json(
      { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
      { status: 400 },
    )
  }
  return raw
}

export const softPreferenceHandlers = [
  http.get('/api/v1/constraints/soft', () =>
    HttpResponse.json({
      content: preferences,
      ...paginationInfo(),
    }),
  ),

  http.post('/api/v1/constraints/soft', async ({ request }) => {
    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createSoftPreferenceRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid soft preference payload.' },
        { status: 400 },
      )
    }

    const payload = parsed.data
    const now = new Date().toISOString()
    const created: SoftPreferenceDto = {
      id: `soft-preference-${++idCounter}`,
      name: payload.name,
      description: payload.description,
      weight: payload.weight,
      enabled: payload.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    }
    preferences = [...preferences, created]
    return HttpResponse.json(created)
  }),

  http.patch('/api/v1/constraints/soft/:id', async ({ params, request }) => {
    const existing = preferences.find((p) => p.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Soft preference not found.' },
        { status: 404 },
      )
    }

    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = updateSoftPreferenceRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid soft preference payload.' },
        { status: 400 },
      )
    }

    const body = parsed.data
    const nextDescription =
      body.description === undefined
        ? existing.description
        : body.description === null || body.description === ''
          ? undefined
          : body.description
    const updated: SoftPreferenceDto = {
      ...existing,
      name: body.name !== undefined ? body.name : existing.name,
      description: nextDescription,
      weight: body.weight !== undefined ? body.weight : existing.weight,
      enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
      updatedAt: new Date().toISOString(),
    }
    preferences = preferences.map((p) => (p.id === existing.id ? updated : p))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/v1/constraints/soft/:id', ({ params }) => {
    const existing = preferences.find((p) => p.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Soft preference not found.' },
        { status: 404 },
      )
    }
    preferences = preferences.filter((p) => p.id !== existing.id)
    return HttpResponse.json({ deletedId: existing.id })
  }),
]
