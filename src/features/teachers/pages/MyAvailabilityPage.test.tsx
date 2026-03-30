import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import MyAvailabilityPage from '@/features/teachers/pages/MyAvailabilityPage'
import {
  useTeacherAvailability,
  useUpdateTeacherAvailability,
} from '@/api/hooks/useTeacherAvailability'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { useMyProfile } from '@/api/hooks/useTeachers'

vi.mock('@/hooks/usePermission', () => ({
  useInstitutionPermission: () => true,
}))

vi.mock('@/api/hooks/useTeachers', () => ({
  useMyProfile: vi.fn(),
}))

vi.mock('@/api/hooks/useBellSchedule', () => ({
  useBellSchedule: vi.fn(),
}))

vi.mock('@/api/hooks/useCycleSettings', () => ({
  useCycleSettings: vi.fn(),
}))

vi.mock('@/api/hooks/useTeacherAvailability', () => ({
  useTeacherAvailability: vi.fn(),
  useUpdateTeacherAvailability: vi.fn(),
}))

const useMyProfileMock = vi.mocked(useMyProfile)
const useBellScheduleMock = vi.mocked(useBellSchedule)
const useCycleSettingsMock = vi.mocked(useCycleSettings)
const useTeacherAvailabilityMock = vi.mocked(useTeacherAvailability)
const useUpdateTeacherAvailabilityMock = vi.mocked(useUpdateTeacherAvailability)

describe('MyAvailabilityPage', () => {
  let saveMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    saveMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })

    useMyProfileMock.mockReturnValue({
      data: {
        id: 'teacher-roster-1',
        firstName: 'Alice',
        lastName: 'Chen',
        email: 'alice@school.edu',
        phone: null,
        subjectQualifications: [],
        status: 'ACTIVE',
        createdAt: '2026-03-20T10:00:00Z',
        updatedAt: '2026-03-20T10:00:00Z',
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useMyProfile>)

    useBellScheduleMock.mockReturnValue({
      data: {
        periods: [
          { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
          { id: 'p2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
        ],
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useBellSchedule>)

    useCycleSettingsMock.mockReturnValue({
      data: {
        cycleLengthDays: 2,
        dayLabels: ['Day A', 'Day B'],
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useCycleSettings>)

    useTeacherAvailabilityMock.mockReturnValue({
      data: { unavailable: [], preferred: [] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTeacherAvailability>)

    useUpdateTeacherAvailabilityMock.mockReturnValue({
      mutate: saveMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateTeacherAvailability>)
  })

  it('renders the grid after settings load', async () => {
    render(<MyAvailabilityPage />)

    await waitFor(() => {
      expect(screen.getByRole('grid', { name: /availability grid/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('columnheader', { name: 'Period 1' })).toBeInTheDocument()
  })

  it('opens confirm dialog when marking all as available', async () => {
    const user = userEvent.setup()
    render(<MyAvailabilityPage />)

    await waitFor(() => {
      expect(screen.getByRole('grid', { name: /availability grid/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /mark all as available/i }))

    expect(screen.getByRole('dialog', { name: /mark all as available/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
  })

  it('submits availability and shows summary', async () => {
    const user = userEvent.setup()
    render(<MyAvailabilityPage />)

    await waitFor(() => {
      expect(screen.getByRole('grid', { name: /availability grid/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Day A, Period 1, Available/i }))
    await user.click(screen.getByRole('button', { name: /submit availability/i }))

    await waitFor(() => {
      expect(screen.getByText(/availability submitted/i)).toBeInTheDocument()
    })

    expect(saveMutate).toHaveBeenCalled()
    expect(screen.getByText(/unavailable slots: 1/i)).toBeInTheDocument()
  })
})
