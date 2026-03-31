import { http, HttpResponse } from 'msw'
import {
  getMockTimetableLessonsResponse,
  MOCK_TIMETABLE_ID,
  regenerateUnpinnedMockLessons,
  setLessonPinnedInMock,
} from '@/mocks/pages/timetable-page.mock'

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
