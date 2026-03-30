import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SensitivityPanel } from './sensitivity-panel'

export default {
  component: SensitivityPanel,
  title: 'Domain/SensitivityPanel',
  parameters: { layout: 'fullscreen' },
  args: {
    onApplyAndReRun: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof SensitivityPanel>

type Story = StoryObj<typeof SensitivityPanel>

export const Default: Story = {
  args: {
    open: true,
    constraintId: 'hc-4',
    constraintName: 'Teacher forbidden slots respected',
    conflictExplanation:
      'Jane Smith cannot cover Year 10B in any available slot because all valid windows overlap with her Forbidden Slot: Friday PM.',
    impactPreviewLine:
      'Fri PM may be assigned to Jane Smith even when this constraint would otherwise forbid it.',
  },
}

export const DoubleBooking: Story = {
  args: {
    open: true,
    constraintId: 'hc-1',
    constraintName: 'No teacher double-booking',
    conflictExplanation:
      'David Brown is double-booked: Year 9A (Maths) and Year 11C (Maths) are both assigned to Monday Period 2 with no valid alternative slots.',
  },
}

export const Closed: Story = {
  args: {
    open: false,
    constraintId: 'hc-4',
    constraintName: 'Teacher forbidden slots respected',
    conflictExplanation: 'Jane Smith cannot cover Year 10B.',
  },
}
