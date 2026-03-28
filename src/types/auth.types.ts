// Role hierarchy: PARENT < STUDENT < TEACHER < MODERATOR < ADMIN
export type UserRole = 'ADMIN' | 'MODERATOR' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface UserDto {
  id: string
  email: string
  fullName: string
  role: UserRole
  // Institution roles assigned via role management (FR34). Optional for backward compatibility.
  roles?: import('./rbac.types').InstitutionRole[]
  institutionId: string
  createdAt: string
}

export interface RegisterRequest {
  institutionName: string
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDto
}

export type SubscriptionTier = 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'

export interface TenantSettings {
  institutionName: string
  trialEndsAt: string
  subscriptionTier: SubscriptionTier
}
