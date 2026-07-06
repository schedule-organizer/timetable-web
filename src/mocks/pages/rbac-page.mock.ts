import type { UserWithRoles } from '@/types/rbac.types'
import type { SubscriptionLimits } from '@/types/rbac.types'

// Seed institution users for role management in mock mode. Emails match the
// login seed accounts (see auth.fixtures.ts) so signing in as any of them lands
// on a user that already appears in the role-management table.
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
  {
    id: 'user-6',
    email: 'diana@school.edu',
    fullName: 'Diana Flores',
    roles: ['TEACHER'],
    createdAt: '2026-01-17T09:00:00Z',
  },
]

// PROFESSIONAL tier so the seeded roster (3 terms, 9 teachers, 8 classes) sits
// comfortably within limits. Usage reflects the seeded fixture counts.
export const mockSubscriptionLimits: SubscriptionLimits = {
  tier: 'PROFESSIONAL',
  limits: {
    maxClasses: 100,
    maxTeachers: 200,
    maxTerms: null,
  },
  usage: {
    classes: 8,
    teachers: 9,
    terms: 3,
  },
}
