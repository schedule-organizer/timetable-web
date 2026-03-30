import { useEffect, useMemo, useRef, useState } from 'react'
import { AvailabilityGrid } from '@/components/domain/availability-grid'
import { Button } from '@/components/ui/button'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { useTeacherAvailability, useUpdateTeacherAvailability } from '@/api/hooks/useTeacherAvailability'
import { useMyProfile } from '@/api/hooks/useTeachers'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { availabilityDtoToStateMap, stateMapToAvailabilityDto } from '@/lib/availability-utils'
import { padDayLabels } from '@/lib/cycle-term-utils'
import { useInstitutionPermission } from '@/hooks/usePermission'
import type { AvailabilitySlotState } from '@/types/teacher-availability.types'

type ViewMode = 'edit' | 'summary'

function summarizeSlots(
  slotMap: Map<string, AvailabilitySlotState>,
  dayLabels: string[],
  periodNames: Map<string, string>,
): { unavailableLines: string[]; preferredLines: string[] } {
  const unavailableLines: string[] = []
  const preferredLines: string[] = []
  const keys = [...slotMap.keys()].sort()
  for (const key of keys) {
    const state = slotMap.get(key)
    if (state === 'available' || !state) continue
    const colon = key.indexOf(':')
    if (colon <= 0) continue
    const day = Number(key.slice(0, colon))
    const periodId = key.slice(colon + 1)
    const dayName = dayLabels[day]?.trim() || `Day ${day + 1}`
    const periodName = periodNames.get(periodId) ?? periodId
    const line = `${dayName} · ${periodName}`
    if (state === 'unavailable') unavailableLines.push(line)
    else preferredLines.push(line)
  }
  return { unavailableLines, preferredLines }
}

export default function MyAvailabilityPage() {
  const canDeclare = useInstitutionPermission('availability:declare')
  const { data: profile, isLoading: profileLoading, error: profileError } = useMyProfile()
  const teacherId = profile?.id

  const { data: bellSchedule, isLoading: bellLoading, error: bellError } = useBellSchedule()
  const { data: cycleSettings, isLoading: cycleLoading, error: cycleError } = useCycleSettings()
  const {
    data: availabilityDto,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useTeacherAvailability(teacherId)

  const { mutate: saveAvailability, isPending: isSaving, error: saveError } =
    useUpdateTeacherAvailability(teacherId)

  const [slotMap, setSlotMap] = useState<Map<string, AvailabilitySlotState>>(() => new Map())
  const [hydrated, setHydrated] = useState(false)
  const [view, setView] = useState<ViewMode>('edit')
  const [confirmingReset, setConfirmingReset] = useState(false)
  const availabilitySyncedRef = useRef(false)

  useEffect(() => {
    availabilitySyncedRef.current = false
  }, [teacherId])

  useEffect(() => {
    if (!teacherId) return
    if (availabilityLoading) return
    if (availabilitySyncedRef.current) return
    if (availabilityDto) {
      setSlotMap(availabilityDtoToStateMap(availabilityDto))
    }
    availabilitySyncedRef.current = true
    setHydrated(true)
  }, [teacherId, availabilityDto, availabilityLoading])

  const periods = bellSchedule?.periods ?? []
  const cycleLengthDays = cycleSettings?.cycleLengthDays ?? 0
  const dayLabels = useMemo(
    () => padDayLabels(cycleSettings?.dayLabels ?? [], cycleLengthDays),
    [cycleSettings?.dayLabels, cycleLengthDays],
  )

  const periodNames = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of periods) m.set(p.id, p.name)
    return m
  }, [periods])

  const { unavailableLines, preferredLines } = useMemo(
    () => summarizeSlots(slotMap, dayLabels, periodNames),
    [slotMap, dayLabels, periodNames],
  )

  const unavailableCount = unavailableLines.length
  const preferredCount = preferredLines.length

  const loadError =
    profileError ?? bellError ?? cycleError ?? availabilityError
  const loadErrorMessage = loadError ? getApiErrorMessage(loadError) : null

  const isLoading =
    profileLoading || bellLoading || cycleLoading || (Boolean(teacherId) && availabilityLoading)

  const handleSubmit = () => {
    if (!teacherId) return
    const body = stateMapToAvailabilityDto(slotMap)
    saveAvailability(body, {
      onSuccess: () => {
        setView('summary')
      },
    })
  }

  const handleConfirmReset = () => {
    setSlotMap(new Map())
    setConfirmingReset(false)
  }

  const saveErrorMessage = saveError ? getApiErrorMessage(saveError) : null

  if (!canDeclare) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          My Availability
        </h1>
        <p className="mt-4 text-sm text-[--color-text-secondary]">
          Your account does not have permission to declare availability. If you are a teacher, ask
          your timetabler to assign you the Teacher role.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          My Availability
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Tap each slot to cycle Available, Unavailable, or Preferred. On a phone, swipe left on a
          day row to mark the whole day unavailable, or swipe right to clear that day.
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

      {isLoading && (
        <div role="status" className="text-sm text-[--color-text-secondary]">
          Loading availability…
        </div>
      )}

      {!isLoading && view === 'edit' && (
        <section aria-label="Availability grid" className="space-y-4">
          <AvailabilityGrid
            cycleLengthDays={cycleLengthDays}
            dayLabels={dayLabels}
            periods={periods}
            value={slotMap}
            onChange={setSlotMap}
            disabled={!hydrated}
          />

          {saveErrorMessage && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {saveErrorMessage}
            </div>
          )}

          {confirmingReset ? (
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <span className="text-sm text-amber-800">
                This clears every Unavailable and Preferred mark. Confirm?
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setConfirmingReset(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleConfirmReset}>
                  Mark all as available
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmingReset(true)}>
                Mark all as available
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={!hydrated || isSaving}>
                {isSaving ? 'Submitting…' : 'Submit availability'}
              </Button>
            </div>
          )}
        </section>
      )}

      {!isLoading && view === 'summary' && (
        <section aria-label="Submission summary" className="max-w-lg space-y-4">
          <div
            className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm"
            role="status"
          >
            <h2 className="text-base font-semibold text-[--color-text-primary]">
              Availability submitted
            </h2>
            <p className="mt-2 text-sm text-[--color-text-secondary]">
              Your preferences have been saved. Unavailable slots: {unavailableCount}. Preferred
              slots: {preferredCount}.
            </p>
            {unavailableCount > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[--color-text-primary]">Unavailable</h3>
                <ul className="mt-1 list-inside list-disc text-sm text-[--color-text-secondary]">
                  {unavailableLines.map((line) => (
                    <li key={`u-${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {preferredCount > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[--color-text-primary]">Preferred</h3>
                <ul className="mt-1 list-inside list-disc text-sm text-[--color-text-secondary]">
                  {preferredLines.map((line) => (
                    <li key={`p-${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {unavailableCount === 0 && preferredCount === 0 && (
              <p className="mt-3 text-sm text-[--color-text-secondary]">
                You marked every slot as available.
              </p>
            )}
          </div>
          <Button type="button" variant="secondary" onClick={() => setView('edit')}>
            Back to grid
          </Button>
        </section>
      )}
    </div>
  )
}
