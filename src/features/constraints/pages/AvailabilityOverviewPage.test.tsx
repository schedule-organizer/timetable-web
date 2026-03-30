import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import AvailabilityOverviewPage from '@/features/constraints/pages/AvailabilityOverviewPage'
import { useTeachers } from '@/api/hooks/useTeachers'
import {
  useAvailabilitySummary,
  useTeacherAvailabilityOverride,
  useUpdateTeacherAvailabilityOverride,
} from '@/api/hooks/useAvailabilityOverview'
import { useTeacherAvailability } from '@/api/hooks/useTeacherAvailability'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'

const mockUseInstitutionPermission = vi.hoisted(() => vi.fn(() => true))

vi.mock('@/hooks/usePermission', () => ({
  useInstitutionPermission: mockUseInstitutionPermission,
}))

vi.mock('@/api/hooks/useTeachers', () => ({
  useTeachers: vi.fn(),
}))

vi.mock('@/api/hooks/useAvailabilityOverview', () => ({
  useAvailabilitySummary: vi.fn(),
  useTeacherAvailabilityOverride: vi.fn(),
  useUpdateTeacherAvailabilityOverride: vi.fn(),
}))

vi.mock('@/api/hooks/useTeacherAvailability', () => ({
  useTeacherAvailability: vi.fn(),
}))

vi.mock('@/api/hooks/useBellSchedule', () => ({
  useBellSchedule: vi.fn(),
}))

vi.mock('@/api/hooks/useCycleSettings', () => ({
  useCycleSettings: vi.fn(),
}))

const useTeachersMock = vi.mocked(useTeachers)
const useAvailabilitySummaryMock = vi.mocked(useAvailabilitySummary)
const useTeacherAvailabilityOverrideMock = vi.mocked(useTeacherAvailabilityOverride)
const useUpdateTeacherAvailabilityOverrideMock = vi.mocked(useUpdateTeacherAvailabilityOverride)
const useTeacherAvailabilityMock = vi.mocked(useTeacherAvailability)
const useBellScheduleMock = vi.mocked(useBellSchedule)
const useCycleSettingsMock = vi.mocked(useCycleSettings)

const fixtureTeachers = [
  {
    id: 'teacher-roster-1',
    firstName: 'Alice',
    lastName: 'Chen',
    email: 'alice@school.edu',
    phone: null,
    subjectQualifications: ['Mathematics'],
    status: 'ACTIVE' as const,
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'teacher-roster-2',
    firstName: 'Brian',
    lastName: 'Owens',
    email: 'brian@school.edu',
    phone: null,
    subjectQualifications: ['History'],
    status: 'ACTIVE' as const,
    createdAt: '2026-03-21T11:00:00Z',
    updatedAt: '2026-03-21T11:00:00Z',
  },
]

const fixtureSummary = [
  {
    teacherId: 'teacher-roster-1',
    submitted: true,
    unavailableCount: 2,
    preferredCount: 1,
    overrideCount: 0,
  },
  {
    teacherId: 'teacher-roster-2',
    submitted: false,
    unavailableCount: 0,
    preferredCount: 0,
    overrideCount: 0,
  },
]

