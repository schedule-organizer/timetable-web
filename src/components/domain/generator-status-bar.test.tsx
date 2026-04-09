import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { GeneratorStatusBar } from './generator-status-bar'

describe('GeneratorStatusBar', () => {
  it('renders nothing when idle with no message', () => {
    const { container } = render(<GeneratorStatusBar phase="idle" message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows spinner and status text while running', () => {
    render(<GeneratorStatusBar phase="running" message="Placing 340 lessons…" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/Placing 340 lessons/i)).toBeInTheDocument()
  })

  it('shows success state with Done message', () => {
    render(<GeneratorStatusBar phase="succeeded" message="Done" />)
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('shows failed state with message', () => {
    render(<GeneratorStatusBar phase="failed" message="Failed — hard constraint deadlock detected." />)
    const bar = screen.getByRole('status')
    expect(bar).toHaveAttribute('data-phase', 'failed')
    expect(screen.getByText(/hard constraint deadlock/i)).toBeInTheDocument()
  })

  it('shows "View conflicts" button in failed state when onViewConflicts provided', () => {
    render(
      <GeneratorStatusBar
        phase="failed"
        message="Generator failed."
        onViewConflicts={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /view conflict details/i })).toBeInTheDocument()
  })

  it('calls onViewConflicts when "View conflicts" is clicked', async () => {
    const onViewConflicts = vi.fn()
    render(
      <GeneratorStatusBar
        phase="failed"
        message="Generator failed."
        onViewConflicts={onViewConflicts}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /view conflict details/i }))
    expect(onViewConflicts).toHaveBeenCalledTimes(1)
  })

  it('does not show "View conflicts" button when onViewConflicts is not provided', () => {
    render(<GeneratorStatusBar phase="failed" message="Generator failed." />)
    expect(screen.queryByRole('button', { name: /view conflict details/i })).not.toBeInTheDocument()
  })

  it('does not show "View conflicts" button in succeeded state', () => {
    render(
      <GeneratorStatusBar phase="succeeded" message="Done" onViewConflicts={vi.fn()} />,
    )
    expect(screen.queryByRole('button', { name: /view conflict details/i })).not.toBeInTheDocument()
  })

  it('renders primary action when provided', () => {
    const onRun = vi.fn()
    render(
      <GeneratorStatusBar
        phase="idle"
        message="3 unpinned slots will be solved"
        primaryAction={{ label: 'Re-run unpinned', onClick: onRun }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Re-run unpinned' })).toBeInTheDocument()
  })

  it('disables primary action and sets title when disabledTooltip provided', () => {
    render(
      <GeneratorStatusBar
        phase="idle"
        message="0 unpinned slots will be solved"
        primaryAction={{
          label: 'Re-run unpinned',
          onClick: vi.fn(),
          disabled: true,
          disabledTooltip: 'All slots are pinned — unpin slots to re-run',
        }}
      />,
    )
    const btn = screen.getByRole('button', { name: 'Re-run unpinned' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', 'All slots are pinned — unpin slots to re-run')
  })
})
