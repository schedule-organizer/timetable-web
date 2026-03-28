import { http, HttpResponse } from 'msw'
import { mockClasses } from '@/mocks/fixtures/classes.fixtures'
import { createClassRequestSchema } from '@/types/class.schemas'
import type { ClassDto, CreateClassRequest } from '@/types/class.types'

let classes: ClassDto[] = []
let idCounter = 0

export function resetClassMocks() {
  classes = mockClasses.map((klass) => ({ ...klass }))
  idCounter = classes.length
}

resetClassMocks()

const CLASS_LIMIT = 200

function paginationInfo() {
  return {
    page: 0,
    size: classes.length,
    totalElements: classes.length,
    totalPages: 1,
  }
}

export const classHandlers = [
  http.get('/api/v1/classes', () => {
    return HttpResponse.json({
      content: classes,
      ...paginationInfo(),
    })
  }),

  http.post('/api/v1/classes', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const parsed = createClassRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid class data.' },
        { status: 400 },
      )
    }

    if (classes.length >= CLASS_LIMIT) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'SUBSCRIPTION_LIMIT',
          message: 'Class roster limit reached.',
        },
        { status: 400 },
      )
    }

    const payload = parsed.data as CreateClassRequest
    const now = new Date().toISOString()
    const newClass: ClassDto = {
      id: `class-roster-${++idCounter}`,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      ...payload,
    }

    classes = [...classes, newClass]

    return HttpResponse.json(newClass)
  }),

  http.patch('/api/v1/classes/:id', async ({ params, request }) => {
    const klass = classes.find((doc) => doc.id === params.id)
    if (!klass) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Class not found.' },
        { status: 404 },
      )
    }

    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const parsed = createClassRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid class data.' },
        { status: 400 },
      )
    }

    const updatedClass: ClassDto = {
      ...klass,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    classes = classes.map((doc) => (doc.id === klass.id ? updatedClass : doc))

    return HttpResponse.json(updatedClass)
  }),

  http.delete('/api/v1/classes/:id', ({ params }) => {
    const klass = classes.find((doc) => doc.id === params.id)
    if (!klass) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Class not found.' },
        { status: 404 },
      )
    }

    classes = classes.filter((doc) => doc.id !== klass.id)

    return HttpResponse.json({ deletedId: klass.id })
  }),
]
