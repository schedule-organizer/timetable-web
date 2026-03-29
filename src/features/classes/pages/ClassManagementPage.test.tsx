import '@/test/polyfills'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import ClassManagementPage from '@/features/classes/pages/ClassManagementPage'
import {
  useClasses,
  useCreateClass,
  useDeleteClass,
  useUpdateClass,
} from '@/api/hooks/useClasses'

vi.mock('@/api/hooks/useClasses', () => ({
  useClasses: vi.fn(),
  useCreateClass: vi.fn(),
  useUpdateClass: vi.fn(),
  useDeleteClass: vi.fn(),
}))

const classesFixture = [
  {
    id: 'class-roster-1',
    name: 'Year 7 Science',
    yearGroup: 'Year 7',
    status: 'ACTIVE',
    createdAt: '2026-03-21T09:30:00Z',
    updatedAt: '2026-03-21T09:30:00Z',
  },
  {
    id: 'class-roster-2',
    name: 'Year 8 Humanities',
    yearGroup: 'Year 8',
    status: 'ACTIVE',
    createdAt: '2026-03-22T10:15:00Z',
    updatedAt: '2026-03-22T10:15:00Z',
  },
] as const

const useClassesMock = vi.mocked(useClasses)
const useCreateClassMock = vi.mocked(useCreateClass)
const useUpdateClassMock = vi.mocked(useUpdateClass)
const useDeleteClassMock = vi.mocked(useDeleteClass)

describe('ClassManagementPage', () => {
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
    deleteMutate = vi.fn((_id, options) => {
      options?.onSuccess?.()
    })

    useClassesMock.mockReturnValue({
      data: { content: classesFixture },
      isLoading: false,
      error: null,
    })
    useCreateClassMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: null,
    })
    useUpdateClassMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    })
    useDeleteClassMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders the roster and filters by year group', async () => {
    render(<ClassManagementPage />)

    const roster = screen.getByLabelText('Class roster')
    await waitFor(() => {
      expect(within(roster).getByText('Year 7 Science')).toBeInTheDocument()
    })

    const filter = screen.getByLabelText(/Filter by year group/i)
    await userEvent.selectOptions(filter, 'Year 8')

    expect(within(roster).queryByText('Year 7 Science')).not.toBeInTheDocument()
    expect(within(roster).getByText('Year 8 Humanities')).toBeInTheDocument()
  })

  it('adds a class via the manual form', async () => {
    render(<ClassManagementPage />)

    await userEvent.click(screen.getByRole('button', { name: /Add class/i }))

    await userEvent.type(screen.getByLabelText(/Class name/i), 'Year 9 Music')
    await userEvent.type(screen.getByLabelText(/Year group/i, { selector: 'input' }), 'Year 9')
    await userEvent.click(screen.getByRole('button', { name: /Create class/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        { name: 'Year 9 Music', yearGroup: 'Year 9' },
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Class added\. It is now available for scheduling and filters\./i),
    ).toBeInTheDocument()
  })

  it('updates a class via the edit form', async () => {
    render(<ClassManagementPage />)

    const roster = screen.getByLabelText('Class roster')
    await waitFor(() => {
      expect(within(roster).getByText('Year 7 Science')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Year 7 Science').closest('tr')
    if (!row) throw new Error('Expected class row to be rendered')

    await userEvent.click(within(row).getByRole('button', { name: /Edit/i }))

    const nameInput = screen.getByLabelText(/Class name/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Year 7 Science (Advanced)')

    await userEvent.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        {
          id: 'class-roster-1',
          data: { name: 'Year 7 Science (Advanced)', yearGroup: 'Year 7' },
        },
        expect.anything(),
      )
    })

    expect(
      screen.getByText(
        /Class updated\. Associated schedules now use the refreshed name\/year group\./i,
      ),
    ).toBeInTheDocument()
  })

  it('deletes a class with orphan reminder', async () => {
    render(<ClassManagementPage />)

    const roster = screen.getByLabelText('Class roster')
    await waitFor(() => {
      expect(within(roster).getByText('Year 7 Science')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Year 7 Science').closest('tr')
    if (!row) throw new Error('Expected class row to be rendered')

    await userEvent.click(within(row).getByRole('button', { name: /Delete/i }))
    await userEvent.click(screen.getByRole('button', { name: /Delete class/i }))

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith('class-roster-1', expect.anything())
    })

    expect(
      screen.getByText(/Class deleted\. Any previously assigned slots are considered orphaned/i),
    ).toBeInTheDocument()
  })
})
