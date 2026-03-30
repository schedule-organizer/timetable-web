import { useCallback, useEffect, useMemo, useState } from 'react'
import { AvailabilityGrid } from '@/components/domain/availability-grid'
import { Button } from '@/components/ui/button'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { useTeacherAvailability } from '@/api/hooks/useTeacherAvailability'
import { useTeachers } from '@/api/hooks/useTeachers'
import {
  useAvailabilitySummary,
  useTeacherAvailabilityOverride,
  useUpdateTeacherAvailabilityOverride,
} from '@/api/hooks/useAvailabilityOverview'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
  availabilityDtoToStateMap,
  parseSlotKey,
  slotKey,
} from '@/lib/availability-utils'
import { padDayLabels } from '@/lib/cycle-term-utils'
import { useInstitutionPermission } from '@/hooks/usePermission'
import type { TeacherDto } from '@/types/teacher.types'
import type {
  AvailabilityOverrideSlot,
  TeacherAvailabilitySummaryItem,
} from '@/types/teacher-availability-override.types'
import type { AvailabilitySlotState } from '@/types/teacher-availability.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeOverriddenKeys(
  originalMap: Map<string, AvailabilitySlotState>,
  editedMap: Map<string, AvailabilitySlotState>,
): Set<string> {
  const keys = new Set<string>()
  const allKeys = new Set([...originalMap.keys(), ...editedMap.keys()])
  for (const k of allKeys) {
    const orig = originalMap.get(k) ?? 'available'
    const edited = editedMap.get(k) ?? 'available'
    if (orig !== edited) keys.add(k)
  }
  return keys
}

function buildOverrideSlots(
  originalMap: Map<string, AvailabilitySlotState>,
  editedMap: Map<string, AvailabilitySlotState>,
): AvailabilityOverrideSlot[] {
  const overrideSlots: AvailabilityOverrideSlot[] = []
  const allKeys = new Set([...originalMap.keys(), ...editedMap.keys()])
  for (const k of allKeys) {
    const orig = originalMap.get(k) ?? 'available'
    const edited = editedMap.get(k) ?? 'available'
    if (orig !== edited) {
      const parsed = parseSlotKey(k)
      if (parsed) overrideSlots.push({ ...parsed, state: edited })
    }
  }
  return overrideSlots
}

// ─── TeacherAvailabilityPanel ─────────────────────────────────────────────────

interface TeacherAvailabilityPanelProps {
  teacher: TeacherDto
  submitted: boolean
  onClose: () => void
}

