import { Button } from '@/components/ui/button'
import type { AppliedTemplateSettings } from '@/types/template.types'

type AppliedSummaryStepProps = {
  appliedSettings: AppliedTemplateSettings
  onNext: () => void
  onBack: () => void
}

export function AppliedSummaryStep({ appliedSettings, onNext, onBack }: AppliedSummaryStepProps) {
  const { templateName, bellSchedule, cycle, terminology } = appliedSettings

  return (
    <div>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        The{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>{templateName}</strong> template has
        been applied. Here is a summary of the pre-populated defaults:
      </p>

      <dl className="space-y-4">
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <dt className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Bell Schedule
          </dt>
          <dd className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {bellSchedule.periodsApplied} periods, {bellSchedule.firstPeriodStart}–
            {bellSchedule.lastPeriodEnd}
          </dd>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <dt className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Cycle
          </dt>
          <dd className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cycle.cycleDescription} ({cycle.cycleLengthDays} days)
          </dd>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <dt className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Terminology
          </dt>
          <dd className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {terminology.overridesApplied.length === 0 ? (
              'SchediFlow defaults — no overrides applied'
            ) : (
              <>
                Custom overrides applied:{' '}
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {terminology.overridesApplied.join(', ')}
                </span>
              </>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Continue to Setup Checklist
        </Button>
      </div>
    </div>
  )
}
