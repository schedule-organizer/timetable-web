import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { DraggableMiniSlot } from '@/components/timetable/draggable-mini-slot'
import { MiniSlot } from '@/components/timetable/mini-slot'
import { SlotCell } from '@/components/timetable/slot-cell'
import { SlotContextMenu } from '@/components/timetable/slot-context-menu'
import type { BellPeriod } from '@/types/bell-schedule.types'
import type { GridColumn, GridRow, LessonDto, TimetableView } from '@/types/timetable.types'

export type SlotMenuAction = 'assign' | 'clear' | 'viewDetail'

export interface TimetableGridProps {
  lessons: LessonDto[]
  view: TimetableView
  cycleLengthDays: number
  dayLabels: string[]
  periods: BellPeriod[]
  yearGroupFilter?: string | null
  isLoading?: boolean
  /** Space: toggles pin (parent decides pin vs unpin). */
  onSlotPin?: (lessonId: string) => void
  /** Context menu: explicit pin (not a toggle). */
  onPinSlot?: (lessonId: string) => void
  /** Context menu: explicit unpin. */
  onUnpinSlot?: (lessonId: string) => void
  /** Enter: open slot sheet (filled or empty). */
  onSlotOpen?: (payload: { lesson: LessonDto | null; rowKey: string; col: GridColumn }) => void
  /** Context menu: assign / clear / view detail (Story 5.3). */
  onSlotMenu?: (detail: {
    action: SlotMenuAction
    lesson: LessonDto | null
    rowKey: string
    col: GridColumn
  }) => void
  /** Drag-and-drop move (swap if target occupied; blocked for pinned sources in grid). */
  onLessonMove?: (detail: { lessonId: string; targetRowKey: string; col: GridColumn }) => void
}

function buildColumns(cycleLengthDays: number, dayLabels: string[], periods: BellPeriod[]): GridColumn[] {
  const cols: GridColumn[] = []
  for (let d = 0; d < cycleLengthDays; d++) {
    const dayLabel = dayLabels[d] ?? `Day ${d + 1}`
    for (const period of periods) {
      cols.push({
        key: `${d}-${period.id}`,
        dayIndex: d,
        dayLabel,
        periodId: period.id,
        periodName: period.name,
      })
    }
  }
  return cols
}

function buildClassRows(lessons: LessonDto[], yearGroupFilter: string | null | undefined): GridRow[] {
  const seen = new Map<string, GridRow>()
  for (const l of lessons) {
    if (yearGroupFilter && l.yearGroup !== yearGroupFilter) continue
    if (!seen.has(l.classId)) {
      seen.set(l.classId, { key: l.classId, label: l.className, groupLabel: l.yearGroup })
    }
  }
  return Array.from(seen.values()).sort((a, b) => {
    const g = (a.groupLabel ?? '').localeCompare(b.groupLabel ?? '')
    return g !== 0 ? g : a.label.localeCompare(b.label)
  })
}

