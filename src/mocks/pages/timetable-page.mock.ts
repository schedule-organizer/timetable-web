import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { MOCK_CONSTRAINT_REPORT } from '@/mocks/handlers/engine.handlers'
import type { ConflictReportDto, ConstraintSatisfactionReport } from '@/types/engine.types'
import type {
  CreateLessonBody,
  LessonDto,
  LessonPatchBody,
  SchedulingAlternativeSlot,
  SchedulingConflictDetails,
  TimetableLessonsResponse,
  TimetableView,
} from '@/types/timetable.types'

export const MOCK_TIMETABLE_ID = 'timetable-mock-1'

const SUBJECT_COLORS: Record<string, string> = {
  'subject-1': '#3b82f6',
  'subject-2': '#10b981',
  'subject-3': '#f59e0b',
  'subject-4': '#ef4444',
  'subject-5': '#8b5cf6',
}

export const MOCK_ASSIGNMENT_CLASSES = [
  { id: 'class-1', name: 'Year 7A', yearGroup: 'Year 7' },
  { id: 'class-2', name: 'Year 7B', yearGroup: 'Year 7' },
  { id: 'class-3', name: 'Year 8A', yearGroup: 'Year 8' },
  { id: 'class-4', name: 'Year 8B', yearGroup: 'Year 8' },
  { id: 'class-5', name: 'Year 9A', yearGroup: 'Year 9' },
  { id: 'class-6', name: 'Year 9B', yearGroup: 'Year 9' },
]

export const MOCK_ASSIGNMENT_SUBJECTS = [
  { id: 'subject-1', name: 'Mathematics' },
  { id: 'subject-2', name: 'English' },
  { id: 'subject-3', name: 'Science' },
  { id: 'subject-4', name: 'History' },
  { id: 'subject-5', name: 'Art' },
]

export const MOCK_ASSIGNMENT_TEACHERS = [
  { id: 'teacher-1', name: 'Alice Brown' },
  { id: 'teacher-2', name: 'Bob Smith' },
  { id: 'teacher-3', name: 'Carol Jones' },
  { id: 'teacher-4', name: 'David Lee' },
]

export const MOCK_ASSIGNMENT_ROOMS = [
  { id: 'room-1', name: 'R101' },
  { id: 'room-2', name: 'R102' },
  { id: 'room-3', name: 'Lab 1' },
  { id: 'room-4', name: 'Art Room' },
]

export function buildMockTimetableLessons(): LessonDto[] {
  const lessons: LessonDto[] = []
  const { cycleLengthDays } = mockCycleSettings
  const { periods } = mockBellSchedule
  let n = 0

  for (const klass of MOCK_ASSIGNMENT_CLASSES) {
    for (let d = 0; d < cycleLengthDays; d++) {
      for (const period of periods) {
        // Leave ~15% of slots empty to simulate a realistic timetable
        if (n % 7 === 6) {
          n++
          continue
        }
        const subject = MOCK_ASSIGNMENT_SUBJECTS[n % MOCK_ASSIGNMENT_SUBJECTS.length]
        const teacher = MOCK_ASSIGNMENT_TEACHERS[n % MOCK_ASSIGNMENT_TEACHERS.length]
        const room = MOCK_ASSIGNMENT_ROOMS[n % MOCK_ASSIGNMENT_ROOMS.length]
        const isPinned = n % 11 === 0
        const hasConflict = n % 23 === 0

        lessons.push({
          id: `lesson-${klass.id}-${d}-${period.id}`,
          cycleDayIndex: d,
          periodId: period.id,
          classId: klass.id,
          className: klass.name,
          yearGroup: klass.yearGroup,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColorHex: SUBJECT_COLORS[subject.id] ?? '#6b7280',
          teacherId: teacher.id,
          teacherName: teacher.name,
          roomId: room.id,
          roomName: room.name,
          isPinned,
          hasConflict,
        })
        n++
      }
    }
  }

  return lessons
}

let liveLessons: LessonDto[] = buildMockTimetableLessons()

let regenerateUnpinnedMockMode: 'success' | 'failure' = 'success'

/** Toggle MSW outcome for POST /timetables/:id/regenerate-unpinned (tests only). */
export function setRegenerateUnpinnedMockMode(mode: 'success' | 'failure'): void {
  regenerateUnpinnedMockMode = mode
}

export function getRegenerateUnpinnedMockMode(): 'success' | 'failure' {
  return regenerateUnpinnedMockMode
}

/** Reset mutable mock lessons to the default generated set (call from tests between cases). */
export function resetMockTimetableLessons(): void {
  liveLessons = buildMockTimetableLessons()
}

