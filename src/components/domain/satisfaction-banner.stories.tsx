import type { Meta, StoryObj } from '@storybook/react'
import { SatisfactionBanner } from '@/components/domain/satisfaction-banner'
import type { ConstraintSatisfactionReport } from '@/types/engine.types'

const meta = {
  title: 'Domain/SatisfactionBanner',
  component: SatisfactionBanner,
} satisfies Meta<typeof SatisfactionBanner>

export default meta

const baseReport: ConstraintSatisfactionReport = {
  overallPercentage: 94,
  softFullySatisfied: 8,
  softPartiallySatisfied: 2,
  softNotSatisfied: 1,
  softPreferences: [],
  hardConstraints: [],
}

export const HighSatisfaction: StoryObj<typeof SatisfactionBanner> = {
  args: {
    report: baseReport,
    onViewDetails: () => undefined,
  },
}

export const BelowThreshold: StoryObj<typeof SatisfactionBanner> = {
  args: {
    report: { ...baseReport, overallPercentage: 72, softPartiallySatisfied: 5, softNotSatisfied: 4 },
    onViewDetails: () => undefined,
  },
}

export const WithHardConflict: StoryObj<typeof SatisfactionBanner> = {
  args: {
    report: {
      ...baseReport,
      overallPercentage: 88,
      hardConstraints: [
        { id: 'hc-1', name: 'No teacher double-booking', satisfied: false, conflictDescription: 'Ms Smith double-booked on Day 2 Period 3' },
      ],
    },
    onViewDetails: () => undefined,
  },
}

export const ExactThreshold: StoryObj<typeof SatisfactionBanner> = {
  args: {
    report: { ...baseReport, overallPercentage: 85 },
    onViewDetails: () => undefined,
  },
}
