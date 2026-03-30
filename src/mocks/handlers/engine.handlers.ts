import { http, HttpResponse } from 'msw'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { mockClasses } from '@/mocks/fixtures/classes.fixtures'
import { mockRooms } from '@/mocks/fixtures/rooms.fixtures'
import { mockSubjects } from '@/mocks/fixtures/subjects.fixtures'
import { mockTeachers } from '@/mocks/fixtures/teachers.fixtures'
import { engineRunRequestSchema } from '@/types/engine.schemas'
import type { DraftScheduleDto } from '@/types/timetable-draft.types'
import type { ConflictReportDto, ConstraintSatisfactionReport, EngineJobDto } from '@/types/engine.types'

type JobRecord = {
  termId: string
  pollCount: number
  cancelled: boolean
}

const jobs = new Map<string, JobRecord>()
const draftByTerm = new Map<string, DraftScheduleDto>()
let jobSeq = 0
let engineMockMode: 'success' | 'failure' = 'success'

/** Switch the mock engine outcome for the next (and all subsequent) jobs. */
export function setEngineMockMode(mode: 'success' | 'failure') {
  engineMockMode = mode
}

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

export const MOCK_CONSTRAINT_REPORT: ConstraintSatisfactionReport = {
  overallPercentage: 94,
  softFullySatisfied: 8,
  softPartiallySatisfied: 2,
  softNotSatisfied: 1,
  softPreferences: [
    { id: 'pref-1', name: 'Teacher preferred free periods', weight: 80, status: 'fully_satisfied' },
    { id: 'pref-2', name: 'No double-period subjects', weight: 60, status: 'fully_satisfied' },
    { id: 'pref-3', name: 'Spread subjects across week', weight: 70, status: 'fully_satisfied' },
    { id: 'pref-4', name: 'Avoid last-period high-difficulty', weight: 50, status: 'fully_satisfied' },
    { id: 'pref-5', name: 'Teacher morning preference', weight: 40, status: 'fully_satisfied' },
    { id: 'pref-6', name: 'Room capacity preference', weight: 30, status: 'fully_satisfied' },
    { id: 'pref-7', name: 'Consecutive free periods', weight: 20, status: 'fully_satisfied' },
    { id: 'pref-8', name: 'Lunch break protection', weight: 90, status: 'fully_satisfied' },
    { id: 'pref-9', name: 'Max 3 lessons per subject per day', weight: 75, status: 'partially_satisfied' },
    { id: 'pref-10', name: 'Balanced workload per day', weight: 65, status: 'partially_satisfied' },
    { id: 'pref-11', name: 'Preferred room type per subject', weight: 45, status: 'not_satisfied' },
  ],
  hardConstraints: [
    { id: 'hc-1', name: 'No teacher double-booking', satisfied: true },
    { id: 'hc-2', name: 'No room double-booking', satisfied: true },
    { id: 'hc-3', name: 'No class double-booking', satisfied: true },
    { id: 'hc-4', name: 'Teacher forbidden slots respected', satisfied: true },
    { id: 'hc-5', name: 'Minimum lessons per subject per term', satisfied: true },
  ],
}

export const MOCK_CONFLICT_REPORT_DATA: ConflictReportDto = {
  conflicts: [
    {
      id: 'conflict-1',
      constraintId: 'hc-4',
      constraintName: 'Teacher forbidden slots respected',
      explanation:
        'Jane Smith cannot cover Year 10B in any available slot because all valid windows overlap with her Forbidden Slot: Friday PM.',
      affectedTeachers: [{ id: 'teacher-2', name: 'Jane Smith' }],
      affectedClasses: [{ id: 'class-3', name: 'Year 10B' }],
      affectedSlots: [
        { cycleDayIndex: 4, periodId: 'period-3' },
        { cycleDayIndex: 4, periodId: 'period-4' },
      ],
    },
    {
      id: 'conflict-2',
      constraintId: 'hc-1',
      constraintName: 'No teacher double-booking',
      explanation:
        'David Brown is double-booked: Year 9A (Maths) and Year 11C (Maths) are both assigned to Monday Period 2 with no valid alternative slots.',
      affectedTeachers: [{ id: 'teacher-3', name: 'David Brown' }],
      affectedClasses: [
        { id: 'class-1', name: 'Year 9A' },
        { id: 'class-5', name: 'Year 11C' },
      ],
      affectedSlots: [{ cycleDayIndex: 0, periodId: 'period-2' }],
    },
  ],
}

export function resetEngineMocks() {
  jobs.clear()
  draftByTerm.clear()
  jobSeq = 0
  engineMockMode = 'success'
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

    if (engineMockMode === 'failure') {
      const body: EngineJobDto = {
        id,
        status: 'failed',
        statusMessage: 'Failed — hard constraint deadlock detected.',
        conflictReport: MOCK_CONFLICT_REPORT_DATA,
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
      constraintReport: MOCK_CONSTRAINT_REPORT,
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
