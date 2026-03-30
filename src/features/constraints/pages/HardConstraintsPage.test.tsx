import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import HardConstraintsPage from '@/features/constraints/pages/HardConstraintsPage'
import {
  useCreateHardConstraint,
  useDeleteHardConstraint,
  useHardConstraints,
  useUpdateHardConstraint,
} from '@/api/hooks/useHardConstraints'

vi.mock('@/api/hooks/useHardConstraints', () => ({
  useHardConstraints: vi.fn(),
  useCreateHardConstraint: vi.fn(),
  useUpdateHardConstraint: vi.fn(),
  useDeleteHardConstraint: vi.fn(),
}))

const fixture = [
  {
    id: 'hard-constraint-1',
    ruleType: 'TEACHER_NO_DOUBLE_BOOKING' as const,
    description: 'Team note',
    enabled: true,
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
  },
]

const useHardConstraintsMock = vi.mocked(useHardConstraints)
const useCreateHardConstraintMock = vi.mocked(useCreateHardConstraint)
const useUpdateHardConstraintMock = vi.mocked(useUpdateHardConstraint)
const useDeleteHardConstraintMock = vi.mocked(useDeleteHardConstraint)

describe('HardConstraintsPage', () => {
  let createMutate: ReturnType<typeof vi.fn>
  let updateMutate: ReturnType<typeof vi.fn>
  let deleteMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    createMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    updateMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    deleteMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })

    useHardConstraintsMock.mockReturnValue({
      data: { content: fixture },
      isLoading: false,
      error: null,
    })
    useCreateHardConstraintMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: null,
    })
    useUpdateHardConstraintMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    })
    useDeleteHardConstraintMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
      error: null,
    })
  })

  it('lists hard constraints with rule labels and enforcement status', () => {
    render(<HardConstraintsPage />)

    expect(
      screen.getByRole('heading', { name: /hard constraints/i, level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Teacher cannot be double-booked/)).toBeInTheDocument()
    expect(screen.getByText(/Enforced/)).toBeInTheDocument()
    expect(screen.getByText(/Team note/)).toBeInTheDocument()
  })

  it('submits a new hard constraint when the form is filled and saved', async () => {
    useHardConstraintsMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<HardConstraintsPage />)

    await user.click(screen.getByRole('button', { name: /add hard constraint/i }))

    const form = screen.getByRole('textbox', {
      name: /notes \(optional\)/i,
    }).closest('form')
    expect(form).toBeTruthy()

    await user.selectOptions(screen.getByLabelText(/rule/i), 'ROOM_CAPACITY_NOT_EXCEEDED')
    await user.type(screen.getByLabelText(/notes \(optional\)/i), 'Keep under fire code.')
    await user.click(screen.getByRole('button', { name: /save constraint/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          ruleType: 'ROOM_CAPACITY_NOT_EXCEEDED',
          description: 'Keep under fire code.',
          enabled: true,
        }),
        expect.any(Object),
      )
    })
  })

  it('updates an existing constraint when save is clicked from edit mode', async () => {
    const user = userEvent.setup()
    render(<HardConstraintsPage />)

    await user.click(screen.getByRole('button', { name: /^edit$/i }))

    const notes = screen.getByLabelText(/notes \(optional\)/i)
    await user.clear(notes)
    await user.type(notes, 'Updated note')
    await user.click(screen.getByRole('checkbox', { name: /enforce on every generator run/i }))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'hard-constraint-1',
          data: {
            description: 'Updated note',
            enabled: false,
          },
        }),
        expect.any(Object),
      )
    })
  })

  it('deletes a constraint after confirmation', async () => {
    const user = userEvent.setup()
    render(<HardConstraintsPage />)

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    const dialog = screen.getByRole('dialog', { name: /delete hard constraint/i })
    await user.click(within(dialog).getByRole('button', { name: /delete constraint/i }))

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith('hard-constraint-1', expect.any(Object))
    })
  })
})
