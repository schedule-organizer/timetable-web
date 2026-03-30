import type { Meta, StoryObj } from '@storybook/react'
import { DraftTimetablePreview } from '@/components/domain/draft-timetable-preview'

const meta = {
  title: 'Domain/DraftTimetablePreview',
  component: DraftTimetablePreview,
  args: {
    cycleLengthDays: 3,
    dayLabels: ['Day A', 'Day B', 'Day C'],
    periods: [
      { id: 'p1', name: 'Period 1', startTime: '09:00', endTime: '10:00' },
      { id: 'p2', name: 'Period 2', startTime: '10:00', endTime: '11:00' },
    ],
    lessons: [
      {
        id: 'l1',
        cycleDayIndex: 0,
        periodId: 'p1',
        classId: 'c1',
        className: 'Year 7 Science',
        subjectId: 's1',
        subjectName: 'Physics',
        teacherId: 't1',
        teacherName: 'Alice Chen',
        roomId: 'r1',
        roomName: 'Room 101',
      },
    ],
  },
} satisfies Meta<typeof DraftTimetablePreview>

export default meta

export const Default: StoryObj<typeof DraftTimetablePreview> = {}
