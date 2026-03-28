import { http, HttpResponse } from 'msw'
import { mockInvitedTeachers, mockInstitutionName } from '@/mocks/pages/invitation-page.mock'
import { sendInvitationsRequestSchema } from '@/types/invitation.schemas'
import type { InvitedTeacher } from '@/types/invitation.types'

// In-memory store for invited teachers and magic links
let currentTeachers: InvitedTeacher[] = mockInvitedTeachers.map((t) => ({ ...t }))

interface MagicLinkRecord {
  teacherId: string
  used: boolean
  expiresAt: string
}

let magicLinks: Record<string, MagicLinkRecord> = {
  'valid-token-abc123': {
    teacherId: 'teacher-inv-2',
    used: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
}

let _idCounter = 100

function nextId(): string {
  return `teacher-inv-${++_idCounter}`
}

function generateToken(): string {
  return `token-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

function expiresIn24h(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

export function resetInvitationMocks() {
  currentTeachers = mockInvitedTeachers.map((t) => ({ ...t }))
  magicLinks = {
    'valid-token-abc123': {
      teacherId: 'teacher-inv-2',
      used: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }
}

export const invitationHandlers = [
  // GET /api/v1/invitations — list all invited teachers
  http.get('/api/v1/invitations', () => {
    return HttpResponse.json({ content: currentTeachers })
  }),

  // POST /api/v1/invitations — send invitations to one or more emails
  http.post('/api/v1/invitations', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const parsed = sendInvitationsRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid invitation request.' },
        { status: 400 },
      )
    }

    const { emails } = parsed.data
    const sent: InvitedTeacher[] = []

    for (const email of emails) {
      const existing = currentTeachers.find((t) => t.email === email)
      if (existing) {
        // Re-invite: update status to INVITED, generate new token
        existing.status = 'INVITED'
        existing.invitedAt = new Date().toISOString()
        existing.expiresAt = expiresIn24h()
        // Invalidate old tokens for this teacher
        for (const token of Object.keys(magicLinks)) {
          if (magicLinks[token].teacherId === existing.id) {
            delete magicLinks[token]
          }
        }
        const token = generateToken()
        magicLinks[token] = { teacherId: existing.id, used: false, expiresAt: existing.expiresAt }
        sent.push(existing)
      } else {
        const id = nextId()
        const expiresAt = expiresIn24h()
        const teacher: InvitedTeacher = {
          id,
          email,
          fullName: null,
          status: 'INVITED',
          invitedAt: new Date().toISOString(),
          expiresAt,
        }
        currentTeachers.push(teacher)
        const token = generateToken()
        magicLinks[token] = { teacherId: id, used: false, expiresAt }
        sent.push(teacher)
      }
    }

    return HttpResponse.json({ sent })
  }),

  // POST /api/v1/invitations/:id/resend — resend invite for a teacher
  http.post('/api/v1/invitations/:id/resend', ({ params }) => {
    const teacher = currentTeachers.find((t) => t.id === params.id)
    if (!teacher) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Teacher not found.' },
        { status: 404 },
      )
    }

    // Invalidate all existing tokens for this teacher
    for (const token of Object.keys(magicLinks)) {
      if (magicLinks[token].teacherId === teacher.id) {
        delete magicLinks[token]
      }
    }

    // Generate a new token and update teacher status
    const expiresAt = expiresIn24h()
    const newToken = generateToken()
    magicLinks[newToken] = { teacherId: teacher.id, used: false, expiresAt }
    teacher.status = 'INVITED'
    teacher.invitedAt = new Date().toISOString()
    teacher.expiresAt = expiresAt

    return HttpResponse.json({ teacher })
  }),

  // GET /api/v1/auth/magic-link/validate — validate a magic link token
  http.get('/api/v1/auth/magic-link/validate', ({ request }) => {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return HttpResponse.json(
        { status: 400, code: 'MISSING_TOKEN', message: 'Token is required.' },
        { status: 400 },
      )
    }

    const record = magicLinks[token]
    if (!record) {
      return HttpResponse.json(
        {
          status: 410,
          code: 'LINK_INVALID',
          message: 'This link has expired or has already been used.',
        },
        { status: 410 },
      )
    }

    if (record.used) {
      return HttpResponse.json(
        {
          status: 410,
          code: 'LINK_USED',
          message: 'This link has expired or has already been used.',
        },
        { status: 410 },
      )
    }

    if (new Date(record.expiresAt) < new Date()) {
      return HttpResponse.json(
        {
          status: 410,
          code: 'LINK_EXPIRED',
          message: 'This link has expired or has already been used.',
        },
        { status: 410 },
      )
    }

    const teacher = currentTeachers.find((t) => t.id === record.teacherId)
    if (!teacher) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Teacher not found.' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      teacherId: teacher.id,
      email: teacher.email,
      institutionName: mockInstitutionName,
    })
  }),

  // POST /api/v1/auth/magic-link/complete — complete onboarding and activate teacher
  http.post('/api/v1/auth/magic-link/complete', async ({ request }) => {
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const body = raw as { token?: string; fullName?: string; photoUrl?: string }
    if (!body.token || !body.fullName) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'token and fullName are required.' },
        { status: 400 },
      )
    }

    const record = magicLinks[body.token]
    if (!record || record.used || new Date(record.expiresAt) < new Date()) {
      return HttpResponse.json(
        {
          status: 410,
          code: 'LINK_INVALID',
          message: 'This link has expired or has already been used.',
        },
        { status: 410 },
      )
    }

    // Mark token as used
    record.used = true

    // Activate teacher
    const teacher = currentTeachers.find((t) => t.id === record.teacherId)
    if (!teacher) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Teacher not found.' },
        { status: 404 },
      )
    }

    teacher.fullName = body.fullName
    teacher.status = 'ACTIVE'

    return HttpResponse.json({
      accessToken: `teacher-access-token-${teacher.id}`,
      refreshToken: `teacher-refresh-token-${teacher.id}`,
      user: {
        id: teacher.id,
        email: teacher.email,
        fullName: teacher.fullName,
        role: 'TEACHER',
        institutionId: 'inst-1',
        createdAt: new Date().toISOString(),
      },
    })
  }),
]
