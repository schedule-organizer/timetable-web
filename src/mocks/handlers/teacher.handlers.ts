import { http, HttpResponse } from 'msw'
import { mockTeachers } from '@/mocks/fixtures/teachers.fixtures'
import {
  bulkImportTeachersRequestSchema,
  createTeacherRequestSchema,
} from '@/types/teacher.schemas'
import type { TeacherDto } from '@/types/teacher.types'

let teachers: TeacherDto[] = []
let idCounter = 0

export function resetTeacherMocks() {
  teachers = mockTeachers.map((teacher) => ({ ...teacher }))
  idCounter = teachers.length
}

resetTeacherMocks()

const TEACHER_LIMIT = 30

function emptyPaginationResponse() {
  return {
    page: 0,
    size: teachers.length,
    totalElements: teachers.length,
    totalPages: 1,
  }
}

export const teacherHandlers = [
  http.get('/api/v1/teachers', () => {
    return HttpResponse.json({
      content: teachers,
      ...emptyPaginationResponse(),
    })
  }),

  http.post('/api/v1/teachers', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const parsed = createTeacherRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid teacher data.' },
        { status: 400 },
      )
    }

    const newTeacher: TeacherDto = {
      id: `teacher-roster-${++idCounter}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...parsed.data,
    }

    teachers = [...teachers, newTeacher]

    return HttpResponse.json(newTeacher)
  }),

  http.post('/api/v1/teachers/import', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const parsed = bulkImportTeachersRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid teacher data.' },
        { status: 400 },
      )
    }

    const { teachers: incoming } = parsed.data
    const existingEmails = new Set(teachers.map((teacher) => teacher.email.toLowerCase()))
    const seenEmails = new Set<string>()
    const skipped: { email: string; reason: string }[] = []
    const toCreate: Array<typeof incoming[number]> = []

    for (const row of incoming) {
      const normalizedEmail = row.email.toLowerCase()

      if (seenEmails.has(normalizedEmail)) {
        skipped.push({ email: row.email, reason: 'Duplicate row in the file.' })
        continue
      }

      seenEmails.add(normalizedEmail)

      if (existingEmails.has(normalizedEmail)) {
        skipped.push({ email: row.email, reason: 'Teacher already exists.' })
        continue
      }

      toCreate.push(row)
    }

    if (teachers.length + toCreate.length > TEACHER_LIMIT) {
      const roomLeft = Math.max(TEACHER_LIMIT - teachers.length, 0)
      return HttpResponse.json(
        {
          status: 400,
          code: 'SUBSCRIPTION_LIMIT',
          message: `Import blocked — you can only add ${roomLeft} more teacher(s).`,
        },
        { status: 400 },
      )
    }

    const imported: TeacherDto[] = []

    for (const row of toCreate) {
      const now = new Date().toISOString()
      const teacher: TeacherDto = {
        id: `teacher-roster-${++idCounter}`,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        ...row,
      }
      teachers = [...teachers, teacher]
      imported.push(teacher)
    }

    return HttpResponse.json({
      imported,
      skipped,
      remainingQuota: Math.max(TEACHER_LIMIT - teachers.length, 0),
    })
  }),

  http.patch('/api/v1/teachers/:id', async ({ params, request }) => {
    const teacher = teachers.find((doc) => doc.id === params.id)
    if (!teacher) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Teacher not found.' },
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

    const parsed = createTeacherRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid teacher data.' },
        { status: 400 },
      )
    }

    const updatedTeacher: TeacherDto = {
      ...teacher,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    teachers = teachers.map((doc) => (doc.id === teacher.id ? updatedTeacher : doc))

    return HttpResponse.json(updatedTeacher)
  }),

  http.delete('/api/v1/teachers/:id', ({ params }) => {
    const teacher = teachers.find((doc) => doc.id === params.id)
    if (!teacher) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Teacher not found.' },
        { status: 404 },
      )
    }

    teachers = teachers.filter((doc) => doc.id !== teacher.id)

    return HttpResponse.json({ deletedId: teacher.id })
  }),
]
