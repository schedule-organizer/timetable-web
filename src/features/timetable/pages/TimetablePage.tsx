import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import {
  useCreateLesson,
  useDeleteLesson,
  useMoveLesson,
  usePinLesson,
  useTimetableLessons,
  useUnpinLesson,
  useUpdateLesson,
} from '@/api/hooks/useTimetable'
import { GeneratorStatusBar } from '@/components/domain/generator-status-bar'
import {
  TimetableGrid,
  countUnpinnedSlotsForSolver,
  type SlotMenuAction,
} from '@/components/timetable/timetable-grid'
import { ViewPivotToolbar } from '@/components/timetable/view-pivot-toolbar'
import { YearGroupFilter } from '@/components/timetable/year-group-filter'
import { AssignmentConflictPopover } from '@/features/timetable/components/assignment-conflict-popover'
import { SlotEditSheet } from '@/features/timetable/components/slot-edit-sheet'
import { parseSchedulingConflictDetails } from '@/lib/timetable-conflict'
import { useTimetableStore } from '@/store/timetableStore'
import { padDayLabels } from '@/lib/cycle-term-utils'
import { MOCK_TIMETABLE_ID } from '@/mocks/pages/timetable-page.mock'
import type {
  CreateLessonBody,
  GridColumn,
  LessonDto,
  LessonPatchBody,
  SchedulingAlternativeSlot,
  SchedulingConflictDetails,
  TimetableView,
} from '@/types/timetable.types'

type PendingAssignmentConflict =
  | {
      kind: 'edit'
      lessonId: string
      patch: LessonPatchBody
      details: SchedulingConflictDetails
    }
  | {
      kind: 'create'
      body: CreateLessonBody
      details: SchedulingConflictDetails
    }

/** After `parseSchedulingConflictDetails` returns null — distinguish unreadable 409 from other errors. */
function toastAfterConflictParseFailure(e: unknown, genericMessage: string): void {
  if (axios.isAxiosError(e) && e.response?.status === 409) {
    toast.error('The server reported a scheduling conflict, but details could not be read. Try again.')
    return
  }
  toast.error(genericMessage)
}

function toastApiErrorMessageOrFallback(e: unknown, fallback: string): void {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data
    if (data && typeof data === 'object' && data !== null && 'message' in data) {
      const msg = (data as { message: unknown }).message
      if (typeof msg === 'string' && msg.length > 0) {
        toast.error(msg)
        return
      }
    }
  }
  toast.error(fallback)
}

function rowLabelFromLessons(
  lessons: LessonDto[],
  view: TimetableView,
  rowKey: string,
): string {
  const sample = lessons.find((l) =>
    view === 'class' ? l.classId === rowKey : view === 'teacher' ? l.teacherId === rowKey : l.roomId === rowKey,
  )
  if (!sample) return rowKey
  if (view === 'class') return sample.className
  if (view === 'teacher') return sample.teacherName
  return sample.roomName
}

