import type { BellPeriod } from '@/types/bell-schedule.types'
import type { ConflictExplanationDto } from '@/types/engine.types'
import { padDayLabels } from '@/lib/cycle-term-utils'

/**
 * One-line concrete impact preview for UX-DR11 (derived from conflict entities + first affected slot).
 * Returns undefined when there are no affected slots to describe.
 */
export function buildRelaxationImpactPreviewLine(
  conflict: ConflictExplanationDto,
  dayLabels: string[],
  cycleLengthDays: number,
  periods: BellPeriod[],
): string | undefined {
  const slot = conflict.affectedSlots[0]
  if (!slot) return undefined

  const labels = padDayLabels(dayLabels, cycleLengthDays)
  const dayLabel = labels[slot.cycleDayIndex]?.trim() || `Day ${slot.cycleDayIndex + 1}`
  const periodName = periods.find((p) => p.id === slot.periodId)?.name ?? 'that period'

  const teacherName = conflict.affectedTeachers[0]?.name
  if (teacherName) {
    return `${dayLabel} ${periodName} may be assigned to ${teacherName} even when this constraint would otherwise forbid it.`
  }

  const className = conflict.affectedClasses[0]?.name
  if (className) {
    return `${dayLabel} ${periodName} may be used for ${className} when no fully valid slot exists.`
  }

  return `${dayLabel} ${periodName} may be used when no fully valid slot exists.`
}
