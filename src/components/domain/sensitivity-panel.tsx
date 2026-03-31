import { useEffect, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { Button } from '@/components/ui/button'
import type { ConstraintRelaxation } from '@/types/engine.types'

export interface SensitivityPanelProps {
  open: boolean
  constraintId: string
  constraintName: string
  conflictExplanation: string
  /** Concrete line from conflict + schedule context (UX-DR11); falls back to generic copy if omitted */
  impactPreviewLine?: string
  onApplyAndReRun: (relaxation: ConstraintRelaxation) => void
  onClose: () => void
}

const DEFAULT_WEIGHT = 5

/**
 * Right-drawer panel for constraint sensitivity adjustment (Story 4.4 / FR20 / UX-DR11).
 * Allows a Timetabler to downgrade a specific hard constraint to a soft preference at runtime,
 * without permanently modifying the saved constraint configuration.
 */
export function SensitivityPanel({
  open,
  constraintId,
  constraintName,
  conflictExplanation,
  impactPreviewLine,
  onApplyAndReRun,
  onClose,
}: SensitivityPanelProps) {
  const [mode, setMode] = useState<'hard' | 'soft'>('hard')
  const [weight, setWeight] = useState(DEFAULT_WEIGHT)
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Reset local state whenever the panel opens for a (potentially different) constraint
  useEffect(() => {
    if (open) {
      setMode('hard')
      setWeight(DEFAULT_WEIGHT)
    }
  }, [open, constraintId])

  // Focus cancel on open; close on Escape
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const canApply = mode === 'soft'

  function handleApply() {
    if (!canApply) return
    onApplyAndReRun({ constraintId, constraintName, weight })
  }

  return (
    <ModalPortal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        aria-hidden
        onClick={onClose}
      />

      {/* Right-side drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Relax constraint"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[--color-border] bg-[--color-surface] shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[--color-border] px-5 py-4">
          <h2 className="text-base font-semibold text-[--color-text-primary]">
            Relax constraint
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close sensitivity panel"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {/* Constraint info */}
          <section aria-label="Constraint details">
            <p className="text-sm font-semibold text-[--color-text-primary]">{constraintName}</p>
            <p className="mt-1 text-sm text-[--color-text-secondary]">{conflictExplanation}</p>
          </section>

          {/* Hard / Soft toggle */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[--color-text-primary]">
              Constraint type for this run
            </legend>
            <div
              className="inline-flex rounded-lg border border-[--color-border] bg-[--color-bg] p-0.5"
              role="radiogroup"
              aria-label="Hard or soft"
            >
              {(['hard', 'soft'] as const).map((opt) => (
                <label
                  key={opt}
                  className={[
                    'flex cursor-pointer items-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                    mode === opt
                      ? 'bg-[--color-surface] text-[--color-text-primary] shadow-sm'
                      : 'text-[--color-text-secondary] hover:text-[--color-text-primary]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="constraint-mode"
                    value={opt}
                    checked={mode === opt}
                    onChange={() => setMode(opt)}
                    className="sr-only"
                    aria-label={opt === 'hard' ? 'Hard' : 'Soft'}
                  />
                  {opt === 'hard' ? 'Hard' : 'Soft'}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Weight slider — visible only when Soft */}
          {mode === 'soft' ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="sensitivity-weight"
                className="text-sm font-medium text-[--color-text-primary]"
              >
                Preference weight
                <span className="ml-2 text-sm font-semibold text-[--color-text-primary]">
                  {weight}
                </span>
                <span className="ml-1 text-xs text-[--color-text-secondary]">/ 10</span>
              </label>
              <input
                id="sensitivity-weight"
                type="range"
                role="slider"
                aria-label="Weight"
                min={1}
                max={10}
                step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-[--color-primary]"
              />
              <div className="flex justify-between text-xs text-[--color-text-secondary]">
                <span>1 — low priority</span>
                <span>10 — high priority</span>
              </div>
            </div>
          ) : null}

          {/* Impact preview chip (UX-DR11) — visible only when Soft */}
          {mode === 'soft' ? (
            <div
              role="status"
              aria-label="Impact preview"
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-700 dark:bg-amber-950/40"
            >
              <Info
                className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold">If relaxed:</span>{' '}
                {impactPreviewLine ? (
                  <>
                    {impactPreviewLine} Preference weight {weight} applies; the original
                    constraint definition remains unchanged in your configuration.
                  </>
                ) : (
                  <>
                    The generator may schedule lessons in previously forbidden slots with reduced
                    penalty (weight {weight}). The original constraint definition remains unchanged
                    in your configuration.
                  </>
                )}
              </p>
            </div>
          ) : null}

          {/* Note about config immutability — always visible */}
          <p className="text-xs text-[--color-text-secondary]">
            The original constraint configuration remains unchanged. This relaxation only
            applies to the current generator run.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-[--color-border] px-5 py-4">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            onClick={onClose}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canApply}
            onClick={handleApply}
            aria-label="Apply and re-run"
          >
            Apply and re-run
          </Button>
        </div>
      </div>
    </ModalPortal>
  )
}