export default function TimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const { activeTimetableId, activeView, setActiveTimetable, setActiveView } = useTimetableStore()

  const timetableId = activeTimetableId ?? MOCK_TIMETABLE_ID

  useEffect(() => {
    if (!activeTimetableId) {
      setActiveTimetable(MOCK_TIMETABLE_ID)
    }
  }, [activeTimetableId, setActiveTimetable])

  const { data: bell, isError: bellError } = useBellSchedule()
  const { data: cycle, isError: cycleError } = useCycleSettings()
  const { data: timetable, isLoading } = useTimetableLessons(timetableId)
  const pinLesson = usePinLesson(timetableId)
  const unpinLesson = useUnpinLesson(timetableId)
  const updateLesson = useUpdateLesson(timetableId)
  const deleteLesson = useDeleteLesson(timetableId)
  const createLesson = useCreateLesson(timetableId)
  const moveLesson = useMoveLesson(timetableId)

  const yearGroupParam = searchParams.get('yearGroup')

  const lessons = timetable?.lessons ?? []

  const cycleLength = cycle?.cycleLengthDays ?? 0
  const dayLabels = useMemo(
    () => padDayLabels(cycle?.dayLabels ?? [], cycleLength),
    [cycle?.dayLabels, cycleLength],
  )

  const yearGroups = useMemo(() => {
    const groups = new Set<string>()
    for (const l of lessons) {
      if (l.yearGroup) groups.add(l.yearGroup)
    }
    return Array.from(groups).sort()
  }, [lessons])

  const validatedYearGroup = yearGroupParam && yearGroups.includes(yearGroupParam) ? yearGroupParam : null

  const handleViewChange = useCallback(
    (view: TimetableView) => {
      setActiveView(view as Parameters<typeof setActiveView>[0])
    },
    [setActiveView],
  )

  const handleYearGroupChange = useCallback(
    (yg: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (yg) {
          next.set('yearGroup', yg)
        } else {
          next.delete('yearGroup')
        }
        return next
      })
    },
    [setSearchParams],
  )

  const handleToggleSlotPin = useCallback(
    (lessonId: string) => {
      const lesson = lessons.find((l) => l.id === lessonId)
      if (!lesson) return
      if (lesson.isPinned) unpinLesson.mutate(lessonId)
      else pinLesson.mutate(lessonId)
    },
    [lessons, pinLesson, unpinLesson],
  )

  const handlePinSlot = useCallback(
    (lessonId: string) => {
      pinLesson.mutate(lessonId)
    },
    [pinLesson],
  )

  const handleUnpinSlot = useCallback(
    (lessonId: string) => {
      unpinLesson.mutate(lessonId)
    },
    [unpinLesson],
  )

  const gridView: TimetableView =
    activeView === 'teacher' ? 'teacher' : activeView === 'room' ? 'room' : 'class'

  const [slotSheet, setSlotSheet] = useState<null | {
    mode: 'assign' | 'edit' | 'view'
    lesson: LessonDto | null
    rowKey: string
    rowLabel: string
    col: GridColumn
  }>(null)

  const [pendingConflict, setPendingConflict] = useState<PendingAssignmentConflict | null>(null)

  const handleSlotOpen = useCallback(
    (payload: { lesson: LessonDto | null; rowKey: string; col: GridColumn }) => {
      const rowLabel = rowLabelFromLessons(lessons, gridView, payload.rowKey)
      setSlotSheet({
        mode: payload.lesson ? 'edit' : 'assign',
        lesson: payload.lesson,
        rowKey: payload.rowKey,
        rowLabel,
        col: payload.col,
      })
    },
    [lessons, gridView],
  )

  const handleSlotMenu = useCallback(
    (detail: {
      action: SlotMenuAction
      lesson: LessonDto | null
      rowKey: string
      col: GridColumn
    }) => {
      const rowLabel = rowLabelFromLessons(lessons, gridView, detail.rowKey)
      if (detail.action === 'clear' && detail.lesson) {
        deleteLesson.mutate(detail.lesson.id)
        return
      }
      if (detail.action === 'assign') {
        setSlotSheet({
          mode: detail.lesson ? 'edit' : 'assign',
          lesson: detail.lesson,
          rowKey: detail.rowKey,
          rowLabel,
          col: detail.col,
        })
        return
      }
      if (detail.action === 'viewDetail' && detail.lesson) {
        setSlotSheet({
          mode: 'view',
          lesson: detail.lesson,
          rowKey: detail.rowKey,
          rowLabel,
          col: detail.col,
        })
      }
    },
    [lessons, gridView, deleteLesson],
  )

  const handleLessonMove = useCallback(
    (detail: { lessonId: string; targetRowKey: string; col: GridColumn }) => {
      moveLesson.mutate(
        {
          lessonId: detail.lessonId,
          view: gridView,
          targetRowKey: detail.targetRowKey,
          targetDayIndex: detail.col.dayIndex,
          targetPeriodId: detail.col.periodId,
        },
        {
          onError: (err) => {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
              toast.error('Cannot move a pinned lesson. Unpin it first.')
            }
          },
        },
      )
    },
    [gridView, moveLesson],
  )

  const unpinnedSolveCount = useMemo(() => {
    if (!bell || !cycle || cycleLength === 0) return 0
    return countUnpinnedSlotsForSolver(
      lessons,
      gridView,
      validatedYearGroup,
      cycleLength,
      dayLabels,
      bell.periods,
    )
  }, [bell, cycle, cycleLength, lessons, gridView, validatedYearGroup, dayLabels])

  const generatorStatusMessage =
    bell && cycle && cycleLength > 0 && !bellError && !cycleError
      ? `${unpinnedSolveCount} unpinned slots will be solved`
      : ''

  const handleSaveEdit = useCallback(
    async (lessonId: string, patch: LessonPatchBody) => {
      try {
        await updateLesson.mutateAsync({ lessonId, patch })
        setSlotSheet(null)
        setPendingConflict(null)
      } catch (e) {
        const details = parseSchedulingConflictDetails(e)
        if (details) {
          setPendingConflict({ kind: 'edit', lessonId, patch, details })
          return
        }
        toastAfterConflictParseFailure(e, 'Could not save changes. Try again.')
      }
    },
    [updateLesson],
  )

  const handleSaveNew = useCallback(
    async (body: CreateLessonBody) => {
      try {
        await createLesson.mutateAsync({ body })
        setSlotSheet(null)
        setPendingConflict(null)
      } catch (e) {
        const details = parseSchedulingConflictDetails(e)
        if (details) {
          setPendingConflict({ kind: 'create', body, details })
          return
        }
        toastAfterConflictParseFailure(e, 'Could not place lesson. Try again.')
      }
    },
    [createLesson],
  )

  const handlePickAlternative = useCallback(
    async (slot: SchedulingAlternativeSlot) => {
      if (!pendingConflict) return
      const base = pendingConflict
      try {
        if (base.kind === 'edit') {
          await updateLesson.mutateAsync({
            lessonId: base.lessonId,
            patch: {
              ...base.patch,
              cycleDayIndex: slot.cycleDayIndex,
              periodId: slot.periodId,
            },
          })
        } else {
          await createLesson.mutateAsync({
            body: {
              ...base.body,
              cycleDayIndex: slot.cycleDayIndex,
              periodId: slot.periodId,
            },
          })
        }
        setPendingConflict(null)
        setSlotSheet(null)
      } catch (e) {
        const details = parseSchedulingConflictDetails(e)
        if (details) {
          if (base.kind === 'edit') {
            setPendingConflict({
              kind: 'edit',
              lessonId: base.lessonId,
              patch: {
                ...base.patch,
                cycleDayIndex: slot.cycleDayIndex,
                periodId: slot.periodId,
              },
              details,
            })
          } else {
            setPendingConflict({
              kind: 'create',
              body: {
                ...base.body,
                cycleDayIndex: slot.cycleDayIndex,
                periodId: slot.periodId,
              },
              details,
            })
          }
          return
        }
        toastAfterConflictParseFailure(e, 'Could not move to that slot. Try another.')
      }
    },
    [pendingConflict, updateLesson, createLesson],
  )

  const handleKeepConflicting = useCallback(async () => {
    if (!pendingConflict) return
    try {
      if (pendingConflict.kind === 'edit') {
        await updateLesson.mutateAsync({
          lessonId: pendingConflict.lessonId,
          patch: pendingConflict.patch,
          acceptConflict: true,
        })
      } else {
        await createLesson.mutateAsync({
          body: pendingConflict.body,
          acceptConflict: true,
        })
      }
      setPendingConflict(null)
      setSlotSheet(null)
    } catch (e) {
      toastApiErrorMessageOrFallback(e, 'Could not save placement. Try again.')
    }
  }, [pendingConflict, updateLesson, createLesson])

  const sheetBusy =
    createLesson.isPending || updateLesson.isPending || pendingConflict !== null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 px-4 pt-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Timetable
          </h1>
          <ViewPivotToolbar activeView={gridView} onChange={handleViewChange} />
        </header>

        {yearGroups.length > 0 && (
          <YearGroupFilter
            yearGroups={yearGroups}
            selected={validatedYearGroup}
            onChange={handleYearGroupChange}
          />
        )}
      </div>

      {generatorStatusMessage ? (
        <div className="mx-4 mt-2">
          <GeneratorStatusBar phase="idle" message={generatorStatusMessage} />
        </div>
      ) : null}

      <div
        className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-t-xl border-t border-x border-[--color-border] bg-[--color-background] mx-4"
        aria-label="Timetable workspace"
      >
        {bellError || cycleError ? (
          <p className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Failed to load schedule configuration. Please refresh.
          </p>
        ) : bell && cycle && cycleLength > 0 ? (
          <TimetableGrid
            lessons={lessons}
            view={gridView}
            cycleLengthDays={cycleLength}
            dayLabels={dayLabels}
            periods={bell.periods}
            yearGroupFilter={validatedYearGroup}
            isLoading={isLoading}
            onSlotPin={handleToggleSlotPin}
            onPinSlot={handlePinSlot}
            onUnpinSlot={handleUnpinSlot}
            onSlotOpen={handleSlotOpen}
            onSlotMenu={handleSlotMenu}
            onLessonMove={handleLessonMove}
          />
        ) : (
          <TimetableGrid
            lessons={[]}
            view={gridView}
            cycleLengthDays={0}
            dayLabels={[]}
            periods={[]}
            isLoading={true}
          />
        )}
      </div>

      {slotSheet ? (
        <SlotEditSheet
          open
          onOpenChange={(o) => {
            if (!o) {
              setSlotSheet(null)
              setPendingConflict(null)
            }
          }}
          mode={slotSheet.mode}
          pivotView={gridView}
          rowKey={slotSheet.rowKey}
          rowLabel={slotSheet.rowLabel}
          col={slotSheet.col}
          lesson={slotSheet.lesson}
          isSubmitting={sheetBusy}
          onSaveNew={handleSaveNew}
          onSaveEdit={handleSaveEdit}
        />
      ) : null}

      <AssignmentConflictPopover
        open={pendingConflict !== null}
        details={pendingConflict?.details ?? null}
        isSubmitting={updateLesson.isPending || createLesson.isPending}
        onPickAlternative={(slot) => {
          void handlePickAlternative(slot)
        }}
        onKeepConflicting={() => {
          void handleKeepConflicting()
        }}
        onClose={() => setPendingConflict(null)}
      />
    </div>
  )
}