function buildTeacherRows(lessons: LessonDto[], yearGroupFilter: string | null | undefined): GridRow[] {
  const seen = new Map<string, GridRow>()
  for (const l of lessons) {
    if (yearGroupFilter && l.yearGroup !== yearGroupFilter) continue
    if (!seen.has(l.teacherId)) {
      seen.set(l.teacherId, { key: l.teacherId, label: l.teacherName })
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function buildRoomRows(lessons: LessonDto[], yearGroupFilter: string | null | undefined): GridRow[] {
  const seen = new Map<string, GridRow>()
  for (const l of lessons) {
    if (yearGroupFilter && l.yearGroup !== yearGroupFilter) continue
    if (!seen.has(l.roomId)) {
      seen.set(l.roomId, { key: l.roomId, label: l.roomName })
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function buildCellKey(view: TimetableView, rowKey: string, col: GridColumn): string {
  return `${view}-${rowKey}-${col.key}`
}

function findLesson(
  lessons: LessonDto[],
  view: TimetableView,
  rowKey: string,
  col: GridColumn,
): LessonDto | undefined {
  return lessons.find((l) => {
    if (l.cycleDayIndex !== col.dayIndex || l.periodId !== col.periodId) return false
    if (view === 'class') return l.classId === rowKey
    if (view === 'teacher') return l.teacherId === rowKey
    if (view === 'room') return l.roomId === rowKey
    return false
  })
}

const SKELETON_ROW_COUNT = 6

function TimetableSlotCell({
  rowIdx,
  colIdx,
  lessons,
  view,
  row,
  col,
  cellRefs,
  focusedCell,
  selectedCell,
  onFocusCell,
  onKeyDownCell,
  onSlotContextMenu,
  COL_MIN_WIDTH,
}: {
  rowIdx: number
  colIdx: number
  lessons: LessonDto[]
  view: TimetableView
  row: GridRow
  col: GridColumn
  cellRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  focusedCell: { row: number; col: number }
  selectedCell: { row: number; col: number } | null
  onFocusCell: (row: number, col: number) => void
  onKeyDownCell: (e: React.KeyboardEvent<HTMLDivElement>, rowIdx: number, colIdx: number) => void
  onSlotContextMenu?: (e: React.MouseEvent, lesson: LessonDto | null, rowKey: string, col: GridColumn) => void
  COL_MIN_WIDTH: number
}) {
  const { setNodeRef } = useDroppable({ id: `cell-${rowIdx}-${colIdx}` })
  const lesson = findLesson(lessons, view, row.key, col)
  const isFocused = focusedCell.row === rowIdx && focusedCell.col === colIdx
  const isSelected =
    selectedCell !== null && selectedCell.row === rowIdx && selectedCell.col === colIdx

  const cellAriaLabel = lesson
    ? `${row.label} ${col.dayLabel} ${col.periodName} — ${lesson.subjectName} ${lesson.teacherName} ${lesson.roomName}${lesson.isPinned ? ' (pinned)' : ''}${lesson.hasConflict ? ' (conflict)' : ''}`
    : `${row.label} ${col.dayLabel} ${col.periodName} — Empty`

  const refKey = `${rowIdx}-${colIdx}`

  return (
    <SlotCell
      ref={(el) => {
        setNodeRef(el)
        if (el) cellRefs.current.set(refKey, el)
        else cellRefs.current.delete(refKey)
      }}
      lesson={lesson}
      ariaLabel={cellAriaLabel}
      tabIndex={isFocused ? 0 : -1}
      isSelected={isSelected}
      style={{ width: COL_MIN_WIDTH, minWidth: COL_MIN_WIDTH }}
      onFocus={() => onFocusCell(rowIdx, colIdx)}
      onKeyDown={(e) => onKeyDownCell(e, rowIdx, colIdx)}
      onSlotContextMenu={
        onSlotContextMenu
          ? (e, le) => onSlotContextMenu(e, le, row.key, col)
          : undefined
      }
      slotContent={lesson ? <DraggableMiniSlot lesson={lesson} /> : undefined}
    />
  )
}

/** Grid cells in scope for the solver minus pinned lessons (UX-DR9 / Story 5.2). */
export function countUnpinnedSlotsForSolver(
  lessons: LessonDto[],
  view: TimetableView,
  yearGroupFilter: string | null | undefined,
  cycleLengthDays: number,
  dayLabels: string[],
  periods: BellPeriod[],
): number {
  const columns = buildColumns(cycleLengthDays, dayLabels, periods)
  const rows =
    view === 'class'
      ? buildClassRows(lessons, yearGroupFilter)
      : view === 'teacher'
        ? buildTeacherRows(lessons, yearGroupFilter)
        : buildRoomRows(lessons, yearGroupFilter)
  if (rows.length === 0 || columns.length === 0) return 0
  const totalCells = rows.length * columns.length
  let pinnedCellsInGrid = 0
  for (const row of rows) {
    for (const col of columns) {
      const lesson = findLesson(lessons, view, row.key, col)
      if (lesson?.isPinned) pinnedCellsInGrid++
    }
  }
  return Math.max(0, totalCells - pinnedCellsInGrid)
}

export function TimetableGrid({
  lessons,
  view,
  cycleLengthDays,
  dayLabels,
  periods,
  yearGroupFilter,
  isLoading = false,
  onSlotPin,
  onPinSlot,
  onUnpinSlot,
  onSlotOpen,
  onSlotMenu,
  onLessonMove,
}: TimetableGridProps) {
  const columns = useMemo(
    () => buildColumns(cycleLengthDays, dayLabels, periods),
    [cycleLengthDays, dayLabels, periods],
  )

  const rows = useMemo(() => {
    if (view === 'class') return buildClassRows(lessons, yearGroupFilter)
    if (view === 'teacher') return buildTeacherRows(lessons, yearGroupFilter)
    return buildRoomRows(lessons, yearGroupFilter)
  }, [lessons, view, yearGroupFilter])

  // Focused cell state for roving tabIndex
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 })
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [slotContextMenu, setSlotContextMenu] = useState<{
    lesson: LessonDto | null
    rowKey: string
    col: GridColumn
    x: number
    y: number
  } | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  /** Menu can open when slot actions exist, with or without pin API (pin items no-op if absent). */
  const menuEnabled = Boolean((onPinSlot && onUnpinSlot) || onSlotMenu)

  // Ref grid for imperative focus management
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const moveFocus = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (rows.length === 0 || columns.length === 0) return
      const clampedRow = Math.max(0, Math.min(rows.length - 1, rowIdx))
      const clampedCol = Math.max(0, Math.min(columns.length - 1, colIdx))
      setFocusedCell({ row: clampedRow, col: clampedCol })
      const key = `${clampedRow}-${clampedCol}`
      cellRefs.current.get(key)?.focus()
    },
    [rows.length, columns.length],
  )

  // Stable ref so handleCellKeyDown always calls the latest moveFocus without
  // becoming stale during rapid view/filter transitions
  const moveFocusRef = useRef(moveFocus)
  useEffect(() => {
    moveFocusRef.current = moveFocus
  }, [moveFocus])

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, rowIdx: number, colIdx: number) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          moveFocusRef.current(rowIdx, colIdx + 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveFocusRef.current(rowIdx, colIdx - 1)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveFocusRef.current(rowIdx + 1, colIdx)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveFocusRef.current(rowIdx - 1, colIdx)
          break
        case ' ': {
          e.preventDefault()
          const row = rows[rowIdx]
          const col = columns[colIdx]
          if (row && col) {
            const lesson = findLesson(lessons, view, row.key, col)
            if (lesson) onSlotPin?.(lesson.id)
          }
          break
        }
        case 'Enter': {
          e.preventDefault()
          const row = rows[rowIdx]
          const col = columns[colIdx]
          if (row && col) {
            const lesson = findLesson(lessons, view, row.key, col)
            setSelectedCell({ row: rowIdx, col: colIdx })
            onSlotOpen?.({ lesson: lesson ?? null, rowKey: row.key, col })
          }
          break
        }
        case 'F10': {
          if (e.shiftKey) {
            e.preventDefault()
            const row = rows[rowIdx]
            const col = columns[colIdx]
            if (!row || !col) break
            if (!menuEnabled) break
            const le = findLesson(lessons, view, row.key, col)
            const el = cellRefs.current.get(`${rowIdx}-${colIdx}`)
            const rect = el?.getBoundingClientRect()
            const x = rect ? rect.left + rect.width / 2 : 0
            const y = rect ? rect.top + rect.height / 2 : 0
            setSlotContextMenu({ lesson: le ?? null, rowKey: row.key, col, x, y })
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          setSelectedCell(null)
          break
      }
    },
    [rows, columns, lessons, view, onSlotPin, onSlotOpen, menuEnabled],
  )

  // Keep focusedCell in bounds when rows/columns change
  useEffect(() => {
    setFocusedCell((prev) => ({
      row: Math.min(prev.row, Math.max(0, rows.length - 1)),
      col: Math.min(prev.col, Math.max(0, columns.length - 1)),
    }))
  }, [rows.length, columns.length])

  // Reset focus and selection when view or filter changes to avoid stale state on unrelated cells
  useEffect(() => {
    setSelectedCell(null)
    setFocusedCell({ row: 0, col: 0 })
    setSlotContextMenu(null)
  }, [view, yearGroupFilter])

  const handleSlotContextMenu = useCallback(
    (_e: React.MouseEvent, lesson: LessonDto | null, rowKey: string, col: GridColumn) => {
      if (!((onPinSlot && onUnpinSlot) || onSlotMenu)) return
      setSlotContextMenu({ lesson, rowKey, col, x: _e.clientX, y: _e.clientY })
    },
    [onPinSlot, onUnpinSlot, onSlotMenu],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      const { active, over } = event
      if (!over || !onLessonMove) return
      const overId = String(over.id)
      const match = /^cell-(\d+)-(\d+)$/.exec(overId)
      if (!match) return
      const targetRowIdx = Number(match[1])
      const targetColIdx = Number(match[2])
      const lessonId = String(active.id)
      const lesson = lessons.find((l) => l.id === lessonId)
      if (!lesson) return
      const sourceRowIdx = rows.findIndex((r) => {
        if (view === 'class') return r.key === lesson.classId
        if (view === 'teacher') return r.key === lesson.teacherId
        return r.key === lesson.roomId
      })
      const sourceColIdx = columns.findIndex(
        (c) => c.dayIndex === lesson.cycleDayIndex && c.periodId === lesson.periodId,
      )
      if (sourceRowIdx < 0 || sourceColIdx < 0) return
      if (sourceRowIdx === targetRowIdx && sourceColIdx === targetColIdx) return
      if (lesson.isPinned) return
      const targetRow = rows[targetRowIdx]
      const targetCol = columns[targetColIdx]
      if (!targetRow || !targetCol) return
      onLessonMove({ lessonId, targetRowKey: targetRow.key, col: targetCol })
    },
    [lessons, view, rows, columns, onLessonMove],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
  }, [])

  const activeDragLesson = activeDragId ? lessons.find((l) => l.id === activeDragId) : undefined

  // Group day headers by day label
  const dayGroups = useMemo(() => {
    const groups: { dayLabel: string; startCol: number; span: number }[] = []
    let lastDay = ''
    let startCol = 0
    columns.forEach((col, i) => {
      if (col.dayLabel !== lastDay) {
        if (lastDay !== '') {
          groups.push({ dayLabel: lastDay, startCol, span: i - startCol })
        }
        lastDay = col.dayLabel
        startCol = i
      }
    })
    if (lastDay !== '') {
      groups.push({ dayLabel: lastDay, startCol, span: columns.length - startCol })
    }
    return groups
  }, [columns])

  const ROW_LABEL_WIDTH = 140
  const COL_MIN_WIDTH = 80

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading timetable" className="space-y-1 p-2">
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
          <div key={i} className="flex gap-1">
            <Skeleton className="h-[52px] w-[140px] flex-shrink-0 rounded" />
            {Array.from({ length: Math.min(5, columns.length || 5) }, (_, j) => (
              <Skeleton key={j} className="h-[52px] w-[80px] flex-shrink-0 rounded" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No data to display for the selected view.
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="overflow-auto">
        <div
          role="grid"
          aria-label="Timetable"
          aria-rowcount={rows.length + 2}
          aria-colcount={columns.length + 1}
          style={{ minWidth: ROW_LABEL_WIDTH + columns.length * COL_MIN_WIDTH }}
        >
        {/* Day-group header row */}
        <div role="row" aria-rowindex={1} className="flex sticky top-0 z-[3]">
          {/* Corner cell */}
          <div
            role="columnheader"
            className="flex-shrink-0 border-b-2 border-r border-[--color-border] bg-[--color-surface] px-2 py-1"
            style={{ width: ROW_LABEL_WIDTH }}
          />
          {dayGroups.map((grp) => (
            <div
              key={`${grp.dayLabel}-${grp.startCol}`}
              role="columnheader"
              className="border-b-2 border-r border-[--color-border] bg-[--color-surface] px-2 py-1 text-center text-xs font-semibold"
              style={{
                width: grp.span * COL_MIN_WIDTH,
                color: 'var(--color-text-primary)',
              }}
            >
              {grp.dayLabel}
            </div>
          ))}
        </div>

        {/* Period header row */}
        <div role="row" aria-rowindex={2} className="flex sticky top-[29px] z-[3]">
          <div
            role="columnheader"
            className="flex-shrink-0 border-b border-r border-[--color-border] bg-[--color-surface] px-2 py-1"
            style={{ width: ROW_LABEL_WIDTH, color: 'var(--color-text-secondary)', fontSize: 11 }}
          >
            {view === 'class' ? 'Class' : view === 'teacher' ? 'Teacher' : 'Room'}
          </div>
          {columns.map((col) => (
            <div
              key={col.key}
              role="columnheader"
              className="border-b border-r border-[--color-border] bg-[--color-surface] px-1 py-1 text-center"
              style={{
                width: COL_MIN_WIDTH,
                minWidth: COL_MIN_WIDTH,
                color: 'var(--color-text-secondary)',
                fontSize: 10,
              }}
            >
              {col.periodName}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, rowIdx) => {
          const isFirstInGroup =
            view === 'class' &&
            (rowIdx === 0 || rows[rowIdx - 1]?.groupLabel !== row.groupLabel)

          return (
            <div key={row.key} role="row" aria-rowindex={rowIdx + 3} className="flex">
              {/* Row header */}
              <div
                role="rowheader"
                className="sticky left-0 z-[2] flex-shrink-0 border-b border-r border-[--color-border] bg-[--color-surface] px-2 py-1"
                style={{ width: ROW_LABEL_WIDTH }}
              >
                {isFirstInGroup && row.groupLabel && (
                  <div
                    className="truncate text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--brand-accent)' }}
                  >
                    {row.groupLabel}
                  </div>
                )}
                <div
                  className="truncate text-xs font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {row.label}
                </div>
              </div>

              {/* Data cells */}
              {columns.map((col, colIdx) => (
                <TimetableSlotCell
                  key={buildCellKey(view, row.key, col)}
                  rowIdx={rowIdx}
                  colIdx={colIdx}
                  lessons={lessons}
                  view={view}
                  row={row}
                  col={col}
                  cellRefs={cellRefs}
                  focusedCell={focusedCell}
                  selectedCell={selectedCell}
                  onFocusCell={(r, c) => setFocusedCell({ row: r, col: c })}
                  onKeyDownCell={handleCellKeyDown}
                  onSlotContextMenu={menuEnabled ? handleSlotContextMenu : undefined}
                  COL_MIN_WIDTH={COL_MIN_WIDTH}
                />
              ))}
            </div>
          )
        })}
        </div>

        {slotContextMenu && menuEnabled ? (
          <SlotContextMenu
            lesson={slotContextMenu.lesson}
            pinActionsAvailable={Boolean(onPinSlot && onUnpinSlot)}
            position={{ x: slotContextMenu.x, y: slotContextMenu.y }}
            onClose={() => setSlotContextMenu(null)}
            onAssignLesson={() =>
              onSlotMenu?.({
                action: 'assign',
                lesson: slotContextMenu.lesson,
                rowKey: slotContextMenu.rowKey,
                col: slotContextMenu.col,
              })
            }
            onPin={() => {
              const id = slotContextMenu.lesson?.id
              if (id) onPinSlot?.(id)
            }}
            onUnpin={() => {
              const id = slotContextMenu.lesson?.id
              if (id) onUnpinSlot?.(id)
            }}
            onClear={() =>
              onSlotMenu?.({
                action: 'clear',
                lesson: slotContextMenu.lesson,
                rowKey: slotContextMenu.rowKey,
                col: slotContextMenu.col,
              })
            }
            onViewDetail={() =>
              onSlotMenu?.({
                action: 'viewDetail',
                lesson: slotContextMenu.lesson,
                rowKey: slotContextMenu.rowKey,
                col: slotContextMenu.col,
              })
            }
          />
        ) : null}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragLesson ? <MiniSlot lesson={activeDragLesson} size="sm" /> : null}
      </DragOverlay>
    </DndContext>
  )
}
