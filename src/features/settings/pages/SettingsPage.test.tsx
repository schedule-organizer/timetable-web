import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import { useTenantStore } from '@/store/tenantStore'
import SettingsPage from './SettingsPage'
import type { TerminologyLabels } from '@/types/settings.types'

// In-memory labels for test server — reset on each test
let serverLabels: TerminologyLabels = {
  period: '',
  class: '',
  term: '',
  cycle: '',
  bellSchedule: '',
  room: '',
  subject: '',
}

const server = setupServer(
  http.get('/api/v1/settings/labels', () => HttpResponse.json(serverLabels)),
  http.put('/api/v1/settings/labels', async ({ request }) => {
    const body = (await request.json()) as TerminologyLabels
    serverLabels = { ...body }
    return HttpResponse.json(serverLabels)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  serverLabels = {
    period: '',
    class: '',
    term: '',
    cycle: '',
    bellSchedule: '',
    room: '',
    subject: '',
  }
  server.resetHandlers()
  useTenantStore.setState({ labels: {} })
})
afterAll(() => server.close())

describe('SettingsPage — Terminology', () => {
  it('renders the Institution Settings heading', async () => {
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: /institution settings/i })).toBeInTheDocument()
  })

  it('renders the Terminology section heading', async () => {
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: /terminology/i })).toBeInTheDocument()
  })

  it('renders editable fields for all 7 configurable terms', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /period/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /class/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /term/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /cycle/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /bell schedule/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /room/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /subject/i })).toBeInTheDocument()
    })
  })

  it('renders a Save Terminology button', async () => {
    render(<SettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save terminology/i })).toBeInTheDocument()
    })
  })

  it('populates fields with existing custom labels on load', async () => {
    serverLabels = { ...serverLabels, period: 'Lesson', class: 'Year Group' }

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /period/i })).toHaveValue('Lesson')
      expect(screen.getByRole('textbox', { name: /class/i })).toHaveValue('Year Group')
    })
  })

  it('saves updated terminology and shows success message', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /period/i })).toBeInTheDocument()
    })

    const periodInput = screen.getByRole('textbox', { name: /period/i })
    await user.clear(periodInput)
    await user.type(periodInput, 'Lesson')

    await user.click(screen.getByRole('button', { name: /save terminology/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/terminology saved successfully/i)).toBeInTheDocument()
    })
  })

  it('updates tenantStore labels after save', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /period/i })).toBeInTheDocument()
    })

    const periodInput = screen.getByRole('textbox', { name: /period/i })
    await user.clear(periodInput)
    await user.type(periodInput, 'Lesson')

    await user.click(screen.getByRole('button', { name: /save terminology/i }))

    await waitFor(() => {
      expect(useTenantStore.getState().labels.period).toBe('Lesson')
    })
  })

  it('clears a term (empty input) and restores the default via useLabels', async () => {
    serverLabels = { ...serverLabels, period: 'Lesson' }
    const user = userEvent.setup()

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /period/i })).toHaveValue('Lesson')
    })

    const periodInput = screen.getByRole('textbox', { name: /period/i })
    await user.clear(periodInput)

    await user.click(screen.getByRole('button', { name: /save terminology/i }))

    await waitFor(() => {
      // After clearing, tenantStore label is empty → useLabels returns SchediFlow default.
      expect(useTenantStore.getState().labels.period).toBe('')
    })
  })

  it('shows an error message when the save API fails', async () => {
    server.use(
      http.put('/api/v1/settings/labels', () =>
        HttpResponse.json(
          { status: 500, code: 'SERVER_ERROR', message: 'Internal server error' },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save terminology/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /save terminology/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/failed to save terminology/i)).toBeInTheDocument()
    })
  })
})
