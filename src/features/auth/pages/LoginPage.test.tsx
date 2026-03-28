import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { Routes, Route } from 'react-router-dom'
import { render } from '@/test/test-utils'
import { useAuthStore } from '@/store/authStore'
import LoginPage from './LoginPage'

const server = setupServer(
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string }
    return HttpResponse.json({
      accessToken: 'login-access-token',
      refreshToken: 'login-refresh-token',
      user: {
        id: 'user-2',
        email: body.email,
        fullName: 'Timetabler',
        role: 'ADMIN',
        institutionId: 'inst-2',
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
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<div>Register Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>,
    { initialEntries: ['/auth/login'] },
  )
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderWithRoutes()

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders SchediFlow brand heading', () => {
    renderWithRoutes()
    expect(screen.getByRole('heading', { name: /schediflow/i })).toBeInTheDocument()
  })

  it('renders a link to register page', () => {
    renderWithRoutes()
    expect(screen.getByRole('link', { name: /create institution/i })).toHaveAttribute(
      'href',
      '/auth/register',
    )
  })

  it('shows validation errors when form is submitted empty', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
    })
  })

  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@springfield.edu')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  it('sets auth store on successful login', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@springfield.edu')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().accessToken).toBe('login-access-token')
    })
  })

  it('shows error message when login fails', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json(
          { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
          { status: 401 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderWithRoutes()

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'wrong@email.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })
})