export function getMockTimetableLessonsResponse(): TimetableLessonsResponse {
  return {
    timetableId: MOCK_TIMETABLE_ID,
    lessons: liveLessons.map((l) => ({ ...l })),
  }
}

/** Mock-only: flip pin state for MSW pin/unpin handlers. */
export function setLessonPinnedInMock(lessonId: string, pinned: boolean): boolean {
  const idx = liveLessons.findIndex((l) => l.id === lessonId)
  if (idx === -1) return false
  liveLessons[idx] = { ...liveLessons[idx], isPinned: pinned }
  return true
}

/**
 * Mock-only: simulates a generator pass that may change unpinned placements only.
 * Pinned lessons are returned unchanged. Satisfaction reflects the full timetable (pinned + unpinned).
 */
export function regenerateUnpinnedMockLessons(): ConstraintSatisfactionReport {
  liveLessons = liveLessons.map((l) => {
    if (l.isPinned) return l
    return { ...l, subjectName: `${l.subjectName} (regen)` }
  })
  return MOCK_CONSTRAINT_REPORT
}

/**
 * Conflict report scoped to unpinned placements that could not be satisfied (mock failure path).
 */
export function buildMockPartialRegenFailureReport(): ConflictReportDto {
  const unpinned = liveLessons.find((l) => !l.isPinned)
  const firstPeriodId = mockBellSchedule.periods[0]?.id ?? 'period-mock-1'
  const slots =
    unpinned !== undefined
      ? [
          { cycleDayIndex: unpinned.cycleDayIndex, periodId: unpinned.periodId },
          {
            cycleDayIndex: Math.min(
              unpinned.cycleDayIndex + 1,
              Math.max(0, mockCycleSettings.cycleLengthDays - 1),
            ),
            periodId: unpinned.periodId,
          },
        ]
      : [{ cycleDayIndex: 0, periodId: firstPeriodId }]

  return {
    conflicts: [
      {
        id: 'partial-regen-unpinned-scope',
        constraintId: 'unpinned-placements',
        constraintName: 'Unpinned slot assignments',
        explanation:
          'The solver could not assign the remaining unpinned lessons without clashing with pinned or manually approved slots.',
        affectedTeachers:
          unpinned !== undefined ? [{ id: unpinned.teacherId, name: unpinned.teacherName }] : [],
        affectedClasses:
          unpinned !== undefined ? [{ id: unpinned.classId, name: unpinned.className }] : [],
        affectedSlots: slots,
      },
    ],
  }
}

function findLessonAtCell(
  view: TimetableView,
  rowKey: string,
  dayIndex: number,
  periodId: string,
): LessonDto | undefined {
  return liveLessons.find((l) => {
    if (l.cycleDayIndex !== dayIndex || l.periodId !== periodId) return false
    if (view === 'class') return l.classId === rowKey
    if (view === 'teacher') return l.teacherId === rowKey
    return l.roomId === rowKey
  })
}

function findBlockingAtSlot(
  lessons: LessonDto[],
  excludeId: string | null,
  proposed: {
    classId: string
    teacherId: string
    roomId: string
    cycleDayIndex: number
    periodId: string
  },
): { reason: SchedulingConflictDetails['reason']; blockingLessonId: string } | null {
  const { classId, teacherId, roomId, cycleDayIndex, periodId } = proposed
  const classBlock = lessons.find(
    (l) =>
      (excludeId === null || l.id !== excludeId) &&
      l.classId === classId &&
      l.cycleDayIndex === cycleDayIndex &&
      l.periodId === periodId,
  )
  if (classBlock) return { reason: 'CLASS_SLOT_OCCUPIED', blockingLessonId: classBlock.id }

  const teacherBlock = lessons.find(
    (l) =>
      (excludeId === null || l.id !== excludeId) &&
      l.teacherId === teacherId &&
      l.cycleDayIndex === cycleDayIndex &&
      l.periodId === periodId,
  )
  if (teacherBlock) return { reason: 'TEACHER_DOUBLE_BOOKED', blockingLessonId: teacherBlock.id }

  const roomBlock = lessons.find(
    (l) =>
      (excludeId === null || l.id !== excludeId) &&
      l.roomId === roomId &&
      l.cycleDayIndex === cycleDayIndex &&
      l.periodId === periodId,
  )
  if (roomBlock) return { reason: 'ROOM_IN_USE', blockingLessonId: roomBlock.id }

  return null
}

