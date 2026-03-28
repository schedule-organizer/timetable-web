import { useState } from 'react'
import { WizardStepIndicator } from './WizardStepIndicator'
import { TemplateSelectionStep } from './TemplateSelectionStep'
import { AppliedSummaryStep } from './AppliedSummaryStep'
import { SetupChecklist } from './SetupChecklist'
import { Button } from '@/components/ui/button'
import { useApplyTemplate } from '@/api/hooks/useTemplates'
import { useOnboardingStore } from '@/store/onboardingStore'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { InstitutionTemplate, AppliedTemplateSettings } from '@/types/template.types'

const WIZARD_STEPS = [
  { label: 'Choose Template' },
  { label: 'Review Defaults' },
  { label: 'Setup Complete' },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedUpTo, setCompletedUpTo] = useState(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [appliedSettings, setAppliedSettings] = useState<AppliedTemplateSettings | null>(null)

  const { mutate: applyTemplate, isPending, error: applyError } = useApplyTemplate()
  const markWizardCompleted = useOnboardingStore((s) => s.markWizardCompleted)

  function goToStep(step: number) {
    if (step > completedUpTo) return
    setCurrentStep(step)
  }

  function handleTemplateSelected(templateId: string) {
    setSelectedTemplateId(templateId)
  }

  function handleApplyTemplate(template: InstitutionTemplate) {
    applyTemplate(
      { templateId: template.id },
      {
        onSuccess: (data) => {
          setAppliedSettings(data)
          setCurrentStep(2)
          setCompletedUpTo(2)
        },
      },
    )
  }

  function handleSummaryNext() {
    setCurrentStep(3)
    setCompletedUpTo(3)
  }

  function handleSummaryBack() {
    setCurrentStep(1)
  }

  function handleFinish() {
    markWizardCompleted()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Welcome to SchediFlow
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Let's set up your institution. This takes about 2 minutes.
        </p>
      </div>

      <div className="mb-8">
        <WizardStepIndicator
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          completedUpTo={completedUpTo}
          onStepClick={goToStep}
        />
      </div>

      <div
        className="rounded-lg border p-6"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {WIZARD_STEPS[currentStep - 1]?.label}
        </h2>

        {applyError && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-800">{getApiErrorMessage(applyError)}</p>
          </div>
        )}

        {currentStep === 1 && (
          <TemplateSelectionStep
            selectedTemplateId={selectedTemplateId}
            onSelect={handleTemplateSelected}
            onNext={handleApplyTemplate}
          />
        )}

        {currentStep === 1 && isPending && (
          <div role="status" className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Applying template…
          </div>
        )}

        {currentStep === 2 && appliedSettings && (
          <AppliedSummaryStep
            appliedSettings={appliedSettings}
            onNext={handleSummaryNext}
            onBack={handleSummaryBack}
          />
        )}

        {currentStep === 3 && (
          <div>
            <SetupChecklist />
            <div className="mt-8 flex justify-end">
              <Button type="button" onClick={handleFinish}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
