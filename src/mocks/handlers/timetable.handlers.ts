import { http, HttpResponse } from 'msw'
import {
  createLessonInMock,
  deleteLessonFromMock,
  getMockTimetableLessonsResponse,
  MOCK_TIMETABLE_ID,
  moveLessonInMock,
  patchLessonInMock,
  regenerateUnpinnedMockLessons,
  setLessonPinnedInMock,
} from '@/mocks/pages/timetable-page.mock'
import {
  createLessonApiBodySchema,
  lessonMoveBodySchema,
  lessonPatchApiBodySchema,
} from '@/types/timetable.schemas'

export const timetableHandlers = [
  http.get('/api/v1/timetables/:id/lessons', ({ params }) => {
    const id = params.id as string
    if (id !== MOCK_TIMETABLE_ID) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Timetable not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(getMockTimetableLessonsResponse())
  }),

  http.post('/api/v1/lessons/:id/pin', ({ params }) => {
    const lessonId = params.id as string
    const ok = setLessonPinnedInMock(lessonId, true)
    if (!ok) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Lesson not found.' },
        { status: 404 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('/api/v1/lessons/:id/pin', ({ params }) => {
    const lessonId = params.id as string
    const ok = setLessonPinnedInMock(lessonId, false)
    if (!ok) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Lesson not found.' },
        { status: 404 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/v1/lessons/:id', async ({ params, request }) => {
    const lessonId = params.id as string
    const json: unknown = await request.json()
    const parsed = lessonPatchApiBodySchema.safeParse(json)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid lesson patch.' },
        { status: 400 },
      )
    }
    const { acceptConflict, ...patch } = parsed.data
    const result = patchLessonInMock(lessonId, patch, acceptConflict)
    if (!result.ok) {
      if (result.error === 'not_found') {
        return HttpResponse.json(
          { status: 404, code: 'NOT_FOUND', message: 'Lesson not found.' },
          { status: 404 },
        )
      }
      return HttpResponse.json(
        {
          status: 409,
          code: 'SCHEDULING_CONFLICT',
          message: 'This placement conflicts with an existing lesson.',
          details: result.conflict,
        },
        { status: 409 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('/api/v1/lessons/:id', ({ params }) => {
    const lessonId = params.id as string
    const ok = deleteLessonFromMock(lessonId)
    if (!ok) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Lesson not found.' },
        { status: 404 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/timetables/:id/lessons', async ({ params, request }) => {
    const id = params.id as string
    if (id !== MOCK_TIMETABLE_ID) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Timetable not found.' },
        { status: 404 },
      )
    }
    const json: unknown = await request.json()
    const parsed = createLessonApiBodySchema.safeParse(json)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid create lesson body.' },
        { status: 400 },
      )
    }
    const { acceptConflict, ...body } = parsed.data
    const result = createLessonInMock(body, acceptConflict)
    if (!result.ok) {
      if (result.error === 'occupied') {
        return HttpResponse.json(
          { status: 409, code: 'SLOT_OCCUPIED', message: 'That slot already has a lesson.' },
          { status: 409 },
        )
      }
      return HttpResponse.json(
        {
          status: 409,
          code: 'SCHEDULING_CONFLICT',
          message: 'This placement conflicts with an existing lesson.',
          details: result.conflict,
        },
        { status: 409 },
      )
    }
    return HttpResponse.json(result.lesson, { status: 201 })
  }),

  http.post('/api/v1/lessons/:id/move', async ({ params, request }) => {
    const lessonId = params.id as string
    const json: unknown = await request.json()
    const parsed = lessonMoveBodySchema.safeParse(json)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid move body.' },
        { status: 400 },
      )
    }
    const { view, targetRowKey, targetDayIndex, targetPeriodId } = parsed.data
    const result = moveLessonInMock(lessonId, view, targetRowKey, {
      dayIndex: targetDayIndex,
      periodId: targetPeriodId,
    })
    if (!result.ok) {
      if (result.error === 'not_found') {
        return HttpResponse.json(
          { status: 404, code: 'NOT_FOUND', message: 'Lesson not found.' },
          { status: 404 },
        )
      }
      return HttpResponse.json(
        {
          status: 422,
          code: 'PINNED_LESSON',
          message: 'Cannot move a pinned lesson. Unpin it first.',
        },
        { status: 422 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  /**
   * Mock-only: simulates re-run on unpinned slots only (pinned placements unchanged).
   * Not part of the public API contract; used for dev/tests until engine integration lands.
   */
  http.post('/api/v1/timetables/:id/regenerate-unpinned', ({ params }) => {
    const id = params.id as string
    if (id !== MOCK_TIMETABLE_ID) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Timetable not found.' },
        { status: 404 },
      )
    }
    regenerateUnpinnedMockLessons()
    return new HttpResponse(null, { status: 204 })
  }),
]
