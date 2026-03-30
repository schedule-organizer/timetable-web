import { http, HttpResponse } from 'msw'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { mockClasses } from '@/mocks/fixtures/classes.fixtures'
import { mockRooms } from '@/mocks/fixtures/rooms.fixtures'
import { mockSubjects } from '@/mocks/fixtures/subjects.fixtures'
import { mockTeachers } from '@/mocks/fixtures/teachers.fixtures'
import { engineRunRequestSchema } from '@/types/engine.schemas'
import type { DraftScheduleDto } from '@/types/timetable-draft.types'
import type { EngineJobDto } from '@/types/engine.types'

type JobRecord = {
  termId: string
  pollCount: number
  cancelled: boolean
}

const jobs = new Map<string, JobRecord>()
const draftByTerm = new Map<string, DraftScheduleDto>()
let jobSeq = 0

const RUNNING_MESSAGES = [
  'Queued…',
  'Loading constraints…',
  'Placing 340 lessons…',
  'Resolving conflicts…',
  'Optimising…',
]

function buildDraft(termId: string): DraftScheduleDto {
  const lessons: DraftScheduleDto['lessons'] = []
  let n = 0
  const periods = mockBellSchedule.periods
  const cycleDays = mockCycleSettings.cycleLengthDays
  for (let d = 0; d < cycleDays; d++) {
    for (let p = 0; p < periods.length; p++) {
      const teacher = mockTeachers[n % mockTeachers.length]
      const klass = mockClasses[n % mockClasses.length]
      const subject = mockSubjects[n % mockSubjects.length]
      const room = mockRooms[n % mockRooms.length]
      n++
      lessons.push({
        id: `lesson-${termId}-${d}-${p}`,
        cycleDayIndex: d,
        periodId: periods[p].id,
        classId: klass.id,
        className: klass.name,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        roomId: room.id,
        roomName: room.name,
      })
    }
  }
  return {
    termId,
    generatedAt: new Date().toISOString(),
    lessons,
  }
}

const EMPTY_DRAFT: DraftScheduleDto = {
  termId: '',
  generatedAt: '1970-01-01T00:00:00.000Z',
  lessons: [],
}

export function resetEngineMocks() {
  jobs.clear()
  draftByTerm.clear()
  jobSeq = 0
}

export const engineHandlers = [
  http.get('/api/v1/timetable/draft', ({ request }) => {
    const url = new URL(request.url)
    const termId = url.searchParams.get('termId')
    if (!termId) {
      return HttpResponse.json(
        { status: 400, code: 'MISSING_TERM', message: 'termId is required.' },
        { status: 400 },
      )
    }
    const draft = draftByTerm.get(termId) ?? { ...EMPTY_DRAFT, termId }
    return HttpResponse.json(draft)
  }),

  http.post('/api/v1/engine/run', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }
    const parsed = engineRunRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid request body.' },
        { status: 400 },
      )
    }
    jobSeq += 1
    const jobId = `engine-job-${jobSeq}`
    jobs.set(jobId, { termId: parsed.data.termId, pollCount: 0, cancelled: false })
    return HttpResponse.json({ jobId })
  }),

  http.get('/api/v1/engine/jobs/:id', ({ params }) => {
    const id = params.id as string
    const rec = jobs.get(id)
    if (!rec) {
      return HttpResponse.json(
        { status: 404, code: 'JOB_NOT_FOUND', message: 'Job not found.' },
        { status: 404 },
      )
    }
    if (rec.cancelled) {
      const body: EngineJobDto = {
        id,
        status: 'cancelled',
        statusMessage: 'Cancelled',
      }
      return HttpResponse.json(body)
    }

    rec.pollCount += 1
    if (rec.pollCount <= RUNNING_MESSAGES.length) {
      const body: EngineJobDto = {
        id,
        status: 'running',
        statusMessage: RUNNING_MESSAGES[rec.pollCount - 1],
      }
      return HttpResponse.json(body)
    }

    const draft = buildDraft(rec.termId)
    draftByTerm.set(rec.termId, draft)
    const body: EngineJobDto = {
      id,
      status: 'succeeded',
      statusMessage: 'Done',
      result: draft,
    }
    return HttpResponse.json(body)
  }),

  http.delete('/api/v1/engine/jobs/:id', ({ params }) => {
    const id = params.id as string
    const rec = jobs.get(id)
    if (!rec) {
      return HttpResponse.json(
        { status: 404, code: 'JOB_NOT_FOUND', message: 'Job not found.' },
        { status: 404 },
      )
    }
    rec.cancelled = true
    return new HttpResponse(null, { status: 204 })
  }),
]
