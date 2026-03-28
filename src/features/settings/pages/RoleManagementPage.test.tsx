import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import { useAuthStore } from '@/store/authStore'
import RoleManagementPage from '@/features/settings/pages/RoleManagementPage'
import type { UsersWithRolesDto, SubscriptionLimits } from '@/types/rbac.types'

const timetablerUser = {
  id: 'viewer-1',
  email: 'viewer@test.com',
  fullName: 'Viewer',
  role: 'ADMIN' as const,
  roles: ['TIMETABLER'] as const,
  institutionId: 'inst-1',
  createdAt: '2026-01-01T00:00:00Z',
}

const mockUsers: UsersWithRolesDto = {
  content: [
    {
      id: 'user-1',
      email: 'admin@school.edu',
      fullName: 'Alex Timetabler',
      roles: ['TIMETABLER'],
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'user-2',
      email: 'teacher@school.edu',
      fullName: 'Alice Chen',
      roles: ['TEACHER'],
      createdAt: '2026-01-15T11:00:00Z',
    },
    {
      id: 'user-3',
      email: 'dual@school.edu',
      fullName: 'Bob Smith',
      roles: ['TEACHER', 'MODERATOR'],
      createdAt: '2026-01-16T12:00:00Z',
    },
  ],
}

const mockLimits: SubscriptionLimits = {
  tier: 'STARTER',
  limits: { maxClasses: 20, maxTeachers: 30, maxTerms: 2 },
  usage: { classes: 8, teachers: 5, terms: 1 },
}

const server = setupServer(
  http.get('/api/v1/users', () => HttpResponse.json(mockUsers)),
  http.put('/api/v1/users/:id/roles', ({ params }) => {
    const user = mockUsers.content.find((u) => u.id === params.id)
    return HttpResponse.json({ user })
  }),
  http.get('/api/v1/subscription/limits', () => HttpResponse.json(mockLimits)),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => {
  useAuthStore.setState({ user: timetablerUser, accessToken: 'token', isAuthenticated: true })
})
afterEach(() => {
  server.resetHandlers()
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
})
afterAll(() => server.close())

