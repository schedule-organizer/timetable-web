// Institution roles — composable; users may hold multiple simultaneously (FR34)
export type InstitutionRole = 'TIMETABLER' | 'TEACHER' | 'MODERATOR' | 'PRINCIPAL'

export const INSTITUTION_ROLES: InstitutionRole[] = [
  'TIMETABLER',
  'TEACHER',
  'MODERATOR',
  'PRINCIPAL',
]

export const ROLE_LABELS: Record<InstitutionRole, string> = {
  TIMETABLER: 'Timetabler',
  TEACHER: 'Teacher',
  MODERATOR: 'Moderator',
  PRINCIPAL: 'Principal',
}

// Named permissions used by usePermission to gate UI controls (NFR8: supplementary to server enforcement)
export type Permission =
  | 'settings:manage'
  | 'teachers:invite'
  | 'teachers:manage'
  | 'roles:assign'
  | 'schedule:run'
  | 'schedule:publish'
  | 'timetable:view'
  | 'availability:declare'
  | 'reports:view'
  | 'profile:manage-own'

export const ROLE_PERMISSIONS: Record<InstitutionRole, Permission[]> = {
  TIMETABLER: [
    'settings:manage',
    'teachers:invite',
    'teachers:manage',
    'roles:assign',
    'schedule:run',
    'schedule:publish',
    'timetable:view',
    'reports:view',
  ],
  TEACHER: ['timetable:view', 'availability:declare', 'profile:manage-own'],
  MODERATOR: ['timetable:view', 'reports:view'],
  PRINCIPAL: ['timetable:view', 'schedule:publish', 'reports:view'],
}

// User with multi-role assignment (returned by /api/v1/users)
export interface UserWithRoles {
  id: string
  email: string
  fullName: string
  roles: InstitutionRole[]
  createdAt: string
}

export interface UsersWithRolesDto {
  content: UserWithRoles[]
}

export interface AssignRolesRequest {
  roles: InstitutionRole[]
}

export interface AssignRolesResponse {
  user: UserWithRoles
}

// Subscription tier limits (FR38)
export type SubscriptionTierKey = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'

export interface TierLimits {
  maxClasses: number | null // null = unlimited
  maxTeachers: number | null
  maxTerms: number | null
}

export const TIER_LIMITS: Record<SubscriptionTierKey, TierLimits> = {
  STARTER: { maxClasses: 20, maxTeachers: 30, maxTerms: 2 },
  PROFESSIONAL: { maxClasses: 100, maxTeachers: 200, maxTerms: null },
  ENTERPRISE: { maxClasses: null, maxTeachers: null, maxTerms: null },
}

export interface SubscriptionLimits {
  tier: SubscriptionTierKey
  limits: TierLimits
  usage: {
    classes: number
    teachers: number
    terms: number
  }
}
