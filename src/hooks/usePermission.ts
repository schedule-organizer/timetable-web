import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/auth.types'
import { ROLE_PERMISSIONS, type InstitutionRole, type Permission } from '@/types/rbac.types'

const ROLE_HIERARCHY: UserRole[] = ['PARENT', 'STUDENT', 'TEACHER', 'MODERATOR', 'ADMIN']

// Returns true if the current user has at least the given legacy role level.
export function usePermission(requiredRole: UserRole): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(requiredRole)
}

// Returns true if the current user holds any institution role that grants the given permission (FR36).
// Client-side enforcement is supplementary; server enforces authoritatively (NFR8).
export function useInstitutionPermission(permission: Permission): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  const roles: InstitutionRole[] = user.roles ?? []
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission))
}

// Returns the set of permissions held by the current user across all their institution roles.
export function useUserPermissions(): Set<Permission> {
  const user = useAuthStore((s) => s.user)
  const permissions = new Set<Permission>()
  if (!user) return permissions
  const roles: InstitutionRole[] = user.roles ?? []
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role] ?? []) {
      permissions.add(perm)
    }
  }
  return permissions
}
