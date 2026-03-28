import type { UserWithRoles } from '@/types/rbac.types'
import type { SubscriptionLimits } from '@/types/rbac.types'

export const mockUsers: UserWithRoles[] = [
  {
    id: 'user-1',
    email: 'admin@school.edu',
    fullName: 'Alex Timetabler',
    roles: ['TIMETABLER'],
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-2',
    email: 'principal@school.edu',
    fullName: 'Dr. Sarah Principal',
    roles: ['PRINCIPAL'],
    createdAt: '2026-01-11T09:00:00Z',
  },
  {
    id: 'user-3',
    email: 'moderator@school.edu',
    fullName: 'James Moderator',
    roles: ['MODERATOR'],
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'user-4',
    email: 'alice@school.edu',
    fullName: 'Alice Chen',
    roles: ['TEACHER'],
    createdAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'user-5',
    email: 'bob@school.edu',
    fullName: 'Bob Smith',
    roles: ['TEACHER', 'MODERATOR'],
    createdAt: '2026-01-16T12:00:00Z',
  },
]

export const mockSubscriptionLimits: SubscriptionLimits = {
  tier: 'STARTER',
  limits: {
    maxClasses: 20,
    maxTeachers: 30,
    maxTerms: 2,
  },
  usage: {
    classes: 8,
    teachers: 5,
    terms: 1,
  },
}
