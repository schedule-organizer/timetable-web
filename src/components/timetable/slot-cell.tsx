import { forwardRef } from 'react'
import type { LessonDto } from '@/types/timetable.types'
import { MiniSlot } from '@/components/timetable/mini-slot'

export interface SlotCellProps {
  lesson: LessonDto | undefined
  ariaLabel: string
  tabIndex: number
  isSelected: boolean
  style?: React.CSSProperties
  onFocus: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  /** Right-click on filled or empty cell (Story 5.3). */
  onSlotContextMenu?: (e: React.MouseEvent, lesson: LessonDto | null) => void
  /** Optional replacement for default MiniSlot (e.g. drag handle). */
  slotContent?: React.ReactNode
}

export const SlotCell = forwardRef<HTMLDivElement, SlotCellProps>(
  function SlotCell(
    {
      lesson,
      ariaLabel,
      tabIndex,
      isSelected,
      style: extStyle,
      onFocus,
      onKeyDown,
      onSlotContextMenu,
      slotContent,
    },
    ref,
  ) {
    const hasConflict = lesson?.hasConflict ?? false

    return (
      <div
        ref={ref}
        role="gridcell"
        tabIndex={tabIndex}
        aria-selected={isSelected}
        aria-label={ariaLabel}
        data-conflict={hasConflict ? 'true' : undefined}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onContextMenu={
          onSlotContextMenu
            ? (e) => {
                e.preventDefault()
                onSlotContextMenu(e, lesson ?? null)
              }
            : undefined
        }
        className="relative min-h-[52px] border-b border-r border-[--color-border] p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a78d3] focus-visible:ring-inset"
        style={{
          ...extStyle,
          borderTop: hasConflict ? '2px solid #c0392b' : undefined,
          backgroundColor: hasConflict ? '#fef2f2' : undefined,
        }}
      >
        {lesson ? (
          <>
            {slotContent ?? <MiniSlot lesson={lesson} size="sm" />}
            {hasConflict && (
              <span
                aria-hidden="true"
                className="absolute top-0.5 right-0.5 text-[9px] font-semibold leading-none"
                style={{ color: '#c0392b' }}
              >
                ⚠ Conflict
              </span>
            )}
          </>
        ) : null}
      </div>
    )
  },
)
