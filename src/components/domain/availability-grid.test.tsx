import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/test-utils'
import { AvailabilityGrid } from '@/components/domain/availability-grid'
import type { AvailabilitySlotState } from '@/types/teacher-availability.types'

function GridHarness({
  initial = new Map<string, AvailabilitySlotState>(),
}: {
  initial?: Map<string, AvailabilitySlotState>
}) {
  const [value, setValue] = useState(initial)
  return (
    <AvailabilityGrid
      cycleLengthDays={2}
      dayLabels={['Day A', 'Day B']}
      periods={[
        { id: 'p1', name: 'Period 1' },
        { id: 'p2', name: 'Period 2' },
      ]}
      value={value}
      onChange={setValue}
    />
  )
}

describe('AvailabilityGrid', () => {
  it('cycles a slot through unavailable and preferred when clicked', async () => {
    const user = userEvent.setup()
    render(<GridHarness />)

    const cell = screen.getByRole('button', { name: /Day A, Period 1, Available/i })
    await user.click(cell)
    expect(
      screen.getByRole('button', { name: /Day A, Period 1, Unavailable/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Day A, Period 1, Unavailable/i }))
    expect(
      screen.getByRole('button', { name: /Day A, Period 1, Preferred/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Day A, Period 1, Preferred/i }))
    expect(
      screen.getByRole('button', { name: /Day A, Period 1, Available/i }),
    ).toBeInTheDocument()
  })

  it('toggles with Space when the cell is focused', async () => {
    const user = userEvent.setup()
    render(<GridHarness />)

    const cell = screen.getByRole('button', { name: /Day A, Period 1, Available/i })
    cell.focus()
    await user.keyboard(' ')
    expect(
      screen.getByRole('button', { name: /Day A, Period 1, Unavailable/i }),
    ).toBeInTheDocument()
  })
})
