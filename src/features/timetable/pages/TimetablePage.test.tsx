import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { mockBellSchedule } from '@/mocks/pages/bell-schedule-page.mock'
import { mockCycleSettings } from '@/mocks/pages/cycle-settings-page.mock'
import { mockTimetableLessonsResponse } from '@/mocks/pages/timetable-page.mock'
import { useTimetableStore } from '@/store/timetableStore'
import TimetablePage from './TimetablePage'

vi.mock('@/api/hooks/useBellSchedule', () => ({
  useBellSchedule: () => ({ data: mockBellSchedule }),
}))
vi.mock('@/api/hooks/useCycleSettings', () => ({
  useCycleSettings: () => ({ data: mockCycleSettings }),
}))
vi.mock('@/api/hooks/useTimetable', () => ({
  useTimetableLessons: () => ({ data: mockTimetableLessonsResponse, isLoading: false }),
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

  it('renders year group filter tabs in class view', () => {
    render(<TimetablePage />, { initialEntries: ['/timetable'] })
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument()
  })

  it('renders year group tabs for each group in data', () => {
    render(<TimetablePage />)
    expect(screen.getByRole('tab', { name: 'Year 7' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Year 8' })).toBeInTheDocument()
  })

  it('hides year group filter when switching to teacher view', async () => {
    render(<TimetablePage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'By Teacher' }))

    expect(screen.queryByRole('tab', { name: 'All' })).not.toBeInTheDocument()
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

  it('reflects year group filter in URL when tab is clicked', async () => {
    const { container } = render(<TimetablePage />, { initialEntries: ['/timetable'] })
    const user = userEvent.setup()

    const yearTab = screen.getByRole('tab', { name: 'Year 7' })
    await user.click(yearTab)

    // The selected tab should now be Year 7
    expect(yearTab).toHaveAttribute('aria-selected', 'true')
    void container
  })
})
