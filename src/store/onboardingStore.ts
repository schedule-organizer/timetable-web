import { create } from 'zustand'

// Tracks wizard completion state for the institution onboarding wizard (Story 1.5).
// In mock-first mode this is in-memory only; swapping to backend-backed state
// (e.g. GET /api/v1/settings/onboarding-status) requires no component changes.

interface OnboardingStore {
  /** True when the Timetabler has completed all wizard steps. */
  wizardCompleted: boolean
  markWizardCompleted: () => void
  /** Resets to initial state — used in tests. */
  resetWizard: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  wizardCompleted: false,
  markWizardCompleted: () => set({ wizardCompleted: true }),
  resetWizard: () => set({ wizardCompleted: false }),
}))
