import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export type GeneratorStatusPhase = 'idle' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface GeneratorStatusBarProps {
  phase: GeneratorStatusPhase
  /** Shown for running / terminal states; keep short for the status strip. */
  message: string
}

/**
 * Non-blocking status strip for long-running engine work (UX-DR9).
 * Uses a polite live region so assistive tech announces progress updates.
 */
export function GeneratorStatusBar({ phase, message }: GeneratorStatusBarProps) {
  if (phase === 'idle' && !message) {
    return null
  }

  const showSpinner = phase === 'running'
  const success = phase === 'succeeded'
  const problem = phase === 'failed' || phase === 'cancelled'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={showSpinner}
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
      {problem ? (
        <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
      ) : null}
      <span className={success ? 'font-medium text-green-700 dark:text-green-400' : undefined}>
        {message}
      </span>
    </div>
  )
}
