import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import CycleSettingsPage from './CycleSettingsPage'
import type { AcademicTermsDto, CycleSettingsDto } from '@/types/cycle-term.types'
import { padDayLabels } from '@/lib/cycle-term-utils'

let serverCycle: CycleSettingsDto = {
  cycleLengthDays: 5,
  dayLabels: ['Day A', 'Day B', 'Day C', 'Day D', 'Day E'],
}

let serverTerms: AcademicTermsDto = {
  terms: [
    {
      id: 'term-mock-1',
      name: 'Spring',
      startDate: '2026-01-15',
      endDate: '2026-06-30',
    },
  ],
}

const server = setupServer(
  http.get('/api/v1/settings/cycle', () => HttpResponse.json(serverCycle)),
  http.put('/api/v1/settings/cycle', async ({ request }) => {
    const body = (await request.json()) as CycleSettingsDto
    serverCycle = {
      cycleLengthDays: body.cycleLengthDays,
      dayLabels: padDayLabels(body.dayLabels, body.cycleLengthDays),
    }
    return HttpResponse.json(serverCycle)
  }),
  http.get('/api/v1/settings/academic-terms', () => HttpResponse.json(serverTerms)),
  http.put('/api/v1/settings/academic-terms', async ({ request }) => {
    const body = (await request.json()) as AcademicTermsDto
    for (const t of body.terms) {
      if (t.endDate < t.startDate) {
        return HttpResponse.json(
          {
            status: 400,
            code: 'TERM_DATE_ORDER',
            message: 'End date must be on or after the start date.',
          },
          { status: 400 },
        )
      }
    }
    serverTerms = { terms: body.terms.map((t) => ({ ...t })) }
    return HttpResponse.json(serverTerms)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  serverCycle = {
    cycleLengthDays: 5,
    dayLabels: ['Day A', 'Day B', 'Day C', 'Day D', 'Day E'],
  }
  serverTerms = {
    terms: [
      {
        id: 'term-mock-1',
        name: 'Spring',
        startDate: '2026-01-15',
        endDate: '2026-06-30',
      },
    ],
  }
  server.resetHandlers()
})
afterAll(() => server.close())

describe('CycleSettingsPage', () => {
  it('renders cycle and academic terms section headings', async () => {
    render(<CycleSettingsPage />)
    expect(screen.getByRole('heading', { name: /^cycle$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /academic term/i })).toBeInTheDocument()
  })

  it('loads cycle day labels from the API', async () => {
    render(<CycleSettingsPage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Day A')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('Day E')).toBeInTheDocument()
  })

  it('lists terms chronologically with name and dates', async () => {
    serverTerms = {
      terms: [
        {
          id: 'later',
          name: 'Fall',
          startDate: '2026-09-01',
          endDate: '2026-12-20',
        },
        {
          id: 'earlier',
          name: 'Spring',
          startDate: '2026-01-10',
          endDate: '2026-06-30',
        },
      ],
    }

    render(<CycleSettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('table', { name: /academic term/i })).toBeInTheDocument()
    })

    const table = screen.getByRole('table', { name: /academic term/i })
    const rows = within(table).getAllByRole('row')
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(within(rows[1]).getByDisplayValue('Spring')).toBeInTheDocument()
    expect(within(rows[2]).getByDisplayValue('Fall')).toBeInTheDocument()
  })

  it('shows a validation error when end date is before start date', async () => {
    const user = userEvent.setup()
    render(<CycleSettingsPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Spring')).toBeInTheDocument()
    })

    const startInputs = screen.getAllByLabelText('Start date')
    const endInputs = screen.getAllByLabelText('End date')
    const startInput = startInputs[0]
    const endInput = endInputs[0]

    await user.clear(startInput)
    await user.type(startInput, '2027-01-01')
    await user.clear(endInput)
    await user.type(endInput, '2026-06-01')

    await user.click(screen.getByRole('button', { name: /save terms/i }))

    await waitFor(() => {
      expect(screen.getByText(/End date must be on or after the start date/i)).toBeInTheDocument()
    })
  })

  it('saves the cycle successfully', async () => {
    const user = userEvent.setup()
    render(<CycleSettingsPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Day A')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^save cycle$/i }))

    await waitFor(() => {
      expect(screen.getByText(/cycle saved successfully/i)).toBeInTheDocument()
    })
  })
})
