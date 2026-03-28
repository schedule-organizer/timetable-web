import { http, HttpResponse } from 'msw'
import { mockTeachers } from '@/mocks/fixtures/teachers.fixtures'
import { createTeacherRequestSchema } from '@/types/teacher.schemas'
import type { TeacherDto } from '@/types/teacher.types'

let teachers: TeacherDto[] = []
let idCounter = 0

export function resetTeacherMocks() {
  teachers = mockTeachers.map((teacher) => ({ ...teacher }))
  idCounter = teachers.length
}

resetTeacherMocks()

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