describe('RoleManagementPage', () => {
  it('redirects when user lacks roles:assign permission', () => {
    useAuthStore.setState({
      user: {
        id: 't-1',
        email: 't@t.com',
        fullName: 'Teacher',
        role: 'TEACHER',
        roles: ['TEACHER'],
        institutionId: 'inst-1',
        createdAt: '2026-01-01T00:00:00Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
    })
    render(<RoleManagementPage />, { initialEntries: ['/settings/roles'] })
    expect(screen.queryByRole('heading', { name: /user roles/i })).not.toBeInTheDocument()
  })

  it('renders user list with names and emails', async () => {
    render(<RoleManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('Alex Timetabler')).toBeInTheDocument()
    })

    expect(screen.getByText('admin@school.edu')).toBeInTheDocument()
    expect(screen.getByText('Alice Chen')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<RoleManagementPage />)
    const statuses = screen.getAllByRole('status')
    expect(statuses.length).toBeGreaterThanOrEqual(1)
  })

  it('renders role badges for each user', async () => {
    render(<RoleManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('Alex Timetabler')).toBeInTheDocument()
    })

    expect(screen.getByText('Timetabler')).toBeInTheDocument()
    // Alice has TEACHER, Bob has TEACHER + MODERATOR → multiple Teacher badges
    const teacherBadges = screen.getAllByText('Teacher')
    expect(teacherBadges.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Moderator')).toBeInTheDocument()
  })

  it('shows an edit button for each user', async () => {
    render(<RoleManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('Alex Timetabler')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /edit roles for alex timetabler/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit roles for alice chen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit roles for bob smith/i })).toBeInTheDocument()
  })

  it('shows error when API fails', async () => {
    server.use(
      http.get('/api/v1/users', () =>
        HttpResponse.json(
          { status: 500, code: 'SERVER_ERROR', message: 'Server error.' },
          { status: 500 },
        ),
      ),
    )

    render(<RoleManagementPage />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows empty state when no users exist', async () => {
    server.use(http.get('/api/v1/users', () => HttpResponse.json({ content: [] })))

    render(<RoleManagementPage />)

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    })
  })

  it('displays subscription limits card with tier and usage', async () => {
    render(<RoleManagementPage />)

    // Wait for subscription data to load (limits display renders "used / max" values)
    await waitFor(() => {
      expect(screen.getByText('8 / 20')).toBeInTheDocument()
    })

    expect(screen.getByText(/starter tier/i)).toBeInTheDocument()
    expect(screen.getByText('5 / 30')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('shows "Limit reached" warning when at capacity', async () => {
    server.use(
      http.get('/api/v1/subscription/limits', () =>
        HttpResponse.json({
          tier: 'STARTER',
          limits: { maxClasses: 20, maxTeachers: 30, maxTerms: 2 },
          usage: { classes: 20, teachers: 30, terms: 2 },
        } satisfies SubscriptionLimits),
      ),
    )

    render(<RoleManagementPage />)

    await waitFor(() => {
      const warnings = screen.getAllByText(/limit reached/i)
      expect(warnings.length).toBeGreaterThan(0)
    })
  })

  it('shows "Unlimited" for Professional tier unlimited fields', async () => {
    server.use(
      http.get('/api/v1/subscription/limits', () =>
        HttpResponse.json({
          tier: 'PROFESSIONAL',
          limits: { maxClasses: 100, maxTeachers: 200, maxTerms: null },
          usage: { classes: 10, teachers: 20, terms: 3 },
        } satisfies SubscriptionLimits),
      ),
    )

    render(<RoleManagementPage />)

    await waitFor(() => {
      expect(screen.getByText(/professional tier/i)).toBeInTheDocument()
    })

    expect(screen.getByText('3 / Unlimited')).toBeInTheDocument()
  })

  describe('AssignRolesDialog', () => {
    it('opens the assign roles dialog when Edit Roles is clicked', async () => {
      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alex Timetabler')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alex timetabler/i }))

      expect(screen.getByRole('dialog', { name: /assign roles/i })).toBeInTheDocument()
    })

    it('pre-checks the user current roles in the dialog', async () => {
      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alex Timetabler')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alex timetabler/i }))

      const timetablerCheckbox = screen.getByRole('checkbox', { name: /timetabler/i })
      expect(timetablerCheckbox).toBeChecked()

      const teacherCheckbox = screen.getByRole('checkbox', { name: /teacher/i })
      expect(teacherCheckbox).not.toBeChecked()
    })

    it('pre-checks multiple roles for users with multiple roles', async () => {
      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Bob Smith')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for bob smith/i }))

      expect(screen.getByRole('checkbox', { name: /teacher/i })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /moderator/i })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /timetabler/i })).not.toBeChecked()
    })

    it('closes the dialog when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alex Timetabler')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alex timetabler/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('shows validation error when no role is selected on submit', async () => {
      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alex Timetabler')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alex timetabler/i }))

      // Uncheck the Timetabler role so nothing is selected
      await user.click(screen.getByRole('checkbox', { name: /timetabler/i }))
      await user.click(screen.getByRole('button', { name: /save roles/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByText(/at least one role/i)).toBeInTheDocument()
    })

    it('calls PUT /api/v1/users/:id/roles when saving roles', async () => {
      let capturedBody: unknown = null
      server.use(
        http.put('/api/v1/users/:id/roles', async ({ request, params }) => {
          capturedBody = await request.json()
          const u = mockUsers.content.find((x) => x.id === params.id)
          return HttpResponse.json({ user: u })
        }),
      )

      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alice Chen')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alice chen/i }))

      // Add Moderator role
      await user.click(screen.getByRole('checkbox', { name: /moderator/i }))
      await user.click(screen.getByRole('button', { name: /save roles/i }))

      await waitFor(() => {
        expect(capturedBody).toBeDefined()
      })

      const body = capturedBody as { roles: string[] }
      expect(body.roles).toContain('TEACHER')
      expect(body.roles).toContain('MODERATOR')
    })

    it('shows success message after saving and closes the dialog', async () => {
      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alice Chen')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alice chen/i }))
      await user.click(screen.getByRole('button', { name: /save roles/i }))

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
      expect(screen.getByText(/roles updated successfully/i)).toBeInTheDocument()
    })

    it('shows API error when role assignment fails', async () => {
      server.use(
        http.put('/api/v1/users/:id/roles', () =>
          HttpResponse.json(
            { status: 403, code: 'FORBIDDEN', message: 'Permission denied.' },
            { status: 403 },
          ),
        ),
      )

      const user = userEvent.setup()
      render(<RoleManagementPage />)

      await waitFor(() => expect(screen.getByText('Alice Chen')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /edit roles for alice chen/i }))
      await user.click(screen.getByRole('button', { name: /save roles/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument()
    })
  })
})
