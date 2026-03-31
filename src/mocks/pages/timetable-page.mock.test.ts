import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildMockTimetableLessons,
  getMockTimetableLessonsResponse,
  moveLessonInMock,
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
