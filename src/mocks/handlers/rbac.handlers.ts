import { http, HttpResponse } from 'msw'
import { mockUsers, mockSubscriptionLimits } from '@/mocks/pages/rbac-page.mock'
import { assignRolesRequestSchema } from '@/types/rbac.schemas'
import type { UserWithRoles, SubscriptionLimits } from '@/types/rbac.types'

// In-memory store for users with their roles
let currentUsers: UserWithRoles[] = mockUsers.map((u) => ({ ...u, roles: [...u.roles] }))
let currentLimits: SubscriptionLimits = { ...mockSubscriptionLimits }

export function resetRbacMocks() {
  currentUsers = mockUsers.map((u) => ({ ...u, roles: [...u.roles] }))
  currentLimits = { ...mockSubscriptionLimits }
}

export const rbacHandlers = [
  // GET /api/v1/users — list all users in the institution with their roles
  http.get('/api/v1/users', () => {
    return HttpResponse.json({ content: currentUsers })
  }),

  // GET /api/v1/users/:id/roles — get roles for a specific user
  http.get('/api/v1/users/:id/roles', ({ params }) => {
    const user = currentUsers.find((u) => u.id === params.id)
    if (!user) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'User not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json({ roles: user.roles })
  }),

  // PUT /api/v1/users/:id/roles — assign roles to a user
  http.put('/api/v1/users/:id/roles', async ({ params, request }) => {
    const user = currentUsers.find((u) => u.id === params.id)
    if (!user) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'User not found.' },
        { status: 404 },
      )
    }

    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
        { status: 400 },
      )
    }

    const parsed = assignRolesRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid role assignment request.' },
        { status: 400 },
      )
    }

    user.roles = parsed.data.roles as UserWithRoles['roles']
    return HttpResponse.json({ user })
  }),

  // GET /api/v1/subscription/limits — return tier, limits, and current usage
  http.get('/api/v1/subscription/limits', () => {
    return HttpResponse.json(currentLimits)
  }),
]
