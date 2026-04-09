import { useEffect, useLayoutEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalPortal } from '@/components/ui/modal-portal'
import type { SchedulingAlternativeSlot, SchedulingConflictDetails } from '@/types/timetable.types'

function reasonCopy(reason: SchedulingConflictDetails['reason']): string {
  switch (reason) {
    case 'TEACHER_DOUBLE_BOOKED':
      return 'That teacher is already teaching another class in this period.'
    case 'ROOM_IN_USE':
      return 'That room is already in use for another lesson in this period.'
    case 'CLASS_SLOT_OCCUPIED':
      return 'That class already has a lesson in this slot.'
    default:
      return 'This placement conflicts with an existing lesson.'
  }
}

export interface AssignmentConflictPopoverProps {
  open: boolean
  details: SchedulingConflictDetails | null
  isSubmitting: boolean
  onPickAlternative: (slot: SchedulingAlternativeSlot) => void
  onKeepConflicting: () => void
  onClose: () => void
}

export function AssignmentConflictPopover({
  open,
  details,
  isSubmitting,
  onPickAlternative,
  onKeepConflicting,
  onClose,
}: AssignmentConflictPopoverProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open || !details) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, details, onClose])

  /** Trap keyboard interaction in the modal layer: `#root` holds the app; overlays render under `#modal-root`. */
  useEffect(() => {
    if (!open || !details) return
    const root = document.getElementById('root')
    if (!root) return
    root.inert = true
    return () => {
      root.inert = false
    }
  }, [open, details])

  useLayoutEffect(() => {
    if (!open || !details) return
    cancelButtonRef.current?.focus()
  }, [open, details])

  if (!open || !details) return null

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assignment-conflict-title"
          aria-describedby="assignment-conflict-description"
          className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[--color-border] bg-[--color-surface] p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#c0392b]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2
                id="assignment-conflict-title"
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Scheduling conflict
              </h2>
              <p
                id="assignment-conflict-description"
                className="mt-1 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {reasonCopy(details.reason)}
              </p>
            </div>
          </div>

          {details.alternatives.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[--color-text-secondary]">
                Suggested slots
              </p>
              <ul className="flex flex-col gap-2">
                {details.alternatives.map((slot) => (
                  <li key={`${slot.cycleDayIndex}-${slot.periodId}`}>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto w-full justify-start whitespace-normal py-2 text-left text-sm"
                      disabled={isSubmitting}
                      onClick={() => onPickAlternative(slot)}
                    >
                      {slot.summary}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              ref={cancelButtonRef}
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={isSubmitting} onClick={onKeepConflicting}>
              Keep conflicting placement
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
