import type { InvitedTeacher } from '@/types/invitation.types'

export const mockInvitedTeachers: InvitedTeacher[] = [
  {
    id: 'teacher-inv-1',
    email: 'alice@school.edu',
    fullName: 'Alice Chen',
    status: 'ACTIVE',
    invitedAt: '2026-03-20T10:00:00Z',
    expiresAt: '2026-03-21T10:00:00Z',
  },
  {
    id: 'teacher-inv-2',
    email: 'bob@school.edu',
    fullName: null,
    status: 'INVITED',
    invitedAt: '2026-03-27T09:00:00Z',
    expiresAt: '2026-03-28T09:00:00Z',
  },
  {
    id: 'teacher-inv-3',
    email: 'carol@school.edu',
    fullName: null,
    status: 'EXPIRED',
    invitedAt: '2026-03-10T08:00:00Z',
    expiresAt: '2026-03-11T08:00:00Z',
  },
]

export const mockInstitutionName = 'Springfield Academy'
