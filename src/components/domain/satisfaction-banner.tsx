import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import type { ConstraintSatisfactionReport } from '@/types/engine.types'
import { Button } from '@/components/ui/button'

export interface SatisfactionBannerProps {
  report: ConstraintSatisfactionReport
  onViewDetails: () => void
}

/**
 * Displays a summary banner after the schedule generator completes (AC1, AC3).
 * Green treatment when overall satisfaction is ≥85%; amber otherwise.
 */
export function SatisfactionBanner({ report, onViewDetails }: SatisfactionBannerProps) {
  const isPositive = report.overallPercentage >= 85
  const hasHardConflicts = report.hardConstraints.some((hc) => !hc.satisfied)

  const variant = isPositive && !hasHardConflicts ? 'positive' : 'warning'

  return (
    <div
      role="status"
      data-variant={variant}
      aria-label={`Schedule satisfaction: ${report.overallPercentage}%`}
      className={[
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
        variant === 'positive'
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
          : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {variant === 'positive' ? (
          <CheckCircle2
            className="size-5 shrink-0 text-green-600 dark:text-green-400"
            aria-hidden
          />
        ) : (
          <AlertCircle
            className="size-5 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden
          />
        )}

        <span
          className={
            variant === 'positive'
              ? 'font-semibold text-green-800 dark:text-green-200'
              : 'font-semibold text-amber-800 dark:text-amber-200'
          }
        >
          {report.overallPercentage}% of preferences satisfied
        </span>

        <span
          className={
            variant === 'positive'
              ? 'text-green-700 dark:text-green-300'
              : 'text-amber-700 dark:text-amber-300'
          }
          aria-label={`${report.softFullySatisfied} fully satisfied, ${report.softPartiallySatisfied} partially satisfied, ${report.softNotSatisfied} not satisfied`}
        >
          <span aria-hidden>
            {report.softFullySatisfied} full · {report.softPartiallySatisfied} partial ·{' '}
            {report.softNotSatisfied} unmet
          </span>
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onViewDetails}
        aria-label="View full constraint satisfaction details"
        className={
          variant === 'positive'
            ? 'text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900'
            : 'text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900'
        }
      >
        View details
        <ChevronRight className="ml-1 size-4" aria-hidden />
      </Button>
    </div>
  )
}
