import { http, HttpResponse } from 'msw'
import { mockHardConstraints } from '@/mocks/fixtures/hard-constraints.fixtures'
import {
  createHardConstraintRequestSchema,
  updateHardConstraintRequestSchema,
} from '@/types/hard-constraint.schemas'
import type { HardConstraintDto } from '@/types/hard-constraint.types'

let constraints: HardConstraintDto[] = []
let idCounter = 0

export function resetHardConstraintMocks() {
  constraints = mockHardConstraints.map((c) => ({ ...c }))
  idCounter = constraints.length
}

resetHardConstraintMocks()

function paginationInfo() {
  return {
    page: 0,
    size: constraints.length,
    totalElements: constraints.length,
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

export const hardConstraintHandlers = [
  http.get('/api/v1/constraints/hard', () =>
    HttpResponse.json({
      content: constraints,
      ...paginationInfo(),
    }),
  ),

  http.post('/api/v1/constraints/hard', async ({ request }) => {
    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createHardConstraintRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid hard constraint payload.' },
        { status: 400 },
      )
    }

    const payload = parsed.data
    if (constraints.some((c) => c.ruleType === payload.ruleType)) {
      return HttpResponse.json(
        {
          status: 409,
          code: 'DUPLICATE_RULE',
          message: 'This hard constraint is already defined for your institution.',
        },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()
    const created: HardConstraintDto = {
      id: `hard-constraint-${++idCounter}`,
      ruleType: payload.ruleType,
      description: payload.description,
      enabled: payload.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    }
    constraints = [...constraints, created]
    return HttpResponse.json(created)
  }),

  http.patch('/api/v1/constraints/hard/:id', async ({ params, request }) => {
    const existing = constraints.find((c) => c.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Hard constraint not found.' },
        { status: 404 },
      )
    }

    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = updateHardConstraintRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid hard constraint payload.' },
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
    const updated: HardConstraintDto = {
      ...existing,
      description: nextDescription,
      enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
      updatedAt: new Date().toISOString(),
    }
    constraints = constraints.map((c) => (c.id === existing.id ? updated : c))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/v1/constraints/hard/:id', ({ params }) => {
    const existing = constraints.find((c) => c.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Hard constraint not found.' },
        { status: 404 },
      )
    }
    constraints = constraints.filter((c) => c.id !== existing.id)
    return HttpResponse.json({ deletedId: existing.id })
  }),
]
