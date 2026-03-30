import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { SensitivityPanel } from './sensitivity-panel'

const defaultProps = {
  open: true,
  constraintId: 'hc-4',
  constraintName: 'Teacher forbidden slots respected',
  conflictExplanation:
    'Jane Smith cannot cover Year 10B in any available slot because all valid windows overlap with her Forbidden Slot: Friday PM.',
  onApplyAndReRun: vi.fn(),
  onClose: vi.fn(),
}

describe('SensitivityPanel', () => {
  it('renders panel with accessible dialog role when open', () => {
    render(<SensitivityPanel {...defaultProps} />)
    expect(screen.getByRole('dialog', { name: /relax constraint/i })).toBeInTheDocument()
  })

  it('does not render when open=false', () => {
    render(<SensitivityPanel {...defaultProps} open={false} />)
    expect(screen.queryByRole('dialog', { name: /relax constraint/i })).not.toBeInTheDocument()
  })

  it('shows constraint name and conflict explanation', () => {
    render(<SensitivityPanel {...defaultProps} />)
    expect(screen.getByText('Teacher forbidden slots respected')).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith cannot cover Year 10B/i)).toBeInTheDocument()
  })

  it('shows hard/soft toggle with Hard selected by default', () => {
    render(<SensitivityPanel {...defaultProps} />)
    const hardBtn = screen.getByRole('radio', { name: /^Hard$/i })
    const softBtn = screen.getByRole('radio', { name: /^Soft$/i })
    expect(hardBtn).toBeChecked()
    expect(softBtn).not.toBeChecked()
  })

  it('hides weight slider when Hard is selected', () => {
    render(<SensitivityPanel {...defaultProps} />)
    expect(screen.queryByRole('slider', { name: /weight/i })).not.toBeInTheDocument()
  })

  it('shows weight slider when Soft is selected', async () => {
    render(<SensitivityPanel {...defaultProps} />)
    await userEvent.click(screen.getByRole('radio', { name: /^Soft$/i }))
    expect(screen.getByRole('slider', { name: /weight/i })).toBeInTheDocument()
  })

  it('slider defaults to 5 and respects 1–10 range', async () => {
    render(<SensitivityPanel {...defaultProps} />)
    await userEvent.click(screen.getByRole('radio', { name: /^Soft$/i }))
    const slider = screen.getByRole('slider', { name: /weight/i })
    expect(slider).toHaveAttribute('min', '1')
    expect(slider).toHaveAttribute('max', '10')
    expect(slider).toHaveValue('5')
  })

  it('shows impact preview chip when soft is selected', async () => {
    render(<SensitivityPanel {...defaultProps} />)
    await userEvent.click(screen.getByRole('radio', { name: /^Soft$/i }))
    expect(screen.getByRole('status', { name: /impact preview/i })).toBeInTheDocument()
  })

  it('uses concrete impact line when impactPreviewLine is provided', async () => {
    render(
      <SensitivityPanel
        {...defaultProps}
        impactPreviewLine="Friday PM may be assigned to Jane Smith even when this constraint would otherwise forbid it."
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: /^Soft$/i }))
    expect(screen.getByText(/Friday PM may be assigned to Jane Smith/i)).toBeInTheDocument()
    expect(screen.getByText(/Preference weight 5 applies/i)).toBeInTheDocument()
  })

  it('does not show impact preview chip when Hard is selected', () => {
    render(<SensitivityPanel {...defaultProps} />)
    expect(screen.queryByRole('status', { name: /impact preview/i })).not.toBeInTheDocument()
  })

  it('"Apply and re-run" is disabled when Hard is selected (no change)', () => {
    render(<SensitivityPanel {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: /apply and re-run/i }),
    ).toBeDisabled()
  })

  it('"Apply and re-run" is enabled when Soft is selected', async () => {
    render(<SensitivityPanel {...defaultProps} />)
    await userEvent.click(screen.getByRole('radio', { name: /^Soft$/i }))
    expect(
      screen.getByRole('button', { name: /apply and re-run/i }),
    ).toBeEnabled()
  })

  it('calls onApplyAndReRun with correct relaxation payload when applied', async () => {
    const onApplyAndReRun = vi.fn()
    render(<SensitivityPanel {...defaultProps} onApplyAndReRun={onApplyAndReRun} />)
    await userEvent.click(screen.getByRole('radio', { name: /^Soft$/i }))
    await userEvent.click(screen.getByRole('button', { name: /apply and re-run/i }))
    expect(onApplyAndReRun).toHaveBeenCalledWith({
      constraintId: 'hc-4',
      constraintName: 'Teacher forbidden slots respected',
      weight: 5,
    })
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<SensitivityPanel {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape key', async () => {
    const onClose = vi.fn()
    render(<SensitivityPanel {...defaultProps} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('note states original constraint config remains unchanged', () => {
    render(<SensitivityPanel {...defaultProps} />)
    expect(
      screen.getByText(/original constraint.*unchanged|configuration.*unchanged/i),
    ).toBeInTheDocument()
  })
})
