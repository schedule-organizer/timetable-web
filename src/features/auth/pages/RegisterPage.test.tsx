import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { Routes, Route } from 'react-router-dom'
import { render } from '@/test/test-utils'
import { useAuthStore } from '@/store/authStore'
import RegisterPage from './RegisterPage'

const server = setupServer(
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; fullName: string }
    return HttpResponse.json({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: 'user-1',
        email: body.email,
        fullName: body.fullName,
        role: 'ADMIN',
        institutionId: 'inst-1',
        createdAt: '2026-03-28T00:00:00Z',
      },
    })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
})
afterAll(() => server.close())

function renderWithRoutes() {
  return render(
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>,
    { initialEntries: ['/auth/register'] },
  )
}

describe('RegisterPage', () => {
  it('renders all required form fields', () => {
    renderWithRoutes()

    expect(screen.getByRole('textbox', { name: /institution name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /your full name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create institution & account/i }),
    ).toBeInTheDocument()
  })

  it('renders the SchediFlow brand heading', () => {
    renderWithRoutes()
    expect(screen.getByRole('heading', { name: /schediflow/i })).toBeInTheDocument()
  })

  it('renders a link to sign in page', () => {
    renderWithRoutes()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/auth/login')
  })

  it('shows validation errors when form is submitted empty', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.click(screen.getByRole('button', { name: /create institution/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/institution name must be at least 2 characters/i),
      ).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(screen.getByRole('textbox', { name: /institution name/i }), 'Springfield')
    await user.type(screen.getByRole('textbox', { name: /your full name/i }), 'Jane Smith')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /create institution/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows password validation error for short password', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(screen.getByRole('textbox', { name: /institution name/i }), 'Springfield')
    await user.type(screen.getByRole('textbox', { name: /your full name/i }), 'Jane Smith')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@test.com')
    await user.type(screen.getByLabelText(/password/i), 'short')

    await user.click(screen.getByRole('button', { name: /create institution/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('navigates to dashboard on successful registration', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(
      screen.getByRole('textbox', { name: /institution name/i }),
      'Springfield High',
    )
    await user.type(screen.getByRole('textbox', { name: /your full name/i }), 'Jane Smith')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@springfield.edu')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /create institution/i }))

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  it('sets auth store state on successful registration', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(
      screen.getByRole('textbox', { name: /institution name/i }),
      'Springfield High',
    )
    await user.type(screen.getByRole('textbox', { name: /your full name/i }), 'Jane Smith')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@springfield.edu')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /create institution/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().accessToken).toBe('test-access-token')
    })
  })

  it('shows error message when registration API fails', async () => {
    server.use(
      http.post('/api/v1/auth/register', () =>
        HttpResponse.json(
          { status: 400, code: 'EMAIL_TAKEN', message: 'Email already taken' },
          { status: 400 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(
      screen.getByRole('textbox', { name: /institution name/i }),
      'Springfield High',
    )
    await user.type(screen.getByRole('textbox', { name: /your full name/i }), 'Jane Smith')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@springfield.edu')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /create institution/i }))

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(within(alert).getByText(/registration failed/i)).toBeInTheDocument()
    })
  })
})
