import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { DraftTimetablePreview } from './draft-timetable-preview'

describe('DraftTimetablePreview', () => {
  it('renders a lesson label in the correct cell', () => {
    render(
      <DraftTimetablePreview
        cycleLengthDays={2}
        dayLabels={['D1', 'D2']}
        periods={[
          { id: 'p1', name: 'P1', startTime: '09:00', endTime: '10:00' },
        ]}
        lessons={[
          {
            id: 'l1',
            cycleDayIndex: 0,
            periodId: 'p1',
            classId: 'c1',
            className: '7A',
            subjectId: 's1',
            subjectName: 'Math',
            teacherId: 't1',
            teacherName: 'A. Teacher',
            roomId: 'r1',
            roomName: '101',
          },
        ]}
      />,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Math')).toBeInTheDocument()
    expect(screen.getByText(/7A · A\. Teacher · 101/)).toBeInTheDocument()
  })
})
