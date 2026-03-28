// Numbered step progress indicator for the onboarding wizard (UX-DR23).
// Completed steps are clickable to allow non-linear back-navigation.

type WizardStep = {
  label: string
}

type WizardStepIndicatorProps = {
  steps: WizardStep[]
  currentStep: number // 1-indexed
  completedUpTo: number // highest step the user has reached (1-indexed)
  onStepClick: (step: number) => void
}

export function WizardStepIndicator({
  steps,
  currentStep,
  completedUpTo,
  onStepClick,
}: WizardStepIndicatorProps) {
  return (
    <nav aria-label="Onboarding steps">
      <ol className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isReachable = stepNumber <= completedUpTo

          return (
            <li key={step.label} className="flex items-center gap-2">
              {idx > 0 && (
                <div
                  className="h-px w-8 flex-shrink-0"
                  style={{
                    backgroundColor: isCompleted
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                  }}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                onClick={() => isReachable && onStepClick(stepNumber)}
                disabled={!isReachable || isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${stepNumber}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                className="flex flex-col items-center gap-1 disabled:cursor-default"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: isCompleted || isCurrent
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {isCompleted ? '✓' : stepNumber}
                </span>
                <span
                  className="hidden text-xs font-medium sm:block"
                  style={{
                    color: isCurrent
                      ? 'var(--color-primary)'
                      : isCompleted
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
