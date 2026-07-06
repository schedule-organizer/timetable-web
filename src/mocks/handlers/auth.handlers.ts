import { http, HttpResponse } from 'msw'
import type { RegisterRequest, LoginRequest } from '@/types/auth.types'
import { resolveSeedAccount } from '@/mocks/fixtures/auth.fixtures'

let _tokenId = 0

function nextToken(): string {
  return `access-token-${++_tokenId}`
}

export const authHandlers = [
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterRequest
    const id = _tokenId + 1
    return HttpResponse.json({
      accessToken: nextToken(),
      refreshToken: `refresh-token-${id}`,
      user: {
        id: `user-${id}`,
        email: body.email,
        fullName: body.fullName,
        role: 'ADMIN',
        roles: ['TIMETABLER', 'TEACHER'],
        institutionId: `inst-${id}`,
        createdAt: new Date().toISOString(),
      },
    })
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const id = _tokenId + 1
    // Any password is accepted. Known seed emails return a role-appropriate
    // identity; unknown emails fall back to a full-access timetabler.
    const account = resolveSeedAccount(body.email)
    return HttpResponse.json({
      accessToken: nextToken(),
      refreshToken: `refresh-token-${id}`,
      user: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        roles: account.roles,
        institutionId: 'inst-1',
        createdAt: new Date().toISOString(),
      },
    })
  }),

  http.post('/api/v1/auth/refresh', () => {
    return HttpResponse.json({ accessToken: nextToken() })
  }),

  http.post('/api/v1/auth/logout', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