function TeacherAvailabilityPanel({ teacher, submitted, onClose }: TeacherAvailabilityPanelProps) {
  const { data: bellSchedule } = useBellSchedule()
  const { data: cycleSettings } = useCycleSettings()
  const { data: originalAvailability, isLoading: originalLoading } = useTeacherAvailability(teacher.id)
  const { data: overrideData, isLoading: overrideLoading } = useTeacherAvailabilityOverride(teacher.id)
  const { mutate: saveOverride, isPending: isSaving, error: saveError } =
    useUpdateTeacherAvailabilityOverride(teacher.id)

  const [editedMap, setEditedMap] = useState<Map<string, AvailabilitySlotState>>(() => new Map())
  const [hydrated, setHydrated] = useState(false)

  const periods = bellSchedule?.periods ?? []
  const cycleLengthDays = cycleSettings?.cycleLengthDays ?? 0
  const dayLabels = useMemo(
    () => padDayLabels(cycleSettings?.dayLabels ?? [], cycleLengthDays),
    [cycleSettings?.dayLabels, cycleLengthDays],
  )

  const originalMap = useMemo(
    () => (originalAvailability ? availabilityDtoToStateMap(originalAvailability) : new Map<string, AvailabilitySlotState>()),
    [originalAvailability],
  )

  const effectiveMap = useMemo(() => {
    const m = new Map(originalMap)
    for (const slot of overrideData?.overriddenSlots ?? []) {
      m.set(slotKey(slot.cycleDayIndex, slot.periodId), slot.state)
    }
    return m
  }, [originalMap, overrideData])

  useEffect(() => {
    if (originalLoading || overrideLoading) return
    if (hydrated) return
    setEditedMap(new Map(effectiveMap))
    setHydrated(true)
  }, [originalLoading, overrideLoading, effectiveMap, hydrated])

  const savedOverrideKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const slot of overrideData?.overriddenSlots ?? []) {
      keys.add(slotKey(slot.cycleDayIndex, slot.periodId))
    }
    return keys
  }, [overrideData])

  const unsavedChangeKeys = useMemo(
    () => (hydrated ? computeOverriddenKeys(effectiveMap, editedMap) : new Set<string>()),
    [effectiveMap, editedMap, hydrated],
  )

  const hasChanges = unsavedChangeKeys.size > 0

  const gridOverriddenKeys =
    unsavedChangeKeys.size > 0 ? unsavedChangeKeys :
    savedOverrideKeys.size > 0 ? savedOverrideKeys : undefined

  const handleSave = () => {
    const overriddenSlots = buildOverrideSlots(originalMap, editedMap)
    saveOverride({ overriddenSlots }, { onSuccess: onClose })
  }

  const isLoading = originalLoading || overrideLoading
  const saveErrorMessage = saveError ? getApiErrorMessage(saveError) : null
  const teacherName = `${teacher.firstName} ${teacher.lastName}`

  return (
    <div className="border-t border-[--color-border] bg-[--color-background] px-4 py-5">
      {/* Panel header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[--color-text-primary]">
            {teacherName} — Availability
          </h3>
          <p className="mt-0.5 text-sm text-[--color-text-secondary]">
            {unsavedChangeKeys.size > 0
              ? `${unsavedChangeKeys.size} unsaved change${unsavedChangeKeys.size !== 1 ? 's' : ''} — blue dot marks changed slots`
              : savedOverrideKeys.size > 0
              ? `${savedOverrideKeys.size} saved override${savedOverrideKeys.size !== 1 ? 's' : ''} — blue dot marks overridden slots`
              : 'Teacher\'s original submission. Toggle slots to override.'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="shrink-0 rounded-md p-1.5 text-[--color-text-secondary] hover:bg-[--color-surface] hover:text-[--color-text-primary]"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.293 3.293a1 1 0 0 1 1.414 0L8 6.586l3.293-3.293a1 1 0 1 1 1.414 1.414L9.414 8l3.293 3.293a1 1 0 0 1-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L6.586 8 3.293 4.707a1 1 0 0 1 0-1.414z" />
          </svg>
        </button>
      </div>

      {!submitted && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          This teacher has not yet submitted their availability. You can still set slots here as overrides.
        </p>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-[--color-text-secondary]">Loading availability…</p>
      ) : (
        <AvailabilityGrid
          cycleLengthDays={cycleLengthDays}
          dayLabels={dayLabels}
          periods={periods}
          value={hydrated ? editedMap : effectiveMap}
          onChange={setEditedMap}
          overriddenKeys={gridOverriddenKeys}
          disabled={!hydrated}
        />
      )}

      {saveErrorMessage && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {saveErrorMessage}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={!hydrated || isSaving}>
          {isSaving ? 'Saving…' : hasChanges ? 'Save overrides' : 'Save (no changes)'}
        </Button>
      </div>
    </div>
  )
}

// ─── AvailabilityOverviewPage ─────────────────────────────────────────────────

type SlotStateFilter = 'all' | 'forbidden' | 'preferred' | 'not-submitted'

export default function AvailabilityOverviewPage() {
  const canManage = useInstitutionPermission('teachers:manage')
  const { data: teachersData, isLoading: teachersLoading, error: teachersError } = useTeachers()
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } =
    useAvailabilitySummary()

  const [nameFilter, setNameFilter] = useState('')
  const [stateFilter, setStateFilter] = useState<SlotStateFilter>('all')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)

  const handleClosePanel = useCallback(() => {
    setSelectedTeacherId(null)
  }, [])

  const teachers = teachersData?.content ?? []

  const summaryMap = useMemo(() => {
    const m = new Map<string, TeacherAvailabilitySummaryItem>()
    for (const s of summaryData ?? []) m.set(s.teacherId, s)
    return m
  }, [summaryData])

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const summary = summaryMap.get(t.id)
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase()
      if (nameFilter && !fullName.includes(nameFilter.toLowerCase())) return false
      if (stateFilter === 'not-submitted') return !summary?.submitted
      if (stateFilter === 'forbidden') return (summary?.unavailableCount ?? 0) > 0
      if (stateFilter === 'preferred') return (summary?.preferredCount ?? 0) > 0
      return true
    })
  }, [teachers, summaryMap, nameFilter, stateFilter])

  const isLoading = teachersLoading || summaryLoading
  const loadError = teachersError ?? summaryError
  const loadErrorMessage = loadError ? getApiErrorMessage(loadError) : null

  if (!canManage) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[--color-text-primary]">Availability Overview</h2>
        <p className="mt-4 text-sm text-[--color-text-secondary]">
          You do not have permission to view availability overrides.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-[--color-text-primary]">Availability Overview</h2>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          View all teachers' availability declarations and override individual slots when needed.
        </p>
      </header>

      {loadErrorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {loadErrorMessage}
        </div>
      )}

      {/* Filter controls */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Filter by teacher name"
          placeholder="Filter by name…"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="h-9 rounded-md border border-[--color-border] bg-[--color-background] px-3 text-sm text-[--color-text-primary] placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-[--color-border]"
        />
        <select
          aria-label="Filter by slot state"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as SlotStateFilter)}
          className="h-9 rounded-md border border-[--color-border] bg-[--color-background] px-3 text-sm text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-border]"
        >
          <option value="all">All teachers</option>
          <option value="forbidden">Has forbidden slots</option>
          <option value="preferred">Has preferred slots</option>
          <option value="not-submitted">Not submitted</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <p role="status" className="text-sm text-[--color-text-secondary]">
          Loading teachers…
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[--color-border]">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-[--color-surface] text-[--color-text-secondary]">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Teacher</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Forbidden</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Preferred</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Overrides</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[--color-text-secondary]">
                    No teachers match the current filters.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const summary = summaryMap.get(teacher.id)
                  const isSubmitted = summary?.submitted ?? false
                  const overrideCount = summary?.overrideCount ?? 0
                  const isSelected = selectedTeacherId === teacher.id
                  return (
                    <>
                      <tr
                        key={teacher.id}
                        className={`transition-colors ${isSelected ? 'bg-[--color-brand-light]' : 'bg-[--color-surface] hover:bg-[--color-background]'}`}
                      >
                        <td className="px-4 py-3 font-medium text-[--color-text-primary]">
                          {teacher.firstName} {teacher.lastName}
                        </td>
                        <td className="px-4 py-3">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                              Not submitted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-[--color-text-secondary]">
                          {summary?.unavailableCount ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right text-[--color-text-secondary]">
                          {summary?.preferredCount ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {overrideCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-blue-700">
                              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-500" />
                              {overrideCount}
                            </span>
                          ) : (
                            <span className="text-[--color-text-secondary]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSelectedTeacherId(isSelected ? null : teacher.id)}
                            aria-expanded={isSelected}
                            aria-label={`${isSelected ? 'Close' : 'View'} availability for ${teacher.firstName} ${teacher.lastName}`}
                          >
                            {isSelected ? 'Close' : 'View / Override'}
                          </Button>
                        </td>
                      </tr>
                      {isSelected && (
                        <tr key={`${teacher.id}-panel`}>
                          <td colSpan={6} className="p-0">
                            <TeacherAvailabilityPanel
                              teacher={teacher}
                              submitted={isSubmitted}
                              onClose={handleClosePanel}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[--color-text-secondary]">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-500" />
          Override applied by timetabler
        </span>
      </div>
    </div>
  )
}
