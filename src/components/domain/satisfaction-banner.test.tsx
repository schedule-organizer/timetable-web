import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { SatisfactionBanner } from './satisfaction-banner'
import type { ConstraintSatisfactionReport } from '@/types/engine.types'

const baseReport: ConstraintSatisfactionReport = {
  overallPercentage: 94,
  softFullySatisfied: 8,
  softPartiallySatisfied: 2,
  softNotSatisfied: 1,
  softPreferences: [],
  hardConstraints: [],
}

describe('SatisfactionBanner', () => {
  it('renders overall satisfaction percentage', () => {
    render(<SatisfactionBanner report={baseReport} onViewDetails={() => undefined} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/94%/)).toBeInTheDocument()
  })

  it('shows soft preference counts', () => {
    render(<SatisfactionBanner report={baseReport} onViewDetails={() => undefined} />)
    expect(screen.getByText(/8 full/)).toBeInTheDocument()
    expect(screen.getByText(/2 partial/)).toBeInTheDocument()
    expect(screen.getByText(/1 unmet/)).toBeInTheDocument()
  })

  it('uses positive variant when satisfaction is ≥85% with no hard conflicts', () => {
    render(<SatisfactionBanner report={baseReport} onViewDetails={() => undefined} />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'positive')
  })

  it('uses warning variant when satisfaction is <85%', () => {
    const lowReport: ConstraintSatisfactionReport = { ...baseReport, overallPercentage: 72 }
    render(<SatisfactionBanner report={lowReport} onViewDetails={() => undefined} />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'warning')
  })

  it('uses warning variant when satisfaction is ≥85% but hard constraint violated', () => {
    const reportWithConflict: ConstraintSatisfactionReport = {
      ...baseReport,
      overallPercentage: 90,
      hardConstraints: [
        { id: 'hc-1', name: 'No double-booking', satisfied: false },
      ],
    }
    render(<SatisfactionBanner report={reportWithConflict} onViewDetails={() => undefined} />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'warning')
  })

  it('uses positive variant at exactly 85%', () => {
    const report85: ConstraintSatisfactionReport = { ...baseReport, overallPercentage: 85 }
    render(<SatisfactionBanner report={report85} onViewDetails={() => undefined} />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'positive')
  })

  it('calls onViewDetails when "View details" button is clicked', async () => {
    const onViewDetails = vi.fn()
    render(<SatisfactionBanner report={baseReport} onViewDetails={onViewDetails} />)
    await userEvent.click(screen.getByRole('button', { name: /view.*details/i }))
    expect(onViewDetails).toHaveBeenCalledOnce()
  })
})
