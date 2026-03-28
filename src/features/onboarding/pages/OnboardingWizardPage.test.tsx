import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { InstitutionTemplatesDto, AppliedTemplateSettings } from '@/types/template.types'

const mockTemplates: InstitutionTemplatesDto = {
  templates: [
    {
      id: 'tpl-secondary-5day',
      name: '5-Day Secondary School',
      description: 'Standard secondary school setup.',
      previewDetails: {
        cycleLengthDays: 5,
        periodsPerDay: 6,
        cycleDescription: '5-day rotating cycle (Day 1–Day 5)',
      },
    },
    {
      id: 'tpl-primary-5day',
      name: '5-Day Primary School',
      description: 'Primary school Monday-to-Friday.',
      previewDetails: {
        cycleLengthDays: 5,
        periodsPerDay: 5,
        cycleDescription: 'Monday to Friday',
      },
    },
  ],
}

const mockAppliedSettings: AppliedTemplateSettings = {
  templateId: 'tpl-secondary-5day',
  templateName: '5-Day Secondary School',
  bellSchedule: {
    periodsApplied: 6,
    firstPeriodStart: '08:00',
    lastPeriodEnd: '15:10',
  },
  cycle: {
    cycleLengthDays: 5,
    cycleDescription: '5-day rotating cycle (Day 1–Day 5)',
  },
  terminology: {
    overridesApplied: [],
  },
}

const server = setupServer(
  http.get('/api/v1/settings/templates', () => HttpResponse.json(mockTemplates)),
  http.post('/api/v1/settings/apply-template', () => HttpResponse.json(mockAppliedSettings)),
  http.get('/api/v1/settings/bell-schedule', () =>
    HttpResponse.json({ periods: [{ id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '09:00' }] }),
  ),
  http.get('/api/v1/settings/cycle', () =>
    HttpResponse.json({ cycleLengthDays: 5, dayLabels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'] }),
  ),
  http.get('/api/v1/settings/academic-terms', () =>
    HttpResponse.json({ terms: [{ id: 't1', name: 'Spring', startDate: '2026-01-01', endDate: '2026-06-30' }] }),
  ),
  http.get('/api/v1/settings/labels', () => HttpResponse.json({})),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Reset Zustand wizard state before each test
beforeEach(() => {
  useOnboardingStore.getState().resetWizard()
})

describe('DashboardPage — Onboarding Wizard', () => {
  it('shows the onboarding wizard with step indicator on initial load', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Welcome to SchediFlow')).toBeInTheDocument()
    })

    expect(screen.getByRole('navigation', { name: /onboarding steps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /choose template/i })).toBeInTheDocument()
  })

  it('renders available templates with descriptions in step 1', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    expect(screen.getByText('5-Day Primary School')).toBeInTheDocument()
    expect(screen.getByText('Standard secondary school setup.')).toBeInTheDocument()
  })

  it('template cards act as radio buttons — selecting one marks it checked', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    const secondaryCard = screen.getByRole('radio', { name: /5-day secondary school/i })
    expect(secondaryCard).toHaveAttribute('aria-checked', 'false')

    await user.click(secondaryCard)
    expect(secondaryCard).toHaveAttribute('aria-checked', 'true')
  })

  it('"Apply This Template" button is disabled until a template is selected', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /apply this template/i })).toBeDisabled()
  })

  it('moves to step 2 (summary) after applying a template', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/5-Day Secondary School/)).toBeInTheDocument()
    expect(screen.getByText(/6 periods/i)).toBeInTheDocument()
    expect(screen.getByText(/5-day rotating cycle/i)).toBeInTheDocument()
  })

  it('going back from step 2 to step 1 preserves the selected template', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose template/i })).toBeInTheDocument()
    })

    // Selected template should still be checked
    const secondaryCard = screen.getByRole('radio', { name: /5-day secondary school/i })
    expect(secondaryCard).toHaveAttribute('aria-checked', 'true')
  })

  it('moves to step 3 (setup complete) from step 2', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /continue to setup checklist/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /setup complete/i })).toBeInTheDocument()
    })
  })

  it('setup checklist shows all configuration areas', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Navigate through to step 3
    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: /continue to setup checklist/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /setup complete/i })).toBeInTheDocument()
    })

    const checklist = screen.getByRole('list', { name: /setup checklist/i })
    expect(within(checklist).getByText('Bell Schedule')).toBeInTheDocument()
    expect(within(checklist).getByText('Cycle')).toBeInTheDocument()
    expect(within(checklist).getByText('Academic Terms')).toBeInTheDocument()
    expect(within(checklist).getByText('Terminology')).toBeInTheDocument()
  })

  it('"Go to Dashboard" completes the wizard and shows the setup dashboard', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Navigate through all 3 wizard steps
    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: /continue to setup checklist/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /setup complete/i })).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: /go to dashboard/i }))

    // After completing wizard, dashboard shows checklist without wizard chrome
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^setup dashboard$/i })).toBeInTheDocument()
    })

    expect(screen.queryByText('Welcome to SchediFlow')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /setup checklist/i })).toBeInTheDocument()
  })

  it('step indicator shows correct current step', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    const nav = screen.getByRole('navigation', { name: /onboarding steps/i })

    // Step 1 should be current
    expect(within(nav).getByRole('button', { name: /step 1.*current/i })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument()
    })

    // Step 2 should be current
    expect(within(nav).getByRole('button', { name: /step 2.*current/i })).toBeInTheDocument()
  })

  it('clicking a completed step number jumps back to that step', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /review defaults/i })).toBeInTheDocument()
    })

    // Click step 1 to go back
    const nav = screen.getByRole('navigation', { name: /onboarding steps/i })
    const step1Button = within(nav).getByRole('button', { name: /step 1/i })
    await user.click(step1Button)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose template/i })).toBeInTheDocument()
    })
  })

  it('shows an error when apply-template API fails', async () => {
    server.use(
      http.post('/api/v1/settings/apply-template', () =>
        HttpResponse.json(
          { status: 500, code: 'SERVER_ERROR', message: 'Internal server error.' },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('5-Day Secondary School')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /5-day secondary school/i }))
    await user.click(screen.getByRole('button', { name: /apply this template/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByText(/internal server error/i)).toBeInTheDocument()
  })
})
