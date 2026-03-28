import { useOnboardingStore } from '@/store/onboardingStore'
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'
import { SetupChecklist } from '@/features/onboarding/components/SetupChecklist'

// Institution setup dashboard.
// Shows the onboarding wizard until it is completed, then shows the setup checklist.
export default function DashboardPage() {
  const wizardCompleted = useOnboardingStore((s) => s.wizardCompleted)

  if (!wizardCompleted) {
    return <OnboardingWizard />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Setup Dashboard
      </h1>
      <SetupChecklist />
    </div>
  )
}
