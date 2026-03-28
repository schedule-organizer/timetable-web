import type { AuthResponse, UserDto } from '@/types/auth.types'

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
