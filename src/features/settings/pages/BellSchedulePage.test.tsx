import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import BellSchedulePage from './BellSchedulePage'
import type { BellScheduleDto } from '@/types/bell-schedule.types'
import { findFirstOverlappingPair } from '@/lib/bell-schedule-utils'

let serverBellSchedule: BellScheduleDto = {
  periods: [
    { id: 't1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { id: 't2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
  ],
}

const server = setupServer(
  http.get('/api/v1/settings/bell-schedule', () => HttpResponse.json(serverBellSchedule)),
  http.put('/api/v1/settings/bell-schedule', async ({ request }) => {
    const body = (await request.json()) as BellScheduleDto
    const overlap = findFirstOverlappingPair(body.periods)
    if (overlap) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'BELL_SCHEDULE_OVERLAP',
          message: `Time ranges overlap between "${overlap.periodA.name}" and "${overlap.periodB.name}".`,
          details: {
            periodA: { id: overlap.periodA.id, name: overlap.periodA.name },
            periodB: { id: overlap.periodB.id, name: overlap.periodB.name },
          },
        },
        { status: 400 },
      )
    }
    serverBellSchedule = { periods: body.periods.map((p) => ({ ...p })) }
    return HttpResponse.json(serverBellSchedule)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  serverBellSchedule = {
    periods: [
      { id: 't1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
      { id: 't2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
    ],
  }
  server.resetHandlers()
})
afterAll(() => server.close())

describe('BellSchedulePage', () => {
  it('renders the bell schedule section heading', async () => {
    render(<BellSchedulePage />)
    expect(screen.getByRole('heading', { name: /bell schedule/i })).toBeInTheDocument()
  })

  it('lists periods after load', async () => {
    render(<BellSchedulePage />)
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /ordered period list/i })).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('Period 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Period 2')).toBeInTheDocument()
  })

  it('shows validation when overlapping times are saved', async () => {
    const user = userEvent.setup()
    render(<BellSchedulePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Period 1')).toBeInTheDocument()
    })

    const [period1End] = screen.getAllByLabelText('End time')
    fireEvent.change(period1End, { target: { value: '10:00' } })

    await user.click(screen.getByRole('button', { name: /save bell schedule/i }))

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(within(alert).getByText(/Time ranges overlap between/i)).toBeInTheDocument()
    })
  })

  it('AC2: saves periods in current display order', async () => {
    const user = userEvent.setup()
    let savedOrder: string[] = []

    server.use(
      http.put('/api/v1/settings/bell-schedule', async ({ request }) => {
        const body = (await request.json()) as BellScheduleDto
        savedOrder = body.periods.map((p) => p.name)
        return HttpResponse.json(body)
      }),
    )

    render(<BellSchedulePage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Period 1')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /save bell schedule/i }))

    await waitFor(() => {
      expect(screen.getByText(/bell schedule saved successfully/i)).toBeInTheDocument()
    })

    expect(savedOrder).toEqual(['Period 1', 'Period 2'])
  })

  it('saves a new period and shows success', async () => {
    const user = userEvent.setup()
    render(<BellSchedulePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add period/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add period/i }))

    const nameInputs = screen.getAllByRole('textbox', { name: /period name/i })
    const lastName = nameInputs[nameInputs.length - 1]
    await user.type(lastName, 'Lunch')

    await user.click(screen.getByRole('button', { name: /save bell schedule/i }))

    await waitFor(() => {
      expect(screen.getByText(/bell schedule saved successfully/i)).toBeInTheDocument()
    })
  })
})
