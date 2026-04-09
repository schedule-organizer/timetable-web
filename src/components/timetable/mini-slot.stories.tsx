import type { Meta, StoryObj } from '@storybook/react'
import { MiniSlot } from './mini-slot'
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
  component: MiniSlot,
  title: 'Timetable/MiniSlot',
  parameters: { layout: 'centered' },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 90 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MiniSlot>

type Story = StoryObj<typeof MiniSlot>

export const Default: Story = {
  args: { lesson: baseLesson, size: 'sm' },
}

export const Pinned: Story = {
  args: { lesson: { ...baseLesson, isPinned: true }, size: 'sm' },
}

export const Conflict: Story = {
  args: { lesson: { ...baseLesson, hasConflict: true }, size: 'sm' },
}

export const PinnedAndConflict: Story = {
  args: { lesson: { ...baseLesson, isPinned: true, hasConflict: true }, size: 'sm' },
}

export const Medium: Story = {
  args: { lesson: baseLesson, size: 'md' },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 120 }}>
        <Story />
      </div>
    ),
  ],
}
