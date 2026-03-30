import { padDayLabels } from '@/lib/cycle-term-utils'
import type { BellPeriod } from '@/types/bell-schedule.types'
import type { DraftLessonSlot } from '@/types/timetable-draft.types'

export interface DraftTimetablePreviewProps {
  cycleLengthDays: number
  dayLabels: string[]
  periods: BellPeriod[]
  lessons: DraftLessonSlot[]
}

function lessonKey(day: number, periodId: string) {
  return `${day}:${periodId}`
}

/**
 * Read-only grid of draft placements (cycle day × period). Full TimetableGrid comes in Epic 5.
 */
export function DraftTimetablePreview({
  cycleLengthDays,
  dayLabels,
  periods,
  lessons,
}: DraftTimetablePreviewProps) {
  const labels = padDayLabels(dayLabels, cycleLengthDays)
  const bySlot = new Map<string, DraftLessonSlot>()
  for (const L of lessons) {
    bySlot.set(lessonKey(L.cycleDayIndex, L.periodId), L)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[--color-border] bg-[--color-surface]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">Draft timetable preview by cycle day and period</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-[1] border-b border-r border-[--color-border] bg-[--color-surface] px-3 py-2 font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Period
            </th>
            {labels.map((label, i) => (
              <th
                key={i}
                scope="col"
                className="border-b border-[--color-border] px-2 py-2 font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {label.trim() || `Day ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id}>
              <th
                scope="row"
                className="sticky left-0 z-[1] border-b border-r border-[--color-border] bg-[--color-surface] px-3 py-2 text-left font-normal whitespace-nowrap"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {period.name}
                </span>
                <span className="ml-2 text-xs">
                  {period.startTime}–{period.endTime}
                </span>
              </th>
              {Array.from({ length: cycleLengthDays }, (_, day) => {
                const cell = bySlot.get(lessonKey(day, period.id))
                return (
                  <td
                    key={lessonKey(day, period.id)}
                    className="border-b border-[--color-border] px-2 py-2 align-top"
                  >
                    {cell ? (
                      <div className="space-y-0.5">
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {cell.subjectName}
                        </div>
                        <div className="text-xs text-[--color-text-secondary]">
                          {cell.className} · {cell.teacherName} · {cell.roomName}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[--color-text-secondary]">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
