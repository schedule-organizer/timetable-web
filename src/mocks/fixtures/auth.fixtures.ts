import type { AuthResponse, UserDto, UserRole } from '@/types/auth.types'
import type { InstitutionRole } from '@/types/rbac.types'

let _counter = 0

function nextId(): number {
  return ++_counter
}

export function createMockUser(overrides: Partial<UserDto> = {}): UserDto {
  const id = nextId()
  return {
    id: `user-${id}`,
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'ADMIN',
    institutionId: `inst-${id}`,
    createdAt: '2026-03-28T00:00:00Z',
    ...overrides,
  }
}

export function createMockAuthResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
  const id = nextId()
  const user = createMockUser()
  return {
    accessToken: `access-token-${id}`,
    refreshToken: `refresh-token-${id}`,
    user,
    ...overrides,
  }
}

// ----------------------------------------------------------------------------
// Seed login accounts for mock mode.
//
// The mock login handler recognises these emails and returns a role-appropriate
// identity, so testers can experience the app as each role. Any password is
// accepted. Unknown emails still log in successfully as a TIMETABLER/ADMIN so the
// "any credentials work" convenience is preserved. Emails align with the users in
// rbac-page.mock.ts and the teacher roster in teachers.fixtures.ts.
// ----------------------------------------------------------------------------

export interface SeedAccount {
  id: string
  email: string
  fullName: string
  /** Legacy role used by usePermission's hierarchy (PARENT<STUDENT<TEACHER<MODERATOR<ADMIN). */
  role: UserRole
  /** Institution roles used by useInstitutionPermission (FR34/FR36). */
  roles: InstitutionRole[]
}

export const seedAccounts: SeedAccount[] = [
  {
    id: 'user-1',
    email: 'admin@school.edu',
    fullName: 'Alex Timetabler',
    role: 'ADMIN',
    roles: ['TIMETABLER'],
  },
  {
    id: 'user-2',
    email: 'principal@school.edu',
    fullName: 'Dr. Sarah Principal',
    role: 'ADMIN',
    roles: ['PRINCIPAL'],
  },
  {
    id: 'user-3',
    email: 'moderator@school.edu',
    fullName: 'James Moderator',
    role: 'MODERATOR',
    roles: ['MODERATOR'],
  },
  {
    id: 'user-4',
    email: 'alice@school.edu',
    fullName: 'Alice Chen',
    role: 'TEACHER',
    roles: ['TEACHER'],
  },
  {
    id: 'user-5',
    email: 'bob@school.edu',
    fullName: 'Bob Smith',
    role: 'MODERATOR',
    roles: ['TEACHER', 'MODERATOR'],
  },
]

/** The account returned for an unrecognised email — full-access timetabler. */
export const defaultSeedAccount: SeedAccount = {
  id: 'user-1',
  email: 'admin@school.edu',
  fullName: 'Alex Timetabler',
  role: 'ADMIN',
  roles: ['TIMETABLER', 'TEACHER'],
}

/** Resolve a seed account by email (case-insensitive), falling back to the default. */
export function resolveSeedAccount(email: string): SeedAccount {
  const match = seedAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase())
  return match ?? { ...defaultSeedAccount, email }
}
