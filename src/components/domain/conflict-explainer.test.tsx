import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { ConflictExplainer } from './conflict-explainer'
import type { ConflictReportDto } from '@/types/engine.types'
import type { BellPeriod } from '@/types/bell-schedule.types'

const MOCK_PERIODS: BellPeriod[] = [
  { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
  { id: 'p2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
]

const MOCK_CONFLICT_REPORT: ConflictReportDto = {
  conflicts: [
    {
      id: 'conflict-1',
      constraintId: 'hc-4',
      constraintName: 'Teacher forbidden slots respected',
      explanation:
        'Jane Smith cannot cover Year 10B in any available slot because all valid windows overlap with her Forbidden Slot: Friday PM.',
      affectedTeachers: [{ id: 'teacher-2', name: 'Jane Smith' }],
      affectedClasses: [{ id: 'class-3', name: 'Year 10B' }],
      affectedSlots: [{ cycleDayIndex: 1, periodId: 'p1' }],
    },
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

const defaultProps = {
  conflictReport: MOCK_CONFLICT_REPORT,
  cycleLengthDays: 3,
  dayLabels: ['Mon', 'Tue', 'Wed'],
  periods: MOCK_PERIODS,
  onRelaxConstraint: vi.fn(),
  onAssignManually: vi.fn(),
  onEditSourceData: vi.fn(),
  onClose: vi.fn(),
}

describe('ConflictExplainer', () => {
  it('renders section with accessible label', () => {
    render(<ConflictExplainer {...defaultProps} />)
    expect(screen.getByRole('region', { name: /conflict explainer/i })).toBeInTheDocument()
  })

  it('shows failure heading and conflict count', () => {
    render(<ConflictExplainer {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /schedule generation failed/i })).toBeInTheDocument()
    expect(screen.getByText(/2 hard constraint conflicts detected/i)).toBeInTheDocument()
  })

  it('shows singular conflict count when only one conflict', () => {
    const report: ConflictReportDto = {
      conflicts: [MOCK_CONFLICT_REPORT.conflicts[0]],
    }
    render(<ConflictExplainer {...defaultProps} conflictReport={report} />)
    expect(screen.getByText(/1 hard constraint conflict detected/i)).toBeInTheDocument()
  })

  it('renders plain-language explanation for each conflict', () => {
    render(<ConflictExplainer {...defaultProps} />)
    expect(
      screen.getByText(/Jane Smith cannot cover Year 10B/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/David Brown is double-booked/i),
    ).toBeInTheDocument()
  })

  it('renders affected teacher and class chips', () => {
    render(<ConflictExplainer {...defaultProps} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Year 10B')).toBeInTheDocument()
    expect(screen.getByText('David Brown')).toBeInTheDocument()
    expect(screen.getByText('Year 9A')).toBeInTheDocument()
    expect(screen.getByText('Year 11C')).toBeInTheDocument()
  })

  it('calls onRelaxConstraint with conflict id when "Relax constraint" clicked', async () => {
    const onRelaxConstraint = vi.fn()
    render(<ConflictExplainer {...defaultProps} onRelaxConstraint={onRelaxConstraint} />)
    const relaxButtons = screen.getAllByRole('button', { name: /relax constraint/i })
    await userEvent.click(relaxButtons[0])
    expect(onRelaxConstraint).toHaveBeenCalledWith('conflict-1')
  })

  it('calls onAssignManually when "Assign manually" clicked', async () => {
    const onAssignManually = vi.fn()
    render(<ConflictExplainer {...defaultProps} onAssignManually={onAssignManually} />)
    const buttons = screen.getAllByRole('button', { name: /assign manually/i })
    await userEvent.click(buttons[0])
    expect(onAssignManually).toHaveBeenCalledTimes(1)
  })

  it('calls onEditSourceData when "Edit source data" clicked', async () => {
    const onEditSourceData = vi.fn()
    render(<ConflictExplainer {...defaultProps} onEditSourceData={onEditSourceData} />)
    const buttons = screen.getAllByRole('button', { name: /edit source data/i })
    await userEvent.click(buttons[0])
    expect(onEditSourceData).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(<ConflictExplainer {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close conflict explainer/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders mini grid with affected slot aria labels', () => {
    render(<ConflictExplainer {...defaultProps} />)
    // Day 2 / Period 1 is affected for conflict-1
    expect(screen.getByLabelText(/Tue Period 1 — conflict/i)).toBeInTheDocument()
  })

  it('shows technical details when expanded', async () => {
    render(<ConflictExplainer {...defaultProps} />)
    const detailsButtons = screen.getAllByRole('button', { name: /technical details/i })
    expect(detailsButtons[0]).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(detailsButtons[0])
    expect(detailsButtons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('hc-4')).toBeInTheDocument()
  })

  it('hides technical details by default (collapsed)', () => {
    render(<ConflictExplainer {...defaultProps} />)
    expect(screen.queryByText('hc-4')).not.toBeInTheDocument()
    expect(screen.queryByText('hc-1')).not.toBeInTheDocument()
  })
})
