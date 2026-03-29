import { describe, expect, it } from 'vitest'
import { render, screen } from '@/test/test-utils'
import ConstraintsLayout from '@/features/constraints/pages/ConstraintsLayout'

describe('ConstraintsLayout', () => {
  it('renders the soft preferences nav tab', () => {
    render(<ConstraintsLayout />, { initialEntries: ['/constraints/hard'] })

    const link = screen.getByRole('link', { name: /soft preferences/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/constraints/soft')
  })

  it('renders the subject rules nav tab', () => {
    render(<ConstraintsLayout />, { initialEntries: ['/constraints/hard'] })

    const link = screen.getByRole('link', { name: /subject rules/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/constraints/subject-rules')
  })
})