function findAlternativeSlotsStrict(
  proposed: Pick<LessonDto, 'classId' | 'teacherId' | 'roomId' | 'cycleDayIndex' | 'periodId'>,
  excludeLessonId: string | null,
): SchedulingAlternativeSlot[] {
  const { cycleLengthDays } = mockCycleSettings
  const dayLabels = mockCycleSettings.dayLabels
  const periodIds = mockBellSchedule.periods.map((p) => p.id)
  const out: SchedulingAlternativeSlot[] = []

  for (let d = 0; d < cycleLengthDays; d++) {
    for (const periodId of periodIds) {
      if (d === proposed.cycleDayIndex && periodId === proposed.periodId) continue
      const block = findBlockingAtSlot(liveLessons, excludeLessonId, {
        classId: proposed.classId,
        teacherId: proposed.teacherId,
        roomId: proposed.roomId,
        cycleDayIndex: d,
        periodId,
      })
      if (block) continue
      const periodName = mockBellSchedule.periods.find((x) => x.id === periodId)?.name ?? periodId
      const dayLabel = dayLabels[d] ?? `Day ${d + 1}`
      out.push({ cycleDayIndex: d, periodId, summary: `${dayLabel} · ${periodName}` })
      if (out.length >= 3) return out
    }
  }
  return out
}

function findAlternativeSlotsRelaxed(
  proposed: Pick<LessonDto, 'classId' | 'cycleDayIndex' | 'periodId'>,
  excludeLessonId: string | null,
): SchedulingAlternativeSlot[] {
  const { cycleLengthDays } = mockCycleSettings
  const dayLabels = mockCycleSettings.dayLabels
  const periodIds = mockBellSchedule.periods.map((p) => p.id)
  const out: SchedulingAlternativeSlot[] = []

  for (let d = 0; d < cycleLengthDays; d++) {
    for (const periodId of periodIds) {
      if (d === proposed.cycleDayIndex && periodId === proposed.periodId) continue
      const occ = findLessonAtCell('class', proposed.classId, d, periodId)
      if (occ && (excludeLessonId === null || occ.id !== excludeLessonId)) continue
      const periodName = mockBellSchedule.periods.find((x) => x.id === periodId)?.name ?? periodId
      const dayLabel = dayLabels[d] ?? `Day ${d + 1}`
      out.push({ cycleDayIndex: d, periodId, summary: `${dayLabel} · ${periodName} (class free)` })
      if (out.length >= 3) return out
    }
  }
  return out
}

function ensureAlternatives(
  proposed: LessonDto,
  excludeLessonId: string | null,
): SchedulingAlternativeSlot[] {
  const strict = findAlternativeSlotsStrict(proposed, excludeLessonId)
  if (strict.length > 0) return strict
  const relaxed = findAlternativeSlotsRelaxed(proposed, excludeLessonId)
  if (relaxed.length > 0) return relaxed
  const first = mockBellSchedule.periods[0]
  const dayLabel = mockCycleSettings.dayLabels[0] ?? 'Day 1'
  return [
    {
      cycleDayIndex: 0,
      periodId: first.id,
      summary: `${dayLabel} · ${first.name}`,
    },
  ]
}

export type PatchLessonResult =
  | { ok: true }
  | { ok: false; error: 'not_found' }
  | { ok: false; conflict: SchedulingConflictDetails }

export type CreateLessonResult =
  | { ok: true; lesson: LessonDto }
  | { ok: false; error: 'occupied' }
  | { ok: false; conflict: SchedulingConflictDetails }

function placementForSwap(
  base: LessonDto,
  view: TimetableView,
  dayIndex: number,
  periodId: string,
  rowKey: string,
): Pick<LessonDto, 'cycleDayIndex' | 'periodId' | 'classId' | 'teacherId' | 'roomId'> {
  return {
    cycleDayIndex: dayIndex,
    periodId,
    classId: view === 'class' ? rowKey : base.classId,
    teacherId: view === 'teacher' ? rowKey : base.teacherId,
    roomId: view === 'room' ? rowKey : base.roomId,
  }
}

export function resolveLessonDisplayFields(lesson: LessonDto): LessonDto {
  const c = MOCK_ASSIGNMENT_CLASSES.find((x) => x.id === lesson.classId)
  const t = MOCK_ASSIGNMENT_TEACHERS.find((x) => x.id === lesson.teacherId)
  const r = MOCK_ASSIGNMENT_ROOMS.find((x) => x.id === lesson.roomId)
  const s = MOCK_ASSIGNMENT_SUBJECTS.find((x) => x.id === lesson.subjectId)
  return {
    ...lesson,
    className: c?.name ?? lesson.className,
    yearGroup: c?.yearGroup ?? lesson.yearGroup,
    teacherName: t?.name ?? lesson.teacherName,
    roomName: r?.name ?? lesson.roomName,
    subjectName: s?.name ?? lesson.subjectName,
    subjectColorHex: s ? (SUBJECT_COLORS[s.id] ?? '#6b7280') : lesson.subjectColorHex,
  }
}

