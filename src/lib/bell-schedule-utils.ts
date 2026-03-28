import type { BellPeriod } from '@/types/bell-schedule.types'

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Parses HH:mm to minutes from midnight; returns null if invalid. */
export function parseTimeToMinutes(time: string): number | null {
  const m = time.trim().match(TIME_RE)
  if (!m) return null
  return Number.parseInt(m[1], 10) * 60 + Number.parseInt(m[2], 10)
}

/** True when two half-open ranges [start, end) overlap (touching at boundary does not overlap). */
export function timeRangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA
}

export type OverlapPair = { periodA: BellPeriod; periodB: BellPeriod }

/** First overlapping pair found (by index order), or null if none. */
export function findFirstOverlappingPair(periods: BellPeriod[]): OverlapPair | null {
  const resolved = periods.map((p) => ({
    period: p,
    start: parseTimeToMinutes(p.startTime),
    end: parseTimeToMinutes(p.endTime),
  }))

  for (let i = 0; i < resolved.length; i++) {
    const a = resolved[i]
    if (a.start === null || a.end === null) continue
    if (a.end <= a.start) continue

    for (let j = i + 1; j < resolved.length; j++) {
      const b = resolved[j]
      if (b.start === null || b.end === null) continue
      if (b.end <= b.start) continue

      if (timeRangesOverlap(a.start, a.end, b.start, b.end)) {
        return { periodA: a.period, periodB: b.period }
      }
    }
  }
  return null
}
