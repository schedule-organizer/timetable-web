import dayjs from 'dayjs'
import type { AcademicTermDto } from '@/types/cycle-term.types'

/** Trim or extend label array to match cycle length (empty strings for unnamed positions). */
export function padDayLabels(labels: string[], cycleLengthDays: number): string[] {
  const n = Math.max(0, cycleLengthDays)
  const out = labels.slice(0, n)
  while (out.length < n) out.push('')
  return out
}

export type TermStatus = 'upcoming' | 'active' | 'past'

/** Calendar-day status for a term row. Returns `null` if dates are not valid calendar days. */
export function getTermStatus(
  term: Pick<AcademicTermDto, 'startDate' | 'endDate'>,
  today: Date = new Date(),
): TermStatus | null {
  const t = dayjs(today).startOf('day')
  const start = dayjs(term.startDate).startOf('day')
  const end = dayjs(term.endDate).startOf('day')
  if (!start.isValid() || !end.isValid()) return null
  if (end.isBefore(t)) return 'past'
  if (start.isAfter(t)) return 'upcoming'
  return 'active'
}

export function sortTermsChronologically(terms: AcademicTermDto[]): AcademicTermDto[] {
  return [...terms].sort((a, b) => {
    const byStart = a.startDate.localeCompare(b.startDate)
    if (byStart !== 0) return byStart
    return a.name.localeCompare(b.name)
  })
}

/**
 * Returns the first term (chronological sort) that is active on `today`.
 * Overlapping date ranges are allowed; if more than one term is active on the same day,
 * this returns the first in sort order only.
 */
export function getActiveTerm(terms: AcademicTermDto[], today: Date = new Date()): AcademicTermDto | null {
  const sorted = sortTermsChronologically(terms)
  for (const term of sorted) {
    if (getTermStatus(term, today) === 'active') return term
  }
  return null
}

export function countInclusiveCalendarDays(startDate: string, endDate: string): number {
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).startOf('day')
  if (end.isBefore(start)) return 0
  return end.diff(start, 'day') + 1
}

/**
 * Total schedulable slot cells for the schedule generator: each calendar day in the active
 * term (inclusive) × periods per day. Cycle length defines the rotating day label index for
 * the engine; it does not change the count of physical period slots per calendar day.
 */
export function computeSchedulableSlots(input: {
  activeTerm: Pick<AcademicTermDto, 'startDate' | 'endDate'>
  periodsPerDay: number
  cycleLengthDays: number
}): number {
  if (input.cycleLengthDays < 1 || input.periodsPerDay < 1) return 0
  const days = countInclusiveCalendarDays(input.activeTerm.startDate, input.activeTerm.endDate)
  return days * input.periodsPerDay
}
