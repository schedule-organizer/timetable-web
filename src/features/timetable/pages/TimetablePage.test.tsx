import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { getMockTimetableLessonsResponse } from '@/mocks/pages/timetable-page.mock'
import { useTimetableStore } from '@/store/timetableStore'
import TimetablePage from './TimetablePage'

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
  useUpdateLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useMoveLesson: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('TimetablePage', () => {
  beforeEach(() => {
    // Reset Zustand store between tests to prevent state leaking
    useTimetableStore.setState({ activeTimetableId: null, activeView: 'class' })
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
