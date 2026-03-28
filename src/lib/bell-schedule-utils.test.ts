import { describe, it, expect } from 'vitest'
import { findFirstOverlappingPair, parseTimeToMinutes, timeRangesOverlap } from '@/lib/bell-schedule-utils'
import type { BellPeriod } from '@/types/bell-schedule.types'

describe('parseTimeToMinutes', () => {
  it('parses valid HH:mm', () => {
    expect(parseTimeToMinutes('08:30')).toBe(8 * 60 + 30)
    expect(parseTimeToMinutes('00:00')).toBe(0)
    expect(parseTimeToMinutes('23:59')).toBe(23 * 60 + 59)
  })

  it('returns null for invalid input', () => {
    expect(parseTimeToMinutes('24:00')).toBeNull()
    expect(parseTimeToMinutes('12:60')).toBeNull()
    expect(parseTimeToMinutes('')).toBeNull()
  })
})

describe('timeRangesOverlap', () => {
  it('returns false when ranges only touch at boundary', () => {
    expect(timeRangesOverlap(60, 120, 120, 180)).toBe(false)
  })

  it('returns true when ranges overlap', () => {
    expect(timeRangesOverlap(60, 121, 120, 180)).toBe(true)
  })
})

describe('findFirstOverlappingPair', () => {
  const p = (id: string, name: string, start: string, end: string): BellPeriod => ({
    id,
    name,
    startTime: start,
    endTime: end,
  })

  it('returns null when no overlap', () => {
    const periods = [p('a', 'A', '08:00', '09:00'), p('b', 'B', '09:00', '10:00')]
    expect(findFirstOverlappingPair(periods)).toBeNull()
  })

  it('returns overlapping pair when ranges intersect', () => {
    const periods = [p('a', 'Morning', '08:00', '09:30'), p('b', 'Tutorial', '09:00', '09:15')]
    const result = findFirstOverlappingPair(periods)
    expect(result).not.toBeNull()
    expect(result?.periodA.name).toBe('Morning')
    expect(result?.periodB.name).toBe('Tutorial')
  })
})
