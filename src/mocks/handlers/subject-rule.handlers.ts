import { http, HttpResponse } from 'msw'
import { mockSubjectRules } from '@/mocks/fixtures/subject-rules.fixtures'
import {
  createSubjectRuleRequestSchema,
  updateSubjectRuleRequestSchema,
} from '@/types/subject-rule.schemas'
import type { SubjectRuleDto } from '@/types/subject-rule.types'

let rules: SubjectRuleDto[] = []
let idCounter = 0

export function resetSubjectRuleMocks() {
  rules = mockSubjectRules.map((r) => ({ ...r }))
  idCounter = rules.length
}

resetSubjectRuleMocks()

function paginationInfo() {
  return {
    page: 0,
    size: rules.length,
    totalElements: rules.length,
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

export const subjectRuleHandlers = [
  http.get('/api/v1/constraints/subject-rules', () =>
    HttpResponse.json({
      content: rules,
      ...paginationInfo(),
    }),
  ),

  http.post('/api/v1/constraints/subject-rules', async ({ request }) => {
    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createSubjectRuleRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid subject rule payload.' },
        { status: 400 },
      )
    }

    const payload = parsed.data
    const now = new Date().toISOString()
    const created: SubjectRuleDto = {
      id: `subject-rule-${++idCounter}`,
      name: payload.name,
      description: payload.description,
      constraintType: payload.constraintType,
      weight: payload.constraintType === 'soft' ? (payload.weight ?? 5) : undefined,
      enabled: payload.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    }
    rules = [...rules, created]
    return HttpResponse.json(created)
  }),

  http.patch('/api/v1/constraints/subject-rules/:id', async ({ params, request }) => {
    const existing = rules.find((r) => r.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Subject rule not found.' },
        { status: 404 },
      )
    }

    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = updateSubjectRuleRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid subject rule payload.' },
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
    const nextType = body.constraintType ?? existing.constraintType
    const nextWeight =
      nextType === 'hard'
        ? undefined
        : body.weight !== undefined
          ? body.weight
          : existing.weight ?? 5

    const updated: SubjectRuleDto = {
      ...existing,
      name: body.name !== undefined ? body.name : existing.name,
      description: nextDescription,
      constraintType: nextType,
      weight: nextWeight,
      enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
      updatedAt: new Date().toISOString(),
    }
    rules = rules.map((r) => (r.id === existing.id ? updated : r))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/v1/constraints/subject-rules/:id', ({ params }) => {
    const existing = rules.find((r) => r.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Subject rule not found.' },
        { status: 404 },
      )
    }
    rules = rules.filter((r) => r.id !== existing.id)
    return HttpResponse.json({ deletedId: existing.id })
  }),
]
