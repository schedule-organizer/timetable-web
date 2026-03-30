import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export type GeneratorStatusPhase = 'idle' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface GeneratorStatusBarProps {
  phase: GeneratorStatusPhase
  /** Shown for running / terminal states; keep short for the status strip. */
  message: string
  /** Called when the user clicks "View conflicts" in the failed state (UX-DR9). */
  onViewConflicts?: () => void
}

/**
 * Non-blocking status strip for long-running engine work (UX-DR9).
 * Uses a polite live region so assistive tech announces progress updates.
 */
export function GeneratorStatusBar({ phase, message, onViewConflicts }: GeneratorStatusBarProps) {
  if (phase === 'idle' && !message) {
    return null
  }

  const showSpinner = phase === 'running'
  const success = phase === 'succeeded'
  const failed = phase === 'failed'
  const cancelled = phase === 'cancelled'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={showSpinner}
      data-phase={phase}
      className="flex shrink-0 items-center gap-2 border-t border-[--color-border] bg-[--color-surface] px-4 py-2 text-sm"
      style={{ color: 'var(--color-text-primary)' }}
    >
      {showSpinner ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-[--color-text-secondary]" aria-hidden />
      ) : null}
      {success ? (
        <CheckCircle2
          className="size-4 shrink-0 text-green-600 dark:text-green-500"
          aria-hidden
        />
      ) : null}
      {failed ? (
        <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-500" aria-hidden />
      ) : null}
      {cancelled ? (
        <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
      ) : null}
      <span
        className={[
          success ? 'font-medium text-green-700 dark:text-green-400' : '',
          failed ? 'text-red-700 dark:text-red-400' : '',
        ]
          .filter(Boolean)
          .join(' ') || undefined}
      >
        {message}
      </span>
      {failed && onViewConflicts ? (
        <button
          type="button"
          onClick={onViewConflicts}
          className="ml-auto text-xs font-medium text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          aria-label="View conflict details"
        >
          View conflicts
        </button>
      ) : null}
    </div>
  )
}
