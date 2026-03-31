import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { ConstraintSatisfactionSummary } from './constraint-satisfaction-summary'
import type { ConstraintSatisfactionReport } from '@/types/engine.types'

const fullReport: ConstraintSatisfactionReport = {
  overallPercentage: 94,
  softFullySatisfied: 8,
  softPartiallySatisfied: 2,
  softNotSatisfied: 1,
  softPreferences: [
    { id: 'pref-1', name: 'Teacher preferred free periods', weight: 80, status: 'fully_satisfied' },
    { id: 'pref-2', name: 'Max 3 lessons per subject per day', weight: 75, status: 'partially_satisfied' },
    { id: 'pref-3', name: 'Preferred room type per subject', weight: 45, status: 'not_satisfied' },
  ],
  hardConstraints: [
    { id: 'hc-1', name: 'No teacher double-booking', satisfied: true },
    { id: 'hc-2', name: 'No room double-booking', satisfied: false, conflictDescription: 'Room A101 double-booked' },
  ],
}

describe('ConstraintSatisfactionSummary', () => {
  it('renders as a dialog with accessible label', () => {
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={() => undefined} />)
    expect(screen.getByRole('dialog', { name: /constraint satisfaction summary/i })).toBeInTheDocument()
  })

  it('shows overall percentage and counts in header', () => {
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={() => undefined} />)
    expect(screen.getByText(/94%/)).toBeInTheDocument()
    expect(screen.getByText(/8 fully satisfied/)).toBeInTheDocument()
  })

  it('lists soft preferences with their names', () => {
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={() => undefined} />)
    expect(screen.getByText('Teacher preferred free periods')).toBeInTheDocument()
    expect(screen.getByText('Max 3 lessons per subject per day')).toBeInTheDocument()
    expect(screen.getByText('Preferred room type per subject')).toBeInTheDocument()
  })

  it('shows soft preference status labels', () => {
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={() => undefined} />)
    expect(screen.getByText('Fully satisfied')).toBeInTheDocument()
    expect(screen.getByText('Partially satisfied')).toBeInTheDocument()
    expect(screen.getByText('Not satisfied')).toBeInTheDocument()
  })

  it('lists hard constraints with their names', () => {
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={() => undefined} />)
    expect(screen.getByText('No teacher double-booking')).toBeInTheDocument()
    expect(screen.getByText('No room double-booking')).toBeInTheDocument()
  })

  it('shows conflict description for violated hard constraint', () => {
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={() => undefined} />)
    expect(screen.getByText('Room A101 double-booked')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close.*constraint/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn()
    render(<ConstraintSatisfactionSummary report={fullReport} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
