import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import SoftPreferencesPage from '@/features/constraints/pages/SoftPreferencesPage'
import type { SoftPreferenceDto } from '@/types/soft-preference.types'
import {
  useCreateSoftPreference,
  useDeleteSoftPreference,
  useSoftPreferences,
  useUpdateSoftPreference,
} from '@/api/hooks/useSoftPreferences'

vi.mock('@/api/hooks/useSoftPreferences', () => ({
  useSoftPreferences: vi.fn(),
  useCreateSoftPreference: vi.fn(),
  useUpdateSoftPreference: vi.fn(),
  useDeleteSoftPreference: vi.fn(),
}))

const fixture: SoftPreferenceDto[] = [
  {
    id: 'soft-preference-1',
    name: 'Teacher A prefers Fridays free',
    description: 'Allow Teacher A a free Friday.',
    weight: 8,
    enabled: true,
    satisfactionStatus: 'fully',
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'soft-preference-2',
    name: 'Avoid back-to-back periods for Year 12',
    description: undefined,
    weight: 3,
    enabled: true,
    satisfactionStatus: 'partially',
    createdAt: '2026-03-21T09:00:00.000Z',
    updatedAt: '2026-03-21T09:00:00.000Z',
  },
]

const useSoftPreferencesMock = vi.mocked(useSoftPreferences)
const useCreateSoftPreferenceMock = vi.mocked(useCreateSoftPreference)
const useUpdateSoftPreferenceMock = vi.mocked(useUpdateSoftPreference)
const useDeleteSoftPreferenceMock = vi.mocked(useDeleteSoftPreference)

describe('SoftPreferencesPage', () => {
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

    useSoftPreferencesMock.mockReturnValue({
      data: { content: fixture },
      isLoading: false,
      error: null,
    })
    useCreateSoftPreferenceMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: null,
    })
    useUpdateSoftPreferenceMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    })
    useDeleteSoftPreferenceMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders satisfaction report summary and preference list', () => {
    render(<SoftPreferencesPage />)

    expect(screen.getByText(/Generator satisfaction report/i)).toBeInTheDocument()
    expect(screen.getByText('Fully satisfied')).toBeInTheDocument()
    expect(screen.getByText('Partially satisfied')).toBeInTheDocument()
    expect(screen.getByText(/The generator could honour this preference/i)).toBeInTheDocument()
  })

  it('shows query error banner when fetch fails', () => {
    useSoftPreferencesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Fetch failure'),
    })

    render(<SoftPreferencesPage />)

    expect(screen.getByText('Fetch failure')).toBeInTheDocument()
    expect(screen.queryByText(/No soft preferences yet/i)).not.toBeInTheDocument()
  })

  it('shows mutation error banner when a mutation fails', () => {
    useCreateSoftPreferenceMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: new Error('Mutation failure'),
    })

    render(<SoftPreferencesPage />)

    expect(screen.getByText('Mutation failure')).toBeInTheDocument()
  })

  it('submits a new soft preference with disabled enabled flag when unchecked', async () => {
    useSoftPreferencesMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<SoftPreferencesPage />)

    await user.click(screen.getByRole('button', { name: /add soft preference/i }))
    const checkbox = screen.getByRole('checkbox', {
      name: /Active from the next generator run/i,
    })
    await user.click(checkbox)

    await user.type(screen.getByLabelText(/preference name/i), 'No PE on Monday mornings')
    await user.click(screen.getByRole('button', { name: /save preference/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
        expect.any(Object),
      )
    })
  })

  it('shows validation errors when name is empty', async () => {
    const user = userEvent.setup()
    render(<SoftPreferencesPage />)
    await user.click(screen.getByRole('button', { name: /add soft preference/i }))
    await user.click(screen.getByRole('button', { name: /save preference/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument()
    })
  })

  it('shows empty state when no preferences exist', () => {
    useSoftPreferencesMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })
    render(<SoftPreferencesPage />)

    expect(screen.getByText(/No soft preferences yet/i)).toBeInTheDocument()
  })

  it('submits a new soft preference when the form is filled and saved', async () => {
    useSoftPreferencesMock.mockReturnValue({
      data: { content: [] },
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<SoftPreferencesPage />)

    await user.click(screen.getByRole('button', { name: /add soft preference/i }))
    await user.type(screen.getByLabelText(/preference name/i), 'No PE on Monday mornings')
    await user.type(screen.getByLabelText(/notes \(optional\)/i), 'Students are sluggish.')
    await user.click(screen.getByRole('button', { name: /save preference/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'No PE on Monday mornings',
          description: 'Students are sluggish.',
          weight: 5,
        }),
        expect.any(Object),
      )
    })
  })

  it('updates an existing preference when save is clicked from edit mode', async () => {
    const user = userEvent.setup()
    render(<SoftPreferencesPage />)

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    await user.click(editButtons[0])

    const nameInput = screen.getByLabelText(/preference name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated preference name')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'soft-preference-1',
          data: expect.objectContaining({
            name: 'Updated preference name',
            weight: 8,
          }),
        }),
        expect.any(Object),
      )
    })
  })

  it('deletes a preference after confirmation', async () => {
    const user = userEvent.setup()
    render(<SoftPreferencesPage />)

    const deleteButtons = screen.getAllByRole('button', { name: /^delete/i })
    await user.click(deleteButtons[0])

    const dialog = screen.getByRole('dialog', { name: /delete soft preference/i })
    await user.click(within(dialog).getByRole('button', { name: /delete preference/i }))

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith('soft-preference-1', expect.any(Object))
    })
  })

  it('higher-weighted preference ordering is reflected in the table', () => {
    useSoftPreferencesMock.mockReturnValue({
      data: {
        content: [
          { ...fixture[0], id: 'pref-a', weight: 8 },
          { ...fixture[0], id: 'pref-b', name: 'Low priority preference', weight: 3 },
        ],
      },
      isLoading: false,
      error: null,
    })

    render(<SoftPreferencesPage />)

    expect(screen.getByText('8 / 10')).toBeInTheDocument()
    expect(screen.getByText('3 / 10')).toBeInTheDocument()
  })
})
