import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
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
})
