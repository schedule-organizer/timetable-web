import { useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, MinusCircle, ArrowDownCircle } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { Button } from '@/components/ui/button'
import type {
  ConstraintSatisfactionReport,
  HardConstraintStatusDto,
  RelaxedConstraintSummary,
  SoftPreferenceSatisfactionDto,
} from '@/types/engine.types'

export interface ConstraintSatisfactionSummaryProps {
  report: ConstraintSatisfactionReport
  onClose: () => void
}

const STATUS_LABELS: Record<SoftPreferenceSatisfactionDto['status'], string> = {
  fully_satisfied: 'Fully satisfied',
  partially_satisfied: 'Partially satisfied',
  not_satisfied: 'Not satisfied',
}

function SoftPreferenceRow({ pref }: { pref: SoftPreferenceSatisfactionDto }) {
  const icon =
    pref.status === 'fully_satisfied' ? (
      <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
    ) : pref.status === 'partially_satisfied' ? (
      <MinusCircle className="size-4 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />
    ) : (
      <AlertCircle className="size-4 shrink-0 text-red-500 dark:text-red-400" aria-hidden />
    )

  return (
    <li className="flex items-center gap-3 py-2">
      {icon}
      <span className="min-w-0 flex-1 text-sm text-[--color-text-primary]">{pref.name}</span>
      <span className="shrink-0 text-xs text-[--color-text-secondary]">
        Weight: {pref.weight}
      </span>
      <span
        className={[
          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
          pref.status === 'fully_satisfied'
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : pref.status === 'partially_satisfied'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        ].join(' ')}
      >
        {STATUS_LABELS[pref.status]}
      </span>
    </li>
  )
}

function RelaxedConstraintRow({ item }: { item: RelaxedConstraintSummary }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <ArrowDownCircle
        className="mt-0.5 size-4 shrink-0 text-amber-500 dark:text-amber-400"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[--color-text-primary]">{item.constraintName}</p>
        <p className="mt-0.5 text-xs text-[--color-text-secondary]">{item.handledAs}</p>
      </div>
      <span className="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
        Relaxed
      </span>
    </li>
  )
}

function HardConstraintRow({ constraint }: { constraint: HardConstraintStatusDto }) {
  return (
    <li className="flex items-start gap-3 py-2">
      {constraint.satisfied ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500 dark:text-red-400" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[--color-text-primary]">{constraint.name}</p>
        {constraint.conflictDescription ? (
          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{constraint.conflictDescription}</p>
        ) : null}
      </div>
      <span
        className={[
          'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
          constraint.satisfied
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        ].join(' ')}
      >
        {constraint.satisfied ? 'Satisfied' : 'Violated'}
      </span>
    </li>
  )
}

/**
 * Full constraint satisfaction summary modal (AC2).
 * Lists every soft preference with status + weight, and every hard constraint.
 */
export function ConstraintSatisfactionSummary({ report, onClose }: ConstraintSatisfactionSummaryProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button on open; close on Escape
  useEffect(() => {
    closeRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <ModalPortal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Constraint satisfaction summary"
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[80vh] max-w-2xl -translate-y-1/2 overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface] shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--color-border] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[--color-text-primary]">
              Constraint satisfaction report
            </h2>
            <p className="mt-0.5 text-sm text-[--color-text-secondary]">
              {report.overallPercentage}% overall — {report.softFullySatisfied} fully satisfied,{' '}
              {report.softPartiallySatisfied} partial, {report.softNotSatisfied} unmet
            </p>
          </div>
          <Button
            ref={closeRef}
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close constraint satisfaction report"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(80vh - 4rem)' }}>
          {/* Relaxed constraints — shown when formerly-hard constraints were downgraded for this run */}
          {report.relaxedConstraints && report.relaxedConstraints.length > 0 ? (
            <section aria-label="Relaxed constraints" className="mb-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[--color-text-secondary]">
                Relaxed for this run
              </h3>
              <p className="mb-2 text-xs text-[--color-text-secondary]">
                These hard constraints were downgraded to soft preferences for this run only. Your
                saved configuration is unchanged.
              </p>
              <ul aria-label="Relaxed constraint list" className="divide-y divide-[--color-border]">
                {report.relaxedConstraints.map((item) => (
                  <RelaxedConstraintRow key={item.constraintId} item={item} />
                ))}
              </ul>
            </section>
          ) : null}

          {/* Hard constraints */}
          {report.hardConstraints.length > 0 ? (
            <section aria-label="Hard constraints">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[--color-text-secondary]">
                Hard constraints
              </h3>
              <ul aria-label="Hard constraint list" className="divide-y divide-[--color-border]">
                {report.hardConstraints.map((hc) => (
                  <HardConstraintRow key={hc.id} constraint={hc} />
                ))}
              </ul>
            </section>
          ) : null}

          {/* Soft preferences */}
          {report.softPreferences.length > 0 ? (
            <section aria-label="Soft preferences" className="mt-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[--color-text-secondary]">
                Soft preferences
              </h3>
              <ul aria-label="Soft preference list" className="divide-y divide-[--color-border]">
                {report.softPreferences.map((pref) => (
                  <SoftPreferenceRow key={pref.id} pref={pref} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </ModalPortal>
  )
}