export function patchLessonInMock(
  lessonId: string,
  patch: LessonPatchBody,
  acceptConflict?: boolean,
): PatchLessonResult {
  const idx = liveLessons.findIndex((l) => l.id === lessonId)
  if (idx === -1) return { ok: false, error: 'not_found' }
  const base = liveLessons[idx]
  const merged: LessonDto = { ...base, ...patch }
  const block = findBlockingAtSlot(liveLessons, lessonId, {
    classId: merged.classId,
    teacherId: merged.teacherId,
    roomId: merged.roomId,
    cycleDayIndex: merged.cycleDayIndex,
    periodId: merged.periodId,
  })

  if (block && !acceptConflict) {
    const alternatives = ensureAlternatives(merged, lessonId)
    return {
      ok: false,
      conflict: {
        reason: block.reason,
        conflictingLessonId: block.blockingLessonId,
        alternatives,
      },
    }
  }

  const hasConflict = Boolean(block && acceptConflict)
  liveLessons[idx] = resolveLessonDisplayFields({ ...merged, hasConflict })
  return { ok: true }
}

export function deleteLessonFromMock(lessonId: string): boolean {
  const idx = liveLessons.findIndex((l) => l.id === lessonId)
  if (idx === -1) return false
  liveLessons.splice(idx, 1)
  return true
}

export function createLessonInMock(
  body: CreateLessonBody,
  acceptConflict?: boolean,
): CreateLessonResult {
  const existing = findLessonAtCell('class', body.classId, body.cycleDayIndex, body.periodId)
  if (existing) return { ok: false, error: 'occupied' }

  const id = `lesson-created-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  const base: LessonDto = {
    id,
    cycleDayIndex: body.cycleDayIndex,
    periodId: body.periodId,
    classId: body.classId,
    className: '',
    yearGroup: '',
    subjectId: body.subjectId,
    subjectName: '',
    subjectColorHex: '#6b7280',
    teacherId: body.teacherId,
    teacherName: '',
    roomId: body.roomId,
    roomName: '',
    isPinned: false,
    hasConflict: false,
  }
  const merged = resolveLessonDisplayFields(base)
  const block = findBlockingAtSlot(liveLessons, null, {
    classId: merged.classId,
    teacherId: merged.teacherId,
    roomId: merged.roomId,
    cycleDayIndex: merged.cycleDayIndex,
    periodId: merged.periodId,
  })

  if (block && !acceptConflict) {
    const alternatives = ensureAlternatives(merged, null)
    return {
      ok: false,
      conflict: {
        reason: block.reason,
        conflictingLessonId: block.blockingLessonId,
        alternatives,
      },
    }
  }

  const hasConflict = Boolean(block && acceptConflict)
  const lesson = resolveLessonDisplayFields({ ...merged, hasConflict })
  liveLessons.push(lesson)
  return { ok: true, lesson }
}

export function moveLessonInMock(
  lessonId: string,
  view: TimetableView,
  targetRowKey: string,
  col: { dayIndex: number; periodId: string },
): { ok: true } | { ok: false; error: 'pinned' | 'not_found' } {
  const idx = liveLessons.findIndex((l) => l.id === lessonId)
  if (idx === -1) return { ok: false, error: 'not_found' }
  const L1 = liveLessons[idx]
  if (L1.isPinned) return { ok: false, error: 'pinned' }

  const L2 = findLessonAtCell(view, targetRowKey, col.dayIndex, col.periodId)
  const targetPlacement = placementForSwap(L1, view, col.dayIndex, col.periodId, targetRowKey)

  if (L2 && L2.id !== L1.id) {
    const sourceRowKey =
      view === 'class' ? L1.classId : view === 'teacher' ? L1.teacherId : L1.roomId
    const sourcePlacement = placementForSwap(L2, view, L1.cycleDayIndex, L1.periodId, sourceRowKey)
    const i2 = liveLessons.findIndex((l) => l.id === L2.id)
    liveLessons[idx] = resolveLessonDisplayFields({ ...L1, ...targetPlacement })
    liveLessons[i2] = resolveLessonDisplayFields({ ...L2, ...sourcePlacement })
  } else {
    liveLessons[idx] = resolveLessonDisplayFields({ ...L1, ...targetPlacement })
  }
  return { ok: true }
}
