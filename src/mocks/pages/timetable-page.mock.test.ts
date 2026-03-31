import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildMockTimetableLessons,
  getMockTimetableLessonsResponse,
  moveLessonInMock,
  patchLessonInMock,
  regenerateUnpinnedMockLessons,
  resetMockTimetableLessons,
  setLessonPinnedInMock,
} from './timetable-page.mock'

describe('timetable-page.mock', () => {
  beforeEach(() => {
    resetMockTimetableLessons()
  })

  it('setLessonPinnedInMock toggles pin state returned by getMockTimetableLessonsResponse', () => {
    const before = getMockTimetableLessonsResponse().lessons.find((l) => !l.isPinned)
    expect(before).toBeDefined()
    const id = before!.id
    expect(setLessonPinnedInMock(id, true)).toBe(true)
    const after = getMockTimetableLessonsResponse().lessons.find((l) => l.id === id)
    expect(after?.isPinned).toBe(true)
  })

  it('regenerateUnpinnedMockLessons leaves pinned lessons unchanged', () => {
    const lessons = buildMockTimetableLessons()
    const pinned = lessons.find((l) => l.isPinned)
    expect(pinned).toBeDefined()
    const snapshot = { ...pinned! }

    regenerateUnpinnedMockLessons()

    const after = getMockTimetableLessonsResponse().lessons.find((l) => l.id === snapshot.id)
    expect(after).toEqual(snapshot)
  })

  it('moveLessonInMock returns pinned error when moving a pinned lesson', () => {
    const pinned = getMockTimetableLessonsResponse().lessons.find((l) => l.isPinned)
    expect(pinned).toBeDefined()
    const result = moveLessonInMock(pinned!.id, 'class', 'class-2', {
      dayIndex: 0,
      periodId: 'period-mock-2',
    })
    expect(result).toEqual({ ok: false, error: 'pinned' })
  })

  it('patchLessonInMock returns scheduling conflict when teacher is double-booked', () => {
    resetMockTimetableLessons()
    const lessons = getMockTimetableLessonsResponse().lessons
    const a = lessons.find((l) => l.cycleDayIndex === 0 && l.periodId === 'period-mock-1')
    const b = lessons.find(
      (l) =>
        l.id !== a!.id &&
        l.cycleDayIndex === 0 &&
        l.periodId === 'period-mock-1' &&
        l.teacherId !== a!.teacherId,
    )
    expect(a).toBeDefined()
    expect(b).toBeDefined()

    const result = patchLessonInMock(b!.id, { teacherId: a!.teacherId })
    expect(result.ok).toBe(false)
    if (!result.ok && 'conflict' in result) {
      expect(result.conflict.reason).toBe('TEACHER_DOUBLE_BOOKED')
      expect(result.conflict.alternatives.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('patchLessonInMock applies conflicting placement when acceptConflict is true', () => {
    resetMockTimetableLessons()
    const lessons = getMockTimetableLessonsResponse().lessons
    const a = lessons.find((l) => l.cycleDayIndex === 0 && l.periodId === 'period-mock-1')
    const b = lessons.find(
      (l) =>
        l.id !== a!.id &&
        l.cycleDayIndex === 0 &&
        l.periodId === 'period-mock-1' &&
        l.teacherId !== a!.teacherId,
    )
    expect(a).toBeDefined()
    expect(b).toBeDefined()

    const result = patchLessonInMock(b!.id, { teacherId: a!.teacherId }, true)
    expect(result).toEqual({ ok: true })
    const updated = getMockTimetableLessonsResponse().lessons.find((l) => l.id === b!.id)
    expect(updated?.teacherId).toBe(a!.teacherId)
    expect(updated?.hasConflict).toBe(true)
  })

  it('regenerateUnpinnedMockLessons mutates unpinned lesson content', () => {
    const before = getMockTimetableLessonsResponse().lessons.find((l) => !l.isPinned)
    expect(before).toBeDefined()
    const id = before!.id
    const originalName = before!.subjectName

    regenerateUnpinnedMockLessons()

    const after = getMockTimetableLessonsResponse().lessons.find((l) => l.id === id)
    expect(after?.subjectName).not.toBe(originalName)
    expect(after?.subjectName).toContain('(regen)')
  })
})
