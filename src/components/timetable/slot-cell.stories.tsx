import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SlotCell } from './slot-cell'
import type { LessonDto } from '@/types/timetable.types'

const baseLesson: LessonDto = {
  id: 'lesson-1',
  cycleDayIndex: 0,
  periodId: 'period-1',
  classId: 'class-1',
  className: 'Year 7A',
  yearGroup: 'Year 7',
  subjectId: 'subject-1',
  subjectName: 'Mathematics',
  subjectColorHex: '#3b82f6',
  teacherId: 'teacher-1',
  teacherName: 'Alice Brown',
  roomId: 'room-1',
  roomName: 'R101',
  isPinned: false,
  hasConflict: false,
}

export default {
  component: SlotCell,
  title: 'Timetable/SlotCell',
  parameters: { layout: 'centered' },
  args: {
    tabIndex: 0,
    isSelected: false,
    onFocus: fn(),
    onKeyDown: fn(),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 100 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SlotCell>

type Story = StoryObj<typeof SlotCell>

export const Filled: Story = {
  args: {
    lesson: baseLesson,
    ariaLabel: 'Year 7A Day A Period 1 — Mathematics Alice Brown',
  },
}

export const Empty: Story = {
  args: {
    lesson: undefined,
    ariaLabel: 'Year 7A Day A Period 1 — Empty',
  },
}

export const Conflict: Story = {
  args: {
    lesson: { ...baseLesson, hasConflict: true },
    ariaLabel: 'Year 7A Day A Period 1 — Mathematics Alice Brown (conflict)',
  },
}

export const Pinned: Story = {
  args: {
    lesson: { ...baseLesson, isPinned: true },
    ariaLabel: 'Year 7A Day A Period 1 — Mathematics Alice Brown (pinned)',
  },
}

export const Selected: Story = {
  args: {
    lesson: baseLesson,
    ariaLabel: 'Year 7A Day A Period 1 — Mathematics Alice Brown',
    isSelected: true,
  },
}
