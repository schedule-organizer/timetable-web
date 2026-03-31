import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { TimetableGrid, countUnpinnedSlotsForSolver } from './timetable-grid'
import type { LessonDto } from '@/types/timetable.types'
import type { BellPeriod } from '@/types/bell-schedule.types'

const periods: BellPeriod[] = [
  { id: 'p1', name: 'P1', startTime: '08:00', endTime: '09:00' },
  { id: 'p2', name: 'P2', startTime: '09:00', endTime: '10:00' },
]

const lessons: LessonDto[] = [
  {
    id: 'lesson-a',
    cycleDayIndex: 0,
    periodId: 'p1',
    classId: 'class-1',
    className: 'Year 7A',
    yearGroup: 'Year 7',
    subjectId: 'sub-1',
    subjectName: 'Mathematics',
    subjectColorHex: '#3b82f6',
    teacherId: 'teacher-1',
    teacherName: 'Alice Brown',
    roomId: 'room-1',
    roomName: 'R101',
    isPinned: false,
    hasConflict: false,
  },
  {
    id: 'lesson-b',
    cycleDayIndex: 0,
    periodId: 'p1',
    classId: 'class-2',
    className: 'Year 8A',
    yearGroup: 'Year 8',
    subjectId: 'sub-2',
    subjectName: 'English',
    subjectColorHex: '#10b981',
    teacherId: 'teacher-2',
    teacherName: 'Bob Smith',
    roomId: 'room-2',
    roomName: 'R102',
    isPinned: false,
    hasConflict: true,
  },
  {
    id: 'lesson-c',
    cycleDayIndex: 1,
    periodId: 'p1',
    classId: 'class-1',
    className: 'Year 7A',
    yearGroup: 'Year 7',
    subjectId: 'sub-1',
    subjectName: 'Mathematics',
    subjectColorHex: '#3b82f6',
    teacherId: 'teacher-1',
    teacherName: 'Alice Brown',
    roomId: 'room-1',
    roomName: 'R101',
    isPinned: true,
    hasConflict: false,
  },
]

const defaultProps = {
  lessons,
  view: 'class' as const,
  cycleLengthDays: 2,
  dayLabels: ['Day A', 'Day B'],
  periods,
}

