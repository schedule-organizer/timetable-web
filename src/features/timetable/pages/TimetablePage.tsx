import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { usePinLesson, useTimetableLessons, useUnpinLesson } from '@/api/hooks/useTimetable'
import { GeneratorStatusBar } from '@/components/domain/generator-status-bar'
import { TimetableGrid, countUnpinnedSlotsForSolver } from '@/components/timetable/timetable-grid'
import { ViewPivotToolbar } from '@/components/timetable/view-pivot-toolbar'
import { YearGroupFilter } from '@/components/timetable/year-group-filter'
import { useTimetableStore } from '@/store/timetableStore'
import { padDayLabels } from '@/lib/cycle-term-utils'
import type { TimetableView } from '@/types/timetable.types'
import { MOCK_TIMETABLE_ID } from '@/mocks/pages/timetable-page.mock'

export default function TimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const { activeTimetableId, activeView, setActiveTimetable, setActiveView } = useTimetableStore()

  // During mock-first phase, default to the mock timetable id if none is active
  const timetableId = activeTimetableId ?? MOCK_TIMETABLE_ID

  // Sync mock id into store on mount if none is set
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

  const handleSlotOpen = useCallback((lessonId: string) => {
    // Story 5.3 — manual slot assignment; placeholder for now
    void lessonId
  }, [])

  // Cast store view to the grid's TimetableView (only class/teacher/room supported by grid)
  const gridView: TimetableView =
    activeView === 'teacher' ? 'teacher' : activeView === 'room' ? 'room' : 'class'

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
    </div>
  )
}
