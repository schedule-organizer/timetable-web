import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/auth.types'

const ROLE_HIERARCHY: UserRole[] = ['PARENT', 'STUDENT', 'TEACHER', 'MODERATOR', 'ADMIN']

// Returns true if the current user has at least the given role level.
export function usePermission(requiredRole: UserRole): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(requiredRole)
}
