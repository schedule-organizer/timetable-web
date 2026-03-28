import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { render } from '@/test/test-utils'
import TeacherListPage from '@/features/teachers/pages/TeacherListPage'
import {
  invitationHandlers,
  resetInvitationMocks,
} from '@/mocks/handlers/invitation.handlers'
import {
  teacherHandlers,
  resetTeacherMocks,
} from '@/mocks/handlers/teacher.handlers'

const server = setupServer(...invitationHandlers, ...teacherHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  resetInvitationMocks()
  resetTeacherMocks()
})
afterAll(() => server.close())

describe('TeacherListPage manual roster', () => {
  it('renders roster and invitations sections', async () => {
    render(<TeacherListPage />)
    const roster = screen.getByLabelText('Manual teacher roster')

    await waitFor(() => {
      expect(within(roster).getByText('Alice Chen')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /Teacher roster/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Teacher invitations/i })).toBeInTheDocument()
  })

  it('shows empty state when no teachers exist', async () => {
    server.use(
      http.get('/api/v1/teachers', () =>
        HttpResponse.json({ content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }),
      ),
    )

    render(<TeacherListPage />)

    const roster = screen.getByLabelText('Manual teacher roster')
    await waitFor(() => {
      expect(within(roster).getByText(/No teachers yet/i)).toBeInTheDocument()
    })

    expect(within(roster).getAllByRole('button', { name: /Import via CSV/i })).toHaveLength(2)
    expect(within(roster).getAllByRole('button', { name: /^Add teacher$/i })).toHaveLength(1)
  })

  it('adds a teacher via the manual form', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    const roster = screen.getByLabelText('Manual teacher roster')
    await waitFor(() => {
      expect(within(roster).getByText('Alice Chen')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Add teacher manually/i }))

    await user.type(screen.getByLabelText(/First name/i), 'Cara')
    await user.type(screen.getByLabelText(/Last name/i), 'Lee')
    await user.type(screen.getByLabelText(/Email/i), 'cara@school.edu')
    await user.type(screen.getByLabelText(/Phone/i), '+44 20 1111 2222')
    await user.type(
      screen.getByLabelText(/Subject qualifications/i),
      'Biology, Chemistry',
    )
    await user.click(screen.getByRole('button', { name: /Create teacher/i }))

    await waitFor(() => {
      expect(within(roster).getByText('cara@school.edu')).toBeInTheDocument()
    })
  })

  it('edits a teacher from the roster', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    const roster = screen.getByLabelText('Manual teacher roster')
    await waitFor(() => {
      expect(within(roster).getByText('Alice Chen')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Alice Chen').closest('tr')
    expect(row).toBeTruthy()
    if (!row) return

    await user.click(within(row).getByRole('button', { name: /Edit/i }))
    const phoneInput = screen.getByLabelText(/Phone/i)
    await user.clear(phoneInput)
    await user.type(phoneInput, '+44 20 9999 8888')
    await user.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() => {
      expect(within(roster).getByText('+44 20 9999 8888')).toBeInTheDocument()
    })
  })

  it('deletes a teacher after confirmation', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    const roster = screen.getByLabelText('Manual teacher roster')
    await waitFor(() => {
      expect(within(roster).getByText('Alice Chen')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Alice Chen').closest('tr')
    expect(row).toBeTruthy()
    if (!row) return

    await user.click(within(row).getByRole('button', { name: /Delete/i }))

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to remove/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Delete teacher/i }))

    await waitFor(() => {
      expect(within(roster).queryByText('Alice Chen')).not.toBeInTheDocument()
    })

    expect(within(roster).getByText(/Alice Chen was removed from the roster/i)).toBeInTheDocument()
    expect(within(roster).getByText(/review the schedule/i)).toBeInTheDocument()
  })
})

