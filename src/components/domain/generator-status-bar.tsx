import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type GeneratorStatusPhase = 'idle' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface GeneratorStatusBarPrimaryAction {
  label: string
  onClick: () => void
  disabled?: boolean
  /** Shown as native `title` when `disabled` is true (e.g. tooltip). */
  disabledTooltip?: string
}

export interface GeneratorStatusBarProps {
  phase: GeneratorStatusPhase
  /** Shown for running / terminal states; keep short for the status strip. */
  message: string
  /** Called when the user clicks "View conflicts" in the failed state (UX-DR9). */
  onViewConflicts?: () => void
  /** Optional primary action (e.g. partial re-run on unpinned slots). */
  primaryAction?: GeneratorStatusBarPrimaryAction
}

/**
 * Non-blocking status strip for long-running engine work (UX-DR9).
 * Uses a polite live region so assistive tech announces progress updates.
 */
export function GeneratorStatusBar({
  phase,
  message,
  onViewConflicts,
  primaryAction,
}: GeneratorStatusBarProps) {
  if (phase === 'idle' && !message && !primaryAction) {
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
          'min-w-0 flex-1',
          success ? 'font-medium text-green-700 dark:text-green-400' : '',
          failed ? 'text-red-700 dark:text-red-400' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {message}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {primaryAction ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={primaryAction.disabled}
            title={primaryAction.disabled ? primaryAction.disabledTooltip : undefined}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        ) : null}
        {failed && onViewConflicts ? (
          <button
            type="button"
            onClick={onViewConflicts}
            className="text-xs font-medium text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label="View conflict details"
          >
            View conflicts
          </button>
        ) : null}
      </div>
    </div>
  )
}
