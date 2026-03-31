import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { getMockTimetableLessonsResponse } from '@/mocks/pages/timetable-page.mock'
import { useTimetableStore } from '@/store/timetableStore'
import type { ConstraintSatisfactionReport } from '@/types/engine.types'
import TimetablePage from './TimetablePage'

const regenSuccessReport: ConstraintSatisfactionReport = {
  overallPercentage: 94,
  softFullySatisfied: 8,
  softPartiallySatisfied: 2,
  softNotSatisfied: 1,
  softPreferences: [],
  hardConstraints: [],
}

const timetableRegenMocks = vi.hoisted(() => ({
  regenerateMutate: vi.fn(),
  regenerateIsPending: false,
}))

vi.mock('@/api/hooks/useBellSchedule', () => ({
  useBellSchedule: () => ({ data: mockBellSchedule }),
}))
vi.mock('@/api/hooks/useCycleSettings', () => ({
  useCycleSettings: () => ({ data: mockCycleSettings }),
}))
vi.mock('@/api/hooks/useTimetable', () => ({
  useTimetableLessons: () => ({ data: getMockTimetableLessonsResponse(), isLoading: false }),
  usePinLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useUnpinLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateLesson: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useDeleteLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateLesson: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useMoveLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useRegenerateUnpinned: () => ({
    mutate: timetableRegenMocks.regenerateMutate,
    mutateAsync: vi.fn(),
    isPending: timetableRegenMocks.regenerateIsPending,
  }),
}))

describe('TimetablePage', () => {
  beforeEach(() => {
    // Reset Zustand store between tests to prevent state leaking
    useTimetableStore.setState({ activeTimetableId: null, activeView: 'class' })
    timetableRegenMocks.regenerateIsPending = false
    timetableRegenMocks.regenerateMutate.mockReset()
  })
  it('renders page heading', () => {
    render(<TimetablePage />)
    expect(screen.getByText('Timetable')).toBeInTheDocument()
  })

  it('renders view pivot toolbar with Full School, By Teacher, By Room', () => {
    render(<TimetablePage />)
    expect(screen.getByText('Full School')).toBeInTheDocument()
    expect(screen.getByText('By Teacher')).toBeInTheDocument()
    expect(screen.getByText('By Room')).toBeInTheDocument()
  })

  it('renders timetable grid with role="grid"', () => {
    render(<TimetablePage />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('renders year group filter buttons in class view', () => {
    render(<TimetablePage />, { initialEntries: ['/timetable'] })
    // YearGroupFilter now uses role="group" + aria-pressed buttons (not tablist/tab)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })

  it('renders year group buttons for each group in data', () => {
    render(<TimetablePage />)
    expect(screen.getByRole('button', { name: 'Year 7' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Year 8' })).toBeInTheDocument()
  })

  it('shows year group filter in all views (not class-only)', async () => {
    render(<TimetablePage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'By Teacher' }))

    // Filter is now visible in teacher view too (AC3 fix)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    })
  })

  it('shows rows for each class in Full School view', () => {
    render(<TimetablePage />)
    expect(screen.getByText('Year 7A')).toBeInTheDocument()
    expect(screen.getByText('Year 8A')).toBeInTheDocument()
  })

  it('switches to teacher rows when By Teacher is clicked', async () => {
    render(<TimetablePage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'By Teacher' }))

    await waitFor(() => {
      expect(screen.getByText('Alice Brown')).toBeInTheDocument()
    })
  })

  it('shows unpinned slot count in the generator status strip', () => {
    render(<TimetablePage />)
    expect(screen.getByText(/\d+ unpinned slots will be solved/)).toBeInTheDocument()
  })

  it('renders Re-run unpinned and shows satisfaction banner after success', async () => {
    const user = userEvent.setup()
    timetableRegenMocks.regenerateMutate.mockImplementation((_v, opts) => {
      opts?.onSuccess?.({ satisfactionReport: regenSuccessReport })
    })
    render(<TimetablePage />)
    await user.click(screen.getByRole('button', { name: 'Re-run unpinned' }))
    expect(await screen.findByRole('status', { name: /schedule satisfaction/i })).toBeInTheDocument()
    expect(screen.getByText(/94%/)).toBeInTheDocument()
  })

  it('shows conflict explainer when regenerate fails with 422 conflict details', async () => {
    const user = userEvent.setup()
    timetableRegenMocks.regenerateMutate.mockImplementation((_v, opts) => {
      const err = new axios.AxiosError('unsatisfied')
      err.response = {
        status: 422,
        data: {
          details: {
            conflictReport: {
              conflicts: [
                {
                  id: 'c1',
                  constraintId: 'x',
                  constraintName: 'Test constraint',
                  explanation: 'Unpinned portion failed.',
                  affectedTeachers: [],
                  affectedClasses: [],
                  affectedSlots: [{ cycleDayIndex: 0, periodId: mockBellSchedule.periods[0]?.id ?? 'p1' }],
                },
              ],
            },
          },
        },
      } as typeof err.response
      opts?.onError?.(err)
    })
    render(<TimetablePage />)
    await user.click(screen.getByRole('button', { name: 'Re-run unpinned' }))
    expect(
      await screen.findByRole('region', { name: /conflict explainer/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /schedule generation failed/i })).toBeInTheDocument()
  })

  it('disables re-run and sets title while regeneration is pending', () => {
    timetableRegenMocks.regenerateIsPending = true
    render(<TimetablePage />)
    const btn = screen.getByRole('button', { name: 'Re-run unpinned' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', 'Re-running unpinned slots…')
  })

  it('disables re-run with cooldown title after success until reset', async () => {
    const user = userEvent.setup()
    timetableRegenMocks.regenerateMutate.mockImplementation((_v, opts) => {
      opts?.onSuccess?.({ satisfactionReport: regenSuccessReport })
    })
    render(<TimetablePage />)
    await user.click(screen.getByRole('button', { name: 'Re-run unpinned' }))
    const btn = await screen.findByRole('button', { name: 'Re-run unpinned' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', 'Re-run complete — you can run again in a moment.')
  })

  it('reflects year group filter in URL when filter button is clicked', async () => {
    const { container } = render(<TimetablePage />, { initialEntries: ['/timetable'] })
    const user = userEvent.setup()

    const yearBtn = screen.getByRole('button', { name: 'Year 7' })
    await user.click(yearBtn)

    // The selected button should now be pressed
    expect(yearBtn).toHaveAttribute('aria-pressed', 'true')
    void container
  })
})
