import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AssignmentConflictPopover } from '@/features/timetable/components/assignment-conflict-popover'
import type { SchedulingConflictDetails } from '@/types/timetable.types'

const mockDetails: SchedulingConflictDetails = {
  reason: 'TEACHER_DOUBLE_BOOKED',
  conflictingLessonId: 'lesson-a',
  alternatives: [{ cycleDayIndex: 0, periodId: 'period-mock-1', summary: 'Day A · Period 1' }],
}

describe('AssignmentConflictPopover', () => {
  beforeEach(() => {
    if (!document.getElementById('root')) {
      const root = document.createElement('div')
      root.id = 'root'
      document.body.prepend(root)
    }
  })
  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(
      <AssignmentConflictPopover
        open
        details={mockDetails}
        isSubmitting={false}
        onPickAlternative={vi.fn()}
        onKeepConflicting={vi.fn()}
        onClose={onClose}
      />,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-describedby',
      'assignment-conflict-description',
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves initial focus to Cancel', async () => {
    render(
      <AssignmentConflictPopover
        open
        details={mockDetails}
        isSubmitting={false}
        onPickAlternative={vi.fn()}
        onKeepConflicting={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('sets #root inert while open so the main app is not in the tab order', () => {
    const root = document.getElementById('root')!
    expect(root.inert).toBe(false)

    const { unmount } = render(
      <AssignmentConflictPopover
        open
        details={mockDetails}
        isSubmitting={false}
        onPickAlternative={vi.fn()}
        onKeepConflicting={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(root.inert).toBe(true)
    unmount()
    expect(root.inert).toBe(false)
  })
})