const fixtureBellSchedule = {
  periods: [
    { id: 'period-mock-1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { id: 'period-mock-2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
  ],
}

const fixtureCycleSettings = {
  cycleLengthDays: 2,
  dayLabels: ['Day A', 'Day B'],
}

const fixtureAvailability = {
  unavailable: [{ cycleDayIndex: 0, periodId: 'period-mock-1' }],
  preferred: [{ cycleDayIndex: 1, periodId: 'period-mock-2' }],
}

const emptyOverride = { overriddenSlots: [] }
const noMutate = vi.fn()

function setupDefaultMocks() {
  useTeachersMock.mockReturnValue({
    data: {
      content: fixtureTeachers,
      page: 0,
      size: 2,
      totalElements: 2,
      totalPages: 1,
    },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTeachers>)

  useAvailabilitySummaryMock.mockReturnValue({
    data: fixtureSummary,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useAvailabilitySummary>)

  useTeacherAvailabilityMock.mockReturnValue({
    data: fixtureAvailability,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTeacherAvailability>)

  useTeacherAvailabilityOverrideMock.mockReturnValue({
    data: emptyOverride,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTeacherAvailabilityOverride>)

  useUpdateTeacherAvailabilityOverrideMock.mockReturnValue({
    mutate: noMutate,
    isPending: false,
    error: null,
  } as ReturnType<typeof useUpdateTeacherAvailabilityOverride>)

  useBellScheduleMock.mockReturnValue({
    data: fixtureBellSchedule,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useBellSchedule>)

  useCycleSettingsMock.mockReturnValue({
    data: fixtureCycleSettings,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useCycleSettings>)
}

describe('AvailabilityOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupDefaultMocks()
    mockUseInstitutionPermission.mockReturnValue(true)
  })

  it('renders the page heading', () => {
    render(<AvailabilityOverviewPage />)
    expect(screen.getByRole('heading', { name: /availability overview/i })).toBeInTheDocument()
  })

  it('shows all teachers in the table', () => {
    render(<AvailabilityOverviewPage />)
    expect(screen.getByText('Alice Chen')).toBeInTheDocument()
    expect(screen.getByText('Brian Owens')).toBeInTheDocument()
  })

  it('shows Submitted badge for teachers who have submitted', () => {
    render(<AvailabilityOverviewPage />)
    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    expect(within(aliceRow).getByText('Submitted')).toBeInTheDocument()
  })

  it('shows Not submitted badge for teachers who have not submitted', () => {
    render(<AvailabilityOverviewPage />)
    const brianRow = screen.getByText('Brian Owens').closest('tr')!
    expect(within(brianRow).getByText('Not submitted')).toBeInTheDocument()
  })

  it('shows unavailable and preferred slot counts', () => {
    render(<AvailabilityOverviewPage />)
    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    const cells = within(aliceRow).getAllByRole('cell')
    // Forbidden = 2, Preferred = 1
    expect(cells[2]).toHaveTextContent('2')
    expect(cells[3]).toHaveTextContent('1')
  })

  it('filters teachers by name', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const filterInput = screen.getByRole('searchbox', { name: /filter by teacher name/i })
    await user.type(filterInput, 'Alice')

    expect(screen.getByText('Alice Chen')).toBeInTheDocument()
    expect(screen.queryByText('Brian Owens')).not.toBeInTheDocument()
  })

  it('filters to not-submitted teachers', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const stateFilter = screen.getByRole('combobox', { name: /filter by slot state/i })
    await user.selectOptions(stateFilter, 'not-submitted')

    expect(screen.queryByText('Alice Chen')).not.toBeInTheDocument()
    expect(screen.getByText('Brian Owens')).toBeInTheDocument()
  })

  it('filters to teachers with forbidden slots', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const stateFilter = screen.getByRole('combobox', { name: /filter by slot state/i })
    await user.selectOptions(stateFilter, 'forbidden')

    expect(screen.getByText('Alice Chen')).toBeInTheDocument()
    expect(screen.queryByText('Brian Owens')).not.toBeInTheDocument()
  })

  it('shows empty state message when no teachers match filter', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const filterInput = screen.getByRole('searchbox', { name: /filter by teacher name/i })
    await user.type(filterInput, 'Nonexistent Person')

    expect(screen.getByText(/no teachers match/i)).toBeInTheDocument()
  })

  it('opens the availability dialog when View / Override is clicked', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    const viewButton = within(aliceRow).getByRole('button', { name: /view availability for alice/i })
    await user.click(viewButton)

    expect(
      screen.getByRole('dialog', { name: /alice chen.*availability/i }),
    ).toBeInTheDocument()
  })

  it('dialog shows not-submitted warning for Brian', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const brianRow = screen.getByText('Brian Owens').closest('tr')!
    const viewButton = within(brianRow).getByRole('button', { name: /view availability for brian/i })
    await user.click(viewButton)

    expect(
      screen.getByText(/has not yet submitted their availability/i),
    ).toBeInTheDocument()
  })

  it('dialog does not show not-submitted warning for Alice (submitted)', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    const viewButton = within(aliceRow).getByRole('button', { name: /view availability for alice/i })
    await user.click(viewButton)

    expect(
      screen.queryByText(/has not yet submitted their availability/i),
    ).not.toBeInTheDocument()
  })

  it('closes dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<AvailabilityOverviewPage />)

    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    await user.click(within(aliceRow).getByRole('button', { name: /view availability for alice/i }))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls saveOverride mutate when Save overrides is clicked after toggling a cell', async () => {
    const user = userEvent.setup()
    const saveMutate = vi.fn((_payload, opts) => opts?.onSuccess?.())
    useUpdateTeacherAvailabilityOverrideMock.mockReturnValue({
      mutate: saveMutate,
      isPending: false,
      error: null,
    } as ReturnType<typeof useUpdateTeacherAvailabilityOverride>)

    render(<AvailabilityOverviewPage />)

    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    await user.click(within(aliceRow).getByRole('button', { name: /view availability for alice/i }))

    // Toggle Day A, Period 1 (currently unavailable → preferred)
    const dayAP1 = screen.getByRole('button', {
      name: /day a, period 1, unavailable/i,
    })
    await user.click(dayAP1)

    const saveButton = screen.getByRole('button', { name: /save overrides/i })
    await user.click(saveButton)

    expect(saveMutate).toHaveBeenCalledOnce()
    const [payload] = saveMutate.mock.calls[0]
    expect(payload.overriddenSlots).toHaveLength(1)
    expect(payload.overriddenSlots[0]).toMatchObject({
      cycleDayIndex: 0,
      periodId: 'period-mock-1',
      state: 'preferred',
    })
  })

  it('shows override count with blue indicator in the table', () => {
    useAvailabilitySummaryMock.mockReturnValue({
      data: [
        { ...fixtureSummary[0], overrideCount: 3 },
        fixtureSummary[1],
      ],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAvailabilitySummary>)

    render(<AvailabilityOverviewPage />)

    const aliceRow = screen.getByText('Alice Chen').closest('tr')!
    expect(within(aliceRow).getByText('3')).toBeInTheDocument()
  })

  it('renders loading state while data is fetching', () => {
    useTeachersMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useTeachers>)

    render(<AvailabilityOverviewPage />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading teachers/i)
  })

  it('shows access denied message when user lacks teachers:manage permission', () => {
    mockUseInstitutionPermission.mockReturnValue(false)

    render(<AvailabilityOverviewPage />)

    expect(
      screen.getByText(/you do not have permission to view availability overrides/i),
    ).toBeInTheDocument()
  })
})
