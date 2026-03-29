import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import SubjectManagementPage from '@/features/subjects/pages/SubjectManagementPage'
import { useCreateSubject, useSubjects, useUpdateSubject } from '@/api/hooks/useSubjects'

vi.mock('@/api/hooks/useSubjects', () => ({
  useSubjects: vi.fn(),
  useCreateSubject: vi.fn(),
  useUpdateSubject: vi.fn(),
}))

const subjectsFixture = [
  {
    id: 'subject-1',
    name: 'Physics',
    difficulty: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2026-03-21T09:00:00Z',
    updatedAt: '2026-03-21T09:00:00Z',
  },
  {
    id: 'subject-2',
    name: 'Art',
    difficulty: 'LOW',
    status: 'ACTIVE',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
  },
] as const

const useSubjectsMock = vi.mocked(useSubjects)
const useCreateSubjectMock = vi.mocked(useCreateSubject)
const useUpdateSubjectMock = vi.mocked(useUpdateSubject)

describe('SubjectManagementPage', () => {
  let createMutate: ReturnType<typeof vi.fn>
  let updateMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    createMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    updateMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })

    useSubjectsMock.mockReturnValue({
      data: { content: subjectsFixture },
      isLoading: false,
      error: null,
    })
    useCreateSubjectMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: null,
    })
    useUpdateSubjectMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders the subject roster and filters by difficulty', async () => {
    render(<SubjectManagementPage />)

    const roster = screen.getByLabelText('Subject roster')
    await waitFor(() => {
      expect(within(roster).getByText('Physics')).toBeInTheDocument()
    })

    const filter = screen.getByLabelText(/Filter by difficulty/i)
    await userEvent.selectOptions(filter, 'LOW')

    expect(within(roster).queryByText('Physics')).not.toBeInTheDocument()
    expect(within(roster).getByText('Art')).toBeInTheDocument()
  })

  it('shows a filter-specific message when no subjects match the difficulty filter', async () => {
    render(<SubjectManagementPage />)

    const roster = screen.getByLabelText('Subject roster')
    await waitFor(() => {
      expect(within(roster).getByText('Physics')).toBeInTheDocument()
    })

    const filter = screen.getByLabelText(/Filter by difficulty/i)
    await userEvent.selectOptions(filter, 'MEDIUM')

    expect(
      within(roster).getByText('No subjects match this difficulty filter.'),
    ).toBeInTheDocument()
  })

  it('adds a subject via the form', async () => {
    render(<SubjectManagementPage />)

    await userEvent.click(screen.getByRole('button', { name: /Add subject/i }))

    await userEvent.type(screen.getByLabelText(/Subject name/i), 'Chemistry')
    await userEvent.selectOptions(screen.getByLabelText(/Difficulty level/i), 'MEDIUM')
    await userEvent.click(screen.getByRole('button', { name: /Create subject/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        { name: 'Chemistry', difficulty: 'MEDIUM' },
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Subject added\. It is now available for scheduling and constraints\./i),
    ).toBeInTheDocument()
  })

  it('edits an existing subject via the form', async () => {
    render(<SubjectManagementPage />)

    const roster = screen.getByLabelText('Subject roster')
    await waitFor(() => {
      expect(within(roster).getByText('Physics')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Physics').closest('tr')
    if (!row) throw new Error('Expected subject row to be rendered')

    await userEvent.click(within(row).getByRole('button', { name: /Edit/i }))

    await userEvent.selectOptions(screen.getByLabelText(/Difficulty level/i), 'LOW')
    await userEvent.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        { id: 'subject-1', data: { name: 'Physics', difficulty: 'LOW' } },
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Subject updated\. Difficulty changes take effect on the next generator run\./i),
    ).toBeInTheDocument()
  })
})
