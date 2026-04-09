import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { parseSchedulingConflictDetails } from '@/lib/timetable-conflict'

describe('parseSchedulingConflictDetails', () => {
  it('returns details when payload matches SCHEDULING_CONFLICT', () => {
    const err = new axios.AxiosError('Conflict')
    err.response = {
      status: 409,
      data: {
        status: 409,
        code: 'SCHEDULING_CONFLICT',
        message: 'conflict',
        details: {
          reason: 'TEACHER_DOUBLE_BOOKED',
          conflictingLessonId: 'lesson-x',
          alternatives: [
            { cycleDayIndex: 1, periodId: 'period-mock-2', summary: 'Day B · Period 2' },
          ],
        },
      },
      headers: {},
      config: {} as never,
    },
    expect(parseSchedulingConflictDetails(err)).toEqual({
      reason: 'TEACHER_DOUBLE_BOOKED',
      conflictingLessonId: 'lesson-x',
      alternatives: [
        { cycleDayIndex: 1, periodId: 'period-mock-2', summary: 'Day B · Period 2' },
      ],
    })
  })

  it('returns null for other errors', () => {
    expect(parseSchedulingConflictDetails(new Error('fail'))).toBeNull()
  })
})
