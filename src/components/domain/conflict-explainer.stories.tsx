import type { Meta, StoryObj } from '@storybook/react'
import { ConflictExplainer } from '@/components/domain/conflict-explainer'
import type { ConflictReportDto } from '@/types/engine.types'
import type { BellPeriod } from '@/types/bell-schedule.types'

const meta = {
  title: 'Domain/ConflictExplainer',
  component: ConflictExplainer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ConflictExplainer>

export default meta

const PERIODS: BellPeriod[] = [
  { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
  { id: 'p2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
  { id: 'p3', name: 'Period 3', startTime: '10:30', endTime: '11:30' },
]

const ONE_CONFLICT: ConflictReportDto = {
  conflicts: [
    {
      id: 'conflict-1',
      constraintId: 'hc-4',
      constraintName: 'Teacher forbidden slots respected',
      explanation:
        'Jane Smith cannot cover Year 10B in any available slot because all valid windows overlap with her Forbidden Slot: Friday PM.',
      affectedTeachers: [{ id: 'teacher-2', name: 'Jane Smith' }],
      affectedClasses: [{ id: 'class-3', name: 'Year 10B' }],
      affectedSlots: [
        { cycleDayIndex: 4, periodId: 'p2' },
        { cycleDayIndex: 4, periodId: 'p3' },
      ],
    },
  ],
}

const MULTI_CONFLICT: ConflictReportDto = {
  conflicts: [
    ...ONE_CONFLICT.conflicts,
    {
      id: 'conflict-2',
      constraintId: 'hc-1',
      constraintName: 'No teacher double-booking',
      explanation:
        'David Brown is double-booked: Year 9A (Maths) and Year 11C (Maths) are both assigned to Monday Period 2 with no valid alternative slots.',
      affectedTeachers: [{ id: 'teacher-3', name: 'David Brown' }],
      affectedClasses: [
        { id: 'class-1', name: 'Year 9A' },
        { id: 'class-5', name: 'Year 11C' },
      ],
      affectedSlots: [{ cycleDayIndex: 0, periodId: 'p2' }],
    },
  ],
}

const sharedArgs = {
  cycleLengthDays: 5,
  dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  periods: PERIODS,
  onRelaxConstraint: () => undefined,
  onAssignManually: () => undefined,
  onEditSourceData: () => undefined,
  onClose: () => undefined,
}

export const SingleConflict: StoryObj<typeof ConflictExplainer> = {
  args: {
    ...sharedArgs,
    conflictReport: ONE_CONFLICT,
  },
}

export const MultipleConflicts: StoryObj<typeof ConflictExplainer> = {
  args: {
    ...sharedArgs,
    conflictReport: MULTI_CONFLICT,
  },
}

export const NoGridData: StoryObj<typeof ConflictExplainer> = {
  args: {
    ...sharedArgs,
    cycleLengthDays: 0,
    periods: [],
    conflictReport: ONE_CONFLICT,
  },
}
