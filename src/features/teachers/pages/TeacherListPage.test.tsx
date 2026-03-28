import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import TeacherListPage from '@/features/teachers/pages/TeacherListPage'
import type { InvitedTeachersDto, SendInvitationsResponse } from '@/types/invitation.types'

const mockTeachers: InvitedTeachersDto = {
  content: [
    {
      id: 'teacher-1',
      email: 'alice@school.edu',
      fullName: 'Alice Chen',
      status: 'ACTIVE',
      invitedAt: '2026-03-20T10:00:00Z',
      expiresAt: '2026-03-21T10:00:00Z',
    },
    {
      id: 'teacher-2',
      email: 'bob@school.edu',
      fullName: null,
      status: 'INVITED',
      invitedAt: '2026-03-27T09:00:00Z',
      expiresAt: '2026-03-28T09:00:00Z',
    },
    {
      id: 'teacher-3',
      email: 'carol@school.edu',
      fullName: null,
      status: 'EXPIRED',
      invitedAt: '2026-03-10T08:00:00Z',
      expiresAt: '2026-03-11T08:00:00Z',
    },
  ],
}

const sentResponse: SendInvitationsResponse = {
  sent: [
    {
      id: 'teacher-new',
      email: 'new@school.edu',
      fullName: null,
      status: 'INVITED',
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  ],
}

const server = setupServer(
  http.get('/api/v1/invitations', () => HttpResponse.json(mockTeachers)),
  http.post('/api/v1/invitations', () => HttpResponse.json(sentResponse)),
  http.post('/api/v1/invitations/:id/resend', ({ params }) =>
    HttpResponse.json({
      teacher: mockTeachers.content.find((t) => t.id === params.id),
    }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('TeacherListPage', () => {
  it('renders page heading and invite button', async () => {
    render(<TeacherListPage />)

    expect(screen.getByRole('heading', { name: /teachers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /invite teachers/i })).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<TeacherListPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders teacher list with emails and status badges', async () => {
    render(<TeacherListPage />)

    await waitFor(() => {
      expect(screen.getByText('alice@school.edu')).toBeInTheDocument()
    })

    expect(screen.getByText('bob@school.edu')).toBeInTheDocument()
    expect(screen.getByText('carol@school.edu')).toBeInTheDocument()

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Invited')).toBeInTheDocument()
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('shows teacher fullName when available', async () => {
    render(<TeacherListPage />)

    await waitFor(() => {
      expect(screen.getByText('Alice Chen')).toBeInTheDocument()
    })
  })

  it('shows resend button for INVITED and EXPIRED teachers, not for ACTIVE', async () => {
    render(<TeacherListPage />)

    await waitFor(() => {
      expect(screen.getByText('alice@school.edu')).toBeInTheDocument()
    })

    // bob (INVITED) and carol (EXPIRED) should have resend buttons
    expect(screen.getByRole('button', { name: /resend invite to bob@school.edu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resend invite to carol@school.edu/i })).toBeInTheDocument()

    // alice (ACTIVE) should NOT have a resend button
    expect(screen.queryByRole('button', { name: /resend invite to alice@school.edu/i })).not.toBeInTheDocument()
  })

  it('shows empty state when no teachers exist', async () => {
    server.use(http.get('/api/v1/invitations', () => HttpResponse.json({ content: [] })))

    render(<TeacherListPage />)

    await waitFor(() => {
      expect(screen.getByText(/no teachers yet/i)).toBeInTheDocument()
    })
  })

  it('shows error when API fails to load teachers', async () => {
    server.use(
      http.get('/api/v1/invitations', () =>
        HttpResponse.json(
          { status: 500, code: 'SERVER_ERROR', message: 'Server error.' },
          { status: 500 },
        ),
      ),
    )

    render(<TeacherListPage />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('opens the invite dialog when "Invite Teachers" is clicked', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('alice@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /invite teachers/i }))

    expect(screen.getByRole('dialog', { name: /invite teachers/i })).toBeInTheDocument()
  })

  it('closes the invite dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('alice@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /invite teachers/i }))
    expect(screen.getByRole('dialog', { name: /invite teachers/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('validates that at least one valid email is entered before sending', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('alice@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /invite teachers/i }))
    await user.click(screen.getByRole('button', { name: /send invitations/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('validates that entered text is valid email format', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('alice@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /invite teachers/i }))
    await user.type(screen.getByLabelText(/email addresses/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /send invitations/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('sends invitations for valid emails and shows success', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('alice@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /invite teachers/i }))
    await user.type(screen.getByLabelText(/email addresses/i), 'new@school.edu')
    await user.click(screen.getByRole('button', { name: /send invitations/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
    expect(screen.getByText(/invitations sent successfully/i)).toBeInTheDocument()
  })

  it('sends invitations for multiple comma-separated emails', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('alice@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /invite teachers/i }))
    await user.type(screen.getByLabelText(/email addresses/i), 'a@x.com, b@x.com')
    await user.click(screen.getByRole('button', { name: /send invitations/i }))

    await waitFor(() => {
      expect(screen.getByText(/invitations sent successfully/i)).toBeInTheDocument()
    })
  })

  it('calls resend API when Resend button is clicked', async () => {
    let resendCalled = false
    server.use(
      http.post('/api/v1/invitations/:id/resend', ({ params }) => {
        resendCalled = true
        return HttpResponse.json({
          teacher: { ...mockTeachers.content[1], id: params.id },
        })
      }),
    )

    const user = userEvent.setup()
    render(<TeacherListPage />)

    await waitFor(() => expect(screen.getByText('bob@school.edu')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /resend invite to bob@school.edu/i }))

    await waitFor(() => {
      expect(resendCalled).toBe(true)
    })
  })
})
