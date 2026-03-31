import type { Meta, StoryObj } from '@storybook/react'
import { ConstraintSatisfactionSummary } from '@/components/domain/constraint-satisfaction-summary'
import type { ConstraintSatisfactionReport } from '@/types/engine.types'

const meta = {
  title: 'Domain/ConstraintSatisfactionSummary',
  component: ConstraintSatisfactionSummary,
} satisfies Meta<typeof ConstraintSatisfactionSummary>

export default meta

const fullReport: ConstraintSatisfactionReport = {
  overallPercentage: 94,
  softFullySatisfied: 8,
  softPartiallySatisfied: 2,
  softNotSatisfied: 1,
  softPreferences: [
    { id: 'pref-1', name: 'Teacher preferred free periods', weight: 80, status: 'fully_satisfied' },
    { id: 'pref-2', name: 'No double-period subjects', weight: 60, status: 'fully_satisfied' },
    { id: 'pref-3', name: 'Max 3 lessons per subject per day', weight: 75, status: 'partially_satisfied' },
    { id: 'pref-4', name: 'Balanced workload per day', weight: 65, status: 'partially_satisfied' },
    { id: 'pref-5', name: 'Preferred room type per subject', weight: 45, status: 'not_satisfied' },
  ],
  hardConstraints: [
    { id: 'hc-1', name: 'No teacher double-booking', satisfied: true },
    { id: 'hc-2', name: 'No room double-booking', satisfied: true },
    { id: 'hc-3', name: 'Teacher forbidden slots respected', satisfied: true },
  ],
}

export const Default: StoryObj<typeof ConstraintSatisfactionSummary> = {
  args: {
    report: fullReport,
    onClose: () => undefined,
  },
}

export const WithHardConflict: StoryObj<typeof ConstraintSatisfactionSummary> = {
  args: {
    report: {
      ...fullReport,
      overallPercentage: 78,
      hardConstraints: [
        { id: 'hc-1', name: 'No teacher double-booking', satisfied: false, conflictDescription: 'Ms Smith double-booked on Day 2 Period 3' },
        { id: 'hc-2', name: 'No room double-booking', satisfied: true },
      ],
    },
    onClose: () => undefined,
  },
}

export const Loading: StoryObj<typeof ConstraintSatisfactionSummary> = {
  args: {
    report: {
      overallPercentage: 0,
      softFullySatisfied: 0,
      softPartiallySatisfied: 0,
      softNotSatisfied: 0,
      softPreferences: [],
      hardConstraints: [],
    },
    onClose: () => undefined,
  },
}
