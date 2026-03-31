import type { Meta, StoryObj } from '@storybook/react'
import { GeneratorStatusBar } from '@/components/domain/generator-status-bar'

const meta = {
  title: 'Domain/GeneratorStatusBar',
  component: GeneratorStatusBar,
} satisfies Meta<typeof GeneratorStatusBar>

export default meta

export const Running: StoryObj<typeof GeneratorStatusBar> = {
  args: {
    phase: 'running',
    message: 'Placing 340 lessons…',
  },
}

export const Done: StoryObj<typeof GeneratorStatusBar> = {
  args: {
    phase: 'succeeded',
    message: 'Done',
  },
}

export const Failed: StoryObj<typeof GeneratorStatusBar> = {
  args: {
    phase: 'failed',
    message: 'Could not place all lessons.',
  },
}
