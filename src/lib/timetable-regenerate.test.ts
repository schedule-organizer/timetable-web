import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { parsePartialRegenUnsatisfiedDetails } from './timetable-regenerate'

describe('parsePartialRegenUnsatisfiedDetails', () => {
  it('returns null for non-axios errors', () => {
    expect(parsePartialRegenUnsatisfiedDetails(new Error('x'))).toBeNull()
  })

  it('returns null when status is not 422', () => {
    const err = new axios.AxiosError('bad')
    err.response = { status: 500, data: {} } as typeof err.response
    expect(parsePartialRegenUnsatisfiedDetails(err)).toBeNull()
  })

  it('parses conflict report from 422 details', () => {
    const err = new axios.AxiosError('unsatisfied')
    err.response = {
      status: 422,
      data: {
        details: {
          conflictReport: {
            conflicts: [
              {
                id: 'c1',
                constraintId: 'x',
                constraintName: 'Test',
                explanation: 'Unpinned portion failed.',
                affectedTeachers: [],
                affectedClasses: [],
                affectedSlots: [{ cycleDayIndex: 0, periodId: 'p1' }],
              },
            ],
          },
        },
      },
    } as typeof err.response
    const report = parsePartialRegenUnsatisfiedDetails(err)
    expect(report?.conflicts).toHaveLength(1)
    expect(report?.conflicts[0]?.id).toBe('c1')
  })
})
