import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import type { LessonDto, TimetableLessonsResponse } from '@/types/timetable.types'

export const MOCK_TIMETABLE_ID = 'timetable-mock-1'

const SUBJECT_COLORS: Record<string, string> = {
  'subject-1': '#3b82f6',
  'subject-2': '#10b981',
  'subject-3': '#f59e0b',
  'subject-4': '#ef4444',
  'subject-5': '#8b5cf6',
}

const MOCK_CLASSES = [
  { id: 'class-1', name: 'Year 7A', yearGroup: 'Year 7' },
  { id: 'class-2', name: 'Year 7B', yearGroup: 'Year 7' },
  { id: 'class-3', name: 'Year 8A', yearGroup: 'Year 8' },
  { id: 'class-4', name: 'Year 8B', yearGroup: 'Year 8' },
  { id: 'class-5', name: 'Year 9A', yearGroup: 'Year 9' },
  { id: 'class-6', name: 'Year 9B', yearGroup: 'Year 9' },
]

const MOCK_SUBJECTS = [
  { id: 'subject-1', name: 'Mathematics' },
  { id: 'subject-2', name: 'English' },
  { id: 'subject-3', name: 'Science' },
  { id: 'subject-4', name: 'History' },
  { id: 'subject-5', name: 'Art' },
]

const MOCK_TEACHERS = [
  { id: 'teacher-1', name: 'Alice Brown' },
  { id: 'teacher-2', name: 'Bob Smith' },
  { id: 'teacher-3', name: 'Carol Jones' },
  { id: 'teacher-4', name: 'David Lee' },
]

const MOCK_ROOMS = [
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

  for (const klass of MOCK_CLASSES) {
    for (let d = 0; d < cycleLengthDays; d++) {
      for (const period of periods) {
        // Leave ~15% of slots empty to simulate a realistic timetable
        if (n % 7 === 6) {
          n++
          continue
        }
        const subject = MOCK_SUBJECTS[n % MOCK_SUBJECTS.length]
        const teacher = MOCK_TEACHERS[n % MOCK_TEACHERS.length]
        const room = MOCK_ROOMS[n % MOCK_ROOMS.length]
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
 * Pinned lessons are returned unchanged (used for tests / future partial regen wiring).
 */
export function regenerateUnpinnedMockLessons(): void {
  liveLessons = liveLessons.map((l) => {
    if (l.isPinned) return l
    return { ...l, subjectName: `${l.subjectName} (regen)` }
  })
}