describe('TeacherListPage import flow', () => {
  it('parses uploaded CSV rows and highlights duplicates/invalid entries', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await user.click(screen.getByRole('button', { name: /Import via CSV/i }))

    const fileInput = screen.getByLabelText(/CSV file/i)
    const csv = [
      'Name,Email,Subjects',
      'New Teacher,new@school.edu,"Math, Science"',
      'Missing Email,,Science',
      'Existing Teacher,alice@school.edu,History',
    ].join('\n')
    const file = new File([csv], 'teachers.csv', { type: 'text/csv' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText(/Preview: 3 rows/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Missing email address\./i)).toBeInTheDocument()
    expect(screen.getByText(/Teacher already exists\./i)).toBeInTheDocument()
  })

  it('imports valid rows and reports the remaining quota', async () => {
    const user = userEvent.setup()
    render(<TeacherListPage />)

    await user.click(screen.getByRole('button', { name: /Import via CSV/i }))

    const fileInput = screen.getByLabelText(/CSV file/i)
    const csv = ['Name,Email', 'Fresh Teacher,fresh@school.edu'].join('\n')
    const file = new File([csv], 'teachers.csv', { type: 'text/csv' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText(/Preview: 1 row/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Import valid rows/i }))

    await waitFor(() => {
      expect(screen.getByText(/Imported 1 teacher/i)).toBeInTheDocument()
      expect(screen.getByText(/slot\(s\) remain/i)).toBeInTheDocument()
    })
  })

  it('shows a subscription-limit alert when the import is blocked', async () => {
    server.use(
      http.post('/api/v1/teachers/import', () =>
        HttpResponse.json(
          {
            status: 400,
            code: 'SUBSCRIPTION_LIMIT',
            message: 'Import blocked — you can only add 0 more teacher(s).',
          },
          { status: 400 },
        ),
      ),
    )

    const user = userEvent.setup()
    render(<TeacherListPage />)

    await user.click(screen.getByRole('button', { name: /Import via CSV/i }))

    const fileInput = screen.getByLabelText(/CSV file/i)
    const csv = ['Name,Email', 'Blocked Teacher,blocked@school.edu'].join('\n')
    const file = new File([csv], 'teachers.csv', { type: 'text/csv' })

    await user.upload(fileInput, file)
    await waitFor(() => {
      expect(screen.getByText(/Preview: 1 row/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Import valid rows/i }))

    await waitFor(() => {
      expect(screen.getByText(/Import blocked — you can only add 0 more teacher\(s\)\./i)).toBeInTheDocument()
    })
  })
})

describe('TeacherListPage invitations', () => {
  it('renders invitation list with resend buttons', async () => {
    render(<TeacherListPage />)

    const invitations = screen.getByLabelText('Teacher invitations')
    await waitFor(() => {
      expect(within(invitations).getByText('alice@school.edu')).toBeInTheDocument()
    })

    expect(
      within(invitations).getByRole('button', {
        name: /resend invite to bob@school.edu/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(invitations).getByRole('button', {
        name: /resend invite to carol@school.edu/i,
      }),
    ).toBeInTheDocument()
  })

  it('handles invitation errors gracefully', async () => {
    server.use(
      http.get('/api/v1/invitations', () =>
        HttpResponse.json(
          { status: 500, code: 'SERVER_ERROR', message: 'Server error.' },
          { status: 500 },
        ),
      ),
    )

    render(<TeacherListPage />)

    const invitations = screen.getByLabelText('Teacher invitations')
    await waitFor(() => {
      expect(within(invitations).getByText(/Server error/i)).toBeInTheDocument()
    })
  })

  it('shows empty invitation state', async () => {
    server.use(
      http.get('/api/v1/invitations', () =>
        HttpResponse.json({ content: [] }, { status: 200 }),
      ),
    )

    render(<TeacherListPage />)

    const invitations = screen.getByLabelText('Teacher invitations')
    await waitFor(() => {
      expect(within(invitations).getByText(/No teacher invitations yet/i)).toBeInTheDocument()
    })
  })

  it('calls resend API when Resend is clicked', async () => {
    let resendCalled = false
    server.use(
      http.post('/api/v1/invitations/:id/resend', ({ params }) => {
        resendCalled = true
        return HttpResponse.json({
          teacher: {
            id: params.id,
            email: 'bob@school.edu',
            fullName: null,
            status: 'INVITED',
            invitedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
        })
      }),
    )

    const user = userEvent.setup()
    render(<TeacherListPage />)

    const invitations = screen.getByLabelText('Teacher invitations')
    await waitFor(() => {
      expect(within(invitations).getByText('bob@school.edu')).toBeInTheDocument()
    })

    await user.click(
      within(invitations).getByRole('button', { name: /resend invite to bob@school.edu/i }),
    )

    await waitFor(() => {
      expect(resendCalled).toBe(true)
    })
  })
})