describe('TimetableGrid', () => {
  it('countUnpinnedSlotsForSolver returns total cells minus pinned lessons visible on the grid', () => {
    expect(
      countUnpinnedSlotsForSolver(lessons, 'class', null, 2, ['Day A', 'Day B'], periods),
    ).toBe(7)
  })

  it('countUnpinnedSlotsForSolver ignores pinned lessons in rows hidden by year-group filter', () => {
    // Only Year 8 row is shown; pinned lesson-c is Year 7 — not on the grid, so no pinned cells.
    expect(
      countUnpinnedSlotsForSolver(lessons, 'class', 'Year 8', 2, ['Day A', 'Day B'], periods),
    ).toBe(4)
  })

  it('opens context menu on right-click and calls onPinSlot', async () => {
    const onPinSlot = vi.fn()
    const onUnpinSlot = vi.fn()
    render(
      <TimetableGrid
        {...defaultProps}
        onPinSlot={onPinSlot}
        onUnpinSlot={onUnpinSlot}
      />,
    )
    const user = userEvent.setup()
    const grid = screen.getByRole('grid')
    const firstCell = grid.querySelector('[role="gridcell"]') as HTMLElement
    await user.pointer({ keys: '[MouseRight>]', target: firstCell })
    const pinItem = await screen.findByRole('menuitem', { name: 'Pin' })
    await user.click(pinItem)
    expect(onPinSlot).toHaveBeenCalledWith('lesson-a')
  })

  it('renders with role="grid"', () => {
    render(<TimetableGrid {...defaultProps} />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('has aria-rowcount and aria-colcount', () => {
    render(<TimetableGrid {...defaultProps} />)
    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('aria-rowcount')
    expect(grid).toHaveAttribute('aria-colcount')
  })

  it('renders class rows', () => {
    render(<TimetableGrid {...defaultProps} />)
    expect(screen.getByText('Year 7A')).toBeInTheDocument()
    expect(screen.getByText('Year 8A')).toBeInTheDocument()
  })

  it('renders day group headers', () => {
    render(<TimetableGrid {...defaultProps} />)
    expect(screen.getByText('Day A')).toBeInTheDocument()
    expect(screen.getByText('Day B')).toBeInTheDocument()
  })

  it('renders year-group labels in class view', () => {
    render(<TimetableGrid {...defaultProps} />)
    expect(screen.getByText('Year 7')).toBeInTheDocument()
    expect(screen.getByText('Year 8')).toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(<TimetableGrid {...defaultProps} lessons={[]} isLoading />)
    expect(screen.getByLabelText('Loading timetable')).toBeInTheDocument()
  })

  it('renders cells with aria-label including class, day, period info', () => {
    render(<TimetableGrid {...defaultProps} />)
    const emptyCell = screen.getByLabelText(/Year 7A Day A P1.*Mathematics/)
    expect(emptyCell).toBeInTheDocument()
  })

  it('announces empty cells', () => {
    render(<TimetableGrid {...defaultProps} />)
    // Empty state is carried in gridcell aria-label, not as visible text
    const allGridcells = screen.getAllByRole('gridcell')
    const emptyCells = allGridcells.filter((el) => el.getAttribute('aria-label')?.endsWith('— Empty'))
    expect(emptyCells.length).toBeGreaterThan(0)
  })

  it('conflict cell has data-conflict attribute', () => {
    render(<TimetableGrid {...defaultProps} />)
    const conflictCells = document.querySelectorAll('[data-conflict="true"]')
    expect(conflictCells.length).toBeGreaterThan(0)
  })

  it('conflict cell has text indicator (not colour alone)', () => {
    render(<TimetableGrid {...defaultProps} />)
    // The visible "⚠ Conflict" text must appear (aria-hidden so AT reads gridcell label instead)
    expect(screen.getByText('⚠ Conflict')).toBeInTheDocument()
    // The gridcell aria-label must also announce conflict state
    const conflictGridcell = document.querySelector('[data-conflict="true"]') as HTMLElement
    expect(conflictGridcell?.getAttribute('aria-label')).toMatch(/\(conflict\)/)
  })

  it('filters by year group when yearGroupFilter is set', () => {
    render(<TimetableGrid {...defaultProps} yearGroupFilter="Year 7" />)
    expect(screen.getByText('Year 7A')).toBeInTheDocument()
    expect(screen.queryByText('Year 8A')).not.toBeInTheDocument()
  })

  it('shows teacher rows in teacher view', () => {
    render(<TimetableGrid {...defaultProps} view="teacher" />)
    expect(screen.getByText('Alice Brown')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
  })

  it('shows room rows in room view', () => {
    render(<TimetableGrid {...defaultProps} view="room" />)
    expect(screen.getByText('R101')).toBeInTheDocument()
    expect(screen.getByText('R102')).toBeInTheDocument()
  })

  it('calls onSlotPin when Space is pressed on a filled cell', async () => {
    const onSlotPin = vi.fn()
    render(<TimetableGrid {...defaultProps} onSlotPin={onSlotPin} />)
    const user = userEvent.setup()

    const grid = screen.getByRole('grid')
    // Focus first cell via tab
    const firstCell = grid.querySelector('[role="gridcell"]') as HTMLElement
    firstCell?.focus()

    await user.keyboard(' ')
    expect(onSlotPin).toHaveBeenCalledWith('lesson-a')
  })

  it('calls onSlotOpen when Enter is pressed on a filled cell', async () => {
    const onSlotOpen = vi.fn()
    render(<TimetableGrid {...defaultProps} onSlotOpen={onSlotOpen} />)
    const user = userEvent.setup()

    const grid = screen.getByRole('grid')
    const firstCell = grid.querySelector('[role="gridcell"]') as HTMLElement
    firstCell?.focus()

    await user.keyboard('{Enter}')
    expect(onSlotOpen).toHaveBeenCalledWith('lesson-a')
  })

  it('moves focus with arrow keys', async () => {
    render(<TimetableGrid {...defaultProps} />)
    const user = userEvent.setup()

    const grid = screen.getByRole('grid')
    const cells = grid.querySelectorAll('[role="gridcell"]')
    const firstCell = cells[0] as HTMLElement
    firstCell?.focus()

    expect(document.activeElement).toBe(firstCell)
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).not.toBe(firstCell)
  })

  it('deselects on Escape', async () => {
    const onSlotOpen = vi.fn()
    render(<TimetableGrid {...defaultProps} onSlotOpen={onSlotOpen} />)
    const user = userEvent.setup()

    const grid = screen.getByRole('grid')
    const firstCell = grid.querySelector('[role="gridcell"]') as HTMLElement
    firstCell?.focus()

    await user.keyboard('{Enter}')
    await user.keyboard('{Escape}')
    // After escape, no cell should be aria-selected
    const selectedCells = screen.queryAllByRole('gridcell', { selected: true })
    expect(selectedCells).toHaveLength(0)
  })
})
