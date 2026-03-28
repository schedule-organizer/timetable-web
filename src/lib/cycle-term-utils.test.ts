import { describe, it, expect } from 'vitest'
import {
  computeSchedulableSlots,
  countInclusiveCalendarDays,
  getActiveTerm,
  getTermStatus,
  padDayLabels,
  sortTermsChronologically,
} from '@/lib/cycle-term-utils'
import type { AcademicTermDto } from '@/types/cycle-term.types'

describe('getTermStatus', () => {
  it('returns upcoming when today is before the start date', () => {
    expect(getTermStatus({ startDate: '2026-06-01', endDate: '2026-08-31' }, new Date('2026-05-01'))).toBe(
      'upcoming',
    )
  })

  it('returns active when today is within the range (inclusive)', () => {
    expect(getTermStatus({ startDate: '2026-06-01', endDate: '2026-08-31' }, new Date('2026-07-15'))).toBe(
      'active',
    )
  })

  it('returns active on the first and last day', () => {
    expect(getTermStatus({ startDate: '2026-06-01', endDate: '2026-08-31' }, new Date('2026-06-01'))).toBe(
      'active',
    )
    expect(getTermStatus({ startDate: '2026-06-01', endDate: '2026-08-31' }, new Date('2026-08-31'))).toBe(
      'active',
    )
  })

  it('returns past when today is after the end date', () => {
    expect(getTermStatus({ startDate: '2026-06-01', endDate: '2026-08-31' }, new Date('2026-09-01'))).toBe(
      'past',
    )
  })

  it('returns null when a date string is not a valid calendar day', () => {
    expect(getTermStatus({ startDate: 'not-a-date', endDate: '2026-08-31' }, new Date('2026-07-15'))).toBeNull()
  })
})

describe('sortTermsChronologically', () => {
  it('orders by start date then name', () => {
    const terms: AcademicTermDto[] = [
      { id: 'b', name: 'B', startDate: '2026-09-01', endDate: '2026-12-20' },
      { id: 'a', name: 'A', startDate: '2026-01-10', endDate: '2026-06-30' },
    ]
    expect(sortTermsChronologically(terms).map((t) => t.id)).toEqual(['a', 'b'])
  })
})

describe('getActiveTerm', () => {
  const terms: AcademicTermDto[] = [
    { id: 'past', name: 'Old', startDate: '2025-01-01', endDate: '2025-06-30' },
    { id: 'current', name: 'Now', startDate: '2026-03-01', endDate: '2026-12-20' },
  ]

  it('returns the term that contains today', () => {
    expect(getActiveTerm(terms, new Date('2026-04-01'))?.id).toBe('current')
  })

  it('returns null when no term is active', () => {
    expect(getActiveTerm(terms, new Date('2027-01-01'))).toBeNull()
  })
})

describe('padDayLabels', () => {
  it('pads with empty strings when labels are short', () => {
    expect(padDayLabels(['A'], 3)).toEqual(['A', '', ''])
  })

  it('trims when labels are long', () => {
    expect(padDayLabels(['A', 'B', 'C', 'D'], 2)).toEqual(['A', 'B'])
  })
})

describe('countInclusiveCalendarDays', () => {
  it('counts inclusive days on the same calendar day', () => {
    expect(countInclusiveCalendarDays('2026-01-05', '2026-01-05')).toBe(1)
  })

  it('counts inclusive range across months', () => {
    expect(countInclusiveCalendarDays('2026-01-01', '2026-01-05')).toBe(5)
  })

  it('returns 0 when end is before start', () => {
    expect(countInclusiveCalendarDays('2026-01-10', '2026-01-05')).toBe(0)
  })
})

describe('computeSchedulableSlots', () => {
  it('multiplies inclusive term days by periods per day when cycle is defined', () => {
    expect(
      computeSchedulableSlots({
        activeTerm: { startDate: '2026-01-01', endDate: '2026-01-05' },
        periodsPerDay: 3,
        cycleLengthDays: 5,
      }),
    ).toBe(15)
  })

  it('returns 0 when cycle length is invalid', () => {
    expect(
      computeSchedulableSlots({
        activeTerm: { startDate: '2026-01-01', endDate: '2026-01-05' },
        periodsPerDay: 3,
        cycleLengthDays: 0,
      }),
    ).toBe(0)
  })
})
