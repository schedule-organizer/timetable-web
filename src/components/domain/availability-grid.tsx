import { useCallback, useId, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import {
  getSlotState,
  nextAvailabilityState,
  setSlotState,
  slotKey,
} from '@/lib/availability-utils'
import { cn } from '@/lib/utils'
import type { AvailabilitySlotState } from '@/types/teacher-availability.types'

export interface AvailabilityGridProps {
  cycleLengthDays: number
  dayLabels: string[]
  periods: { id: string; name: string }[]
  value: Map<string, AvailabilitySlotState>
  onChange: (next: Map<string, AvailabilitySlotState>) => void
  disabled?: boolean
  /** Keys (cycleDayIndex:periodId) whose slots have been overridden by a timetabler. Renders a visual indicator on those cells. */
  overriddenKeys?: Set<string>
}

function cellBackground(state: AvailabilitySlotState): string {
  if (state === 'unavailable') return 'bg-[#fef2f2]'
  if (state === 'preferred') return 'bg-[#f0fdf4]'
  return 'bg-white'
}

function cellLabel(state: AvailabilitySlotState): string {
  if (state === 'unavailable') return 'Unavailable'
  if (state === 'preferred') return 'Preferred'
  return 'Available'
}

export function AvailabilityGrid({
  cycleLengthDays,
  dayLabels,
  periods,
  value,
  onChange,
  disabled = false,
  overriddenKeys,
}: AvailabilityGridProps) {
  const gridLabelId = useId()
  const touchStartRef = useRef<{ x: number; y: number; dayIndex: number } | null>(null)
  const cellRefs = useRef<(HTMLButtonElement | null)[][]>([])

  const [focusedDay, setFocusedDay] = useState(0)
  const [focusedPeriod, setFocusedPeriod] = useState(0)

  const dayCount = Math.max(0, cycleLengthDays)
  const periodCount = periods.length

  const dayLabel = useCallback(
    (dayIndex: number) => {
      const raw = dayLabels[dayIndex]?.trim()
      if (raw) return raw
      return `Day ${dayIndex + 1}`
    },
    [dayLabels],
  )

  const toggleCell = useCallback(
    (cycleDayIndex: number, periodId: string) => {
      if (disabled) return
      const current = getSlotState(value, cycleDayIndex, periodId)
      const next = nextAvailabilityState(current)
      onChange(setSlotState(value, cycleDayIndex, periodId, next))
    },
    [disabled, onChange, value],
  )

  const setRowState = useCallback(
    (cycleDayIndex: number, state: AvailabilitySlotState) => {
      if (disabled) return
      let next = new Map(value)
      for (const p of periods) {
        next = setSlotState(next, cycleDayIndex, p.id, state)
      }
      onChange(next)
    },
    [disabled, onChange, periods, value],
  )

  const handleRowTouchStart = (dayIndex: number) => (e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      dayIndex,
    }
  }

  const handleRowTouchEnd = (dayIndex: number) => (e: TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || start.dayIndex !== dayIndex) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const dx = endX - start.x
    const dy = endY - start.y
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) setRowState(dayIndex, 'unavailable')
    else setRowState(dayIndex, 'available')
  }

  const focusCell = useCallback((day: number, period: number) => {
    cellRefs.current[day]?.[period]?.focus()
  }, [])

  const handleCellKeyDown = useCallback(
    (day: number, period: number, periodId: string) => (e: KeyboardEvent) => {
      if (disabled) return
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        toggleCell(day, periodId)
        return
      }
      let nd = day
      let np = period
      if (e.key === 'ArrowRight') np = Math.min(periodCount - 1, period + 1)
      else if (e.key === 'ArrowLeft') np = Math.max(0, period - 1)
      else if (e.key === 'ArrowDown') nd = Math.min(dayCount - 1, day + 1)
      else if (e.key === 'ArrowUp') nd = Math.max(0, day - 1)
      else return
      e.preventDefault()
      focusCell(nd, np)
    },
    [dayCount, disabled, focusCell, periodCount, toggleCell],
  )

  if (dayCount === 0 || periodCount === 0) {
    return (
      <p className="text-sm text-[--color-text-secondary]" role="status">
        Bell schedule periods and cycle days are required to show availability.
      </p>
    )
  }

  const stickyCornerClass =
    'sticky left-0 z-[3] border border-[--color-border] bg-[--color-surface] px-2 py-2 text-left font-medium text-[--color-text-secondary]'
  const stickyRowClass =
    'sticky left-0 z-[2] border border-[--color-border] bg-[--color-surface] px-2 py-2 text-left font-medium text-[--color-text-primary]'

  return (
    <div className="overflow-x-auto">
      <table
        role="grid"
        aria-labelledby={gridLabelId}
        className="w-full min-w-[320px] table-fixed border-separate border-spacing-0 text-sm"
      >
        <caption id={gridLabelId} className="sr-only">
          Availability grid — tap a cell to cycle Available, Unavailable, and Preferred
        </caption>
        <colgroup>
          <col className="w-[8.5rem]" />
          {periods.map((p) => (
            <col key={p.id} className="min-w-[3rem]" />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-[--color-surface] text-[--color-text-secondary]">
            <th scope="col" className={stickyCornerClass}>
              Cycle day
            </th>
            {periods.map((p) => (
              <th
                key={p.id}
                scope="col"
                className="border border-[--color-border] px-2 py-2 text-center font-medium"
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: dayCount }, (_, dayIndex) => (
            <tr
              key={`cycle-day-${dayIndex}`}
              onTouchStart={handleRowTouchStart(dayIndex)}
              onTouchEnd={handleRowTouchEnd(dayIndex)}
            >
              <th scope="row" className={stickyRowClass}>
                {dayLabel(dayIndex)}
              </th>
              {periods.map((p, periodIndex) => {
                const state = getSlotState(value, dayIndex, p.id)
                const cellKey = slotKey(dayIndex, p.id)
                const isOverridden = overriddenKeys?.has(cellKey) ?? false
                return (
                  <td key={cellKey} role="gridcell" className="border border-[--color-border] p-0 align-top">
                    <button
                      type="button"
                      ref={(el) => {
                        if (!cellRefs.current[dayIndex]) cellRefs.current[dayIndex] = []
                        cellRefs.current[dayIndex][periodIndex] = el
                      }}
                      tabIndex={focusedDay === dayIndex && focusedPeriod === periodIndex ? 0 : -1}
                      disabled={disabled}
                      aria-label={`${dayLabel(dayIndex)}, ${p.name}, ${cellLabel(state)}${isOverridden ? ', overridden' : ''}`}
                      className={cn(
                        'relative flex h-12 w-full min-h-11 min-w-11 items-center justify-center border-0 transition-colors md:h-11 md:min-h-0 md:min-w-0',
                        cellBackground(state),
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[--color-border]',
                        disabled && 'cursor-not-allowed opacity-60',
                      )}
                      onClick={() => toggleCell(dayIndex, p.id)}
                      onFocus={() => {
                        setFocusedDay(dayIndex)
                        setFocusedPeriod(periodIndex)
                      }}
                      onKeyDown={handleCellKeyDown(dayIndex, periodIndex, p.id)}
                    >
                      {isOverridden && (
                        <span
                          aria-hidden="true"
                          className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-blue-500"
                        />
                      )}
                    </button>
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
