import { http, HttpResponse } from 'msw'
import { mockSubjects } from '@/mocks/fixtures/subjects.fixtures'
import { createSubjectRequestSchema } from '@/types/subject.schemas'
import type { CreateSubjectRequest, SubjectDto } from '@/types/subject.types'

let subjects: SubjectDto[] = []
let idCounter = 0

export function resetSubjectMocks() {
  subjects = mockSubjects.map((subject) => ({ ...subject }))
  idCounter = subjects.length
}

resetSubjectMocks()

const SUBJECT_LIMIT = 200

const paginationInfo = () => ({
  page: 0,
  size: subjects.length,
  totalElements: subjects.length,
  totalPages: 1,
})

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

export const subjectHandlers = [
  http.get('/api/v1/subjects', () =>
    HttpResponse.json({
      content: subjects,
      ...paginationInfo(),
    }),
  ),

  http.post('/api/v1/subjects', async ({ request }) => {
    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createSubjectRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid subject details.' },
        { status: 400 },
      )
    }

    if (subjects.length >= SUBJECT_LIMIT) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'SUBSCRIPTION_LIMIT',
          message: 'Subject catalog limit reached.',
        },
        { status: 400 },
      )
    }

    const payload = parsed.data as CreateSubjectRequest
    const now = new Date().toISOString()
    const newSubject: SubjectDto = {
      id: `subject-${++idCounter}`,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      ...payload,
    }

    subjects = [...subjects, newSubject]

    return HttpResponse.json(newSubject)
  }),

  http.patch('/api/v1/subjects/:id', async ({ params, request }) => {
    const subject = subjects.find((doc) => doc.id === params.id)
    if (!subject) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Subject not found.' },
        { status: 404 },
      )
    }

    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createSubjectRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid subject details.' },
        { status: 400 },
      )
    }

    const updatedSubject: SubjectDto = {
      ...subject,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    subjects = subjects.map((doc) => (doc.id === subject.id ? updatedSubject : doc))

    return HttpResponse.json(updatedSubject)
  }),
]
