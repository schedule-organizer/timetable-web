import { http, HttpResponse } from 'msw'
import { mockTimetableLessonsResponse } from '@/mocks/pages/timetable-page.mock'

export const timetableHandlers = [
  http.get('/api/v1/timetables/:id/lessons', ({ params }) => {
    const id = params.id as string
    if (id !== mockTimetableLessonsResponse.timetableId) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Timetable not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(mockTimetableLessonsResponse)
  }),
]
