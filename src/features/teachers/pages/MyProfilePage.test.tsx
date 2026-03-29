import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import MyProfilePage from '@/features/teachers/pages/MyProfilePage'
import { useMyProfile, useUpdateMyProfile } from '@/api/hooks/useTeachers'

vi.mock('@/api/hooks/useTeachers', () => ({
  useMyProfile: vi.fn(),
  useUpdateMyProfile: vi.fn(),
}))

const profileFixture = {
  id: 'teacher-roster-1',
  firstName: 'Alice',
  lastName: 'Chen',
  email: 'alice@school.edu',
  phone: '+44 20 7946 0000',
  subjectQualifications: ['Mathematics', 'Physics'],
  status: 'ACTIVE' as const,
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
}

const useMyProfileMock = vi.mocked(useMyProfile)
const useUpdateMyProfileMock = vi.mocked(useUpdateMyProfile)

describe('MyProfilePage', () => {
  let updateMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    updateMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })

    useMyProfileMock.mockReturnValue({
      data: profileFixture,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMyProfile>)

    useUpdateMyProfileMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateMyProfile>)
  })

  it('renders the profile form with current teacher data', async () => {
    render(<MyProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Chen')).toBeInTheDocument()
    expect(screen.getByDisplayValue('alice@school.edu')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+44 20 7946 0000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mathematics, Physics')).toBeInTheDocument()
  })

  it('shows a loading state while fetching the profile', () => {
    useMyProfileMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useMyProfile>)

    render(<MyProfilePage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading profile…')
  })

  it('shows an error when profile fails to load', () => {
    useMyProfileMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Network Error' },
    } as unknown as ReturnType<typeof useMyProfile>)

    render(<MyProfilePage />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('updates name and contact details and shows success message (AC1)', async () => {
    render(<MyProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    })

    const firstNameInput = screen.getByLabelText('First name')
    await userEvent.clear(firstNameInput)
    await userEvent.type(firstNameInput, 'Alicia')

    const phoneInput = screen.getByLabelText(/Phone/i)
    await userEvent.clear(phoneInput)
    await userEvent.type(phoneInput, '+44 20 7946 9999')

    await userEvent.click(screen.getByRole('button', { name: /Save profile/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Alicia',
          lastName: 'Chen',
          email: 'alice@school.edu',
          phone: '+44 20 7946 9999',
        }),
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Profile updated\. Changes are now visible to the timetabler\./i),
    ).toBeInTheDocument()
  })

  it('updates subject qualifications and shows success message (AC2)', async () => {
    render(<MyProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Mathematics, Physics')).toBeInTheDocument()
    })

    const subjectsInput = screen.getByLabelText(/Subject qualifications/i)
    await userEvent.clear(subjectsInput)
    await userEvent.type(subjectsInput, 'Mathematics, Chemistry, Biology')

    await userEvent.click(screen.getByRole('button', { name: /Save profile/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectQualifications: ['Mathematics', 'Chemistry', 'Biology'],
        }),
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Profile updated\. Changes are now visible to the timetabler\./i),
    ).toBeInTheDocument()
  })

  it('shows an error alert when profile update is denied with 403 (AC3)', async () => {
    const forbiddenError = {
      response: { status: 403, data: { message: 'You are not allowed to edit this profile.' } },
    }

    useUpdateMyProfileMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: forbiddenError,
    } as unknown as ReturnType<typeof useUpdateMyProfile>)

    render(<MyProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('disables the save button while the update is pending', async () => {
    useUpdateMyProfileMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useUpdateMyProfile>)

    render(<MyProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled()
  })
})
