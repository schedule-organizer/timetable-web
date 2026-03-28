import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import MagicLinkOnboardingPage from '@/features/teachers/pages/MagicLinkOnboardingPage'

const validTokenResponse = {
  teacherId: 'teacher-2',
  email: 'bob@school.edu',
  institutionName: 'Springfield Academy',
}

const activatedResponse = {
  accessToken: 'teacher-token-123',
  refreshToken: 'teacher-refresh-123',
  user: {
    id: 'teacher-2',
    email: 'bob@school.edu',
    fullName: 'Bob Jones',
    role: 'TEACHER',
    institutionId: 'inst-1',
    createdAt: new Date().toISOString(),
  },
}

const server = setupServer(
  http.get('/api/v1/auth/magic-link/validate', ({ request }) => {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    if (token === 'valid-token') {
      return HttpResponse.json(validTokenResponse)
    }
    return HttpResponse.json(
      {
        status: 410,
        code: 'LINK_INVALID',
        message: 'This link has expired or has already been used.',
      },
      { status: 410 },
    )
  }),
  http.post('/api/v1/auth/magic-link/complete', () => HttpResponse.json(activatedResponse)),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderWithToken(token?: string) {
  const search = token ? `?token=${token}` : ''
  return render(<MagicLinkOnboardingPage />, {
    initialEntries: [`/auth/magic-link${search}`],
  })
}

describe('MagicLinkOnboardingPage', () => {
  it('shows error when no token is present in URL', () => {
    renderWithToken()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/no invitation token found/i)).toBeInTheDocument()
    expect(screen.getByText(/ask your timetabler/i)).toBeInTheDocument()
  })

  it('shows validating state while checking token', () => {
    renderWithToken('valid-token')

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/validating your invitation link/i)).toBeInTheDocument()
  })

  it('shows the institution name and onboarding form for a valid token', async () => {
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByText('Springfield Academy')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /activate my account/i })).toBeInTheDocument()
  })

  it('pre-fills email field (read-only) with teacher email', async () => {
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByLabelText(/your email address/i)).toBeInTheDocument()
    })

    const emailField = screen.getByLabelText(/your email address/i)
    expect(emailField).toHaveValue('bob@school.edu')
    expect(emailField).toHaveAttribute('readonly')
  })

  it('shows error when token is invalid or expired', async () => {
    renderWithToken('expired-token')

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(
      screen.getByText(/this link has expired or has already been used/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/ask your timetabler to send you a new invitation/i)).toBeInTheDocument()
  })

  it('validates that name is required before submitting', async () => {
    const user = userEvent.setup()
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /activate my account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  it('activates account and shows success screen on valid form submission', async () => {
    const user = userEvent.setup()
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/your name/i), 'Bob Jones')
    await user.click(screen.getByRole('button', { name: /activate my account/i }))

    await waitFor(() => {
      expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/springfield academy/i)).toBeInTheDocument()
  })

  it('shows error when magic-link completion API fails', async () => {
    server.use(
      http.post('/api/v1/auth/magic-link/complete', () =>
        HttpResponse.json(
          {
            status: 410,
            code: 'LINK_USED',
            message: 'This link has expired or has already been used.',
          },
          { status: 410 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/your name/i), 'Bob Jones')
    await user.click(screen.getByRole('button', { name: /activate my account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/this link has expired or has already been used/i),
    ).toBeInTheDocument()
  })

  it('shows SchediFlow branding on the page', async () => {
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByText('SchediFlow')).toBeInTheDocument()
    })
  })

  it('optional photo URL field is present', async () => {
    renderWithToken('valid-token')

    await waitFor(() => {
      expect(screen.getByLabelText(/profile photo url/i)).toBeInTheDocument()
    })
  })
})
