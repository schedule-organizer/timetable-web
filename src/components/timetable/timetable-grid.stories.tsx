import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TimetableGrid } from './timetable-grid'
import { buildMockTimetableLessons } from '@/mocks/pages/timetable-page.mock'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'

const lessons = buildMockTimetableLessons()

export default {
  component: TimetableGrid,
  title: 'Timetable/TimetableGrid',
  parameters: { layout: 'fullscreen' },
  args: {
    lessons,
    cycleLengthDays: mockCycleSettings.cycleLengthDays,
    dayLabels: mockCycleSettings.dayLabels,
    periods: mockBellSchedule.periods,
    onSlotPin: fn(),
    onSlotOpen: fn(),
  },
} satisfies Meta<typeof TimetableGrid>

type Story = StoryObj<typeof TimetableGrid>

export const FullSchool: Story = {
  args: { view: 'class' },
}

export const ByTeacher: Story = {
  args: { view: 'teacher' },
}

export const ByRoom: Story = {
  args: { view: 'room' },
}

export const WithYearGroupFilter: Story = {
  args: { view: 'class', yearGroupFilter: 'Year 7' },
}

export const Loading: Story = {
  args: { view: 'class', isLoading: true, lessons: [] },
}

export const Empty: Story = {
  args: { view: 'class', lessons: [] },
}
