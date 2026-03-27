import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { useTenantStore } from '@/store/tenantStore'
import type { RegisterRequest, LoginRequest, AuthResponse, TenantSettings } from '@/types/auth.types'

export const authQueryKeys = {
  labels: () => ['settings', 'labels'] as const,
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const { setTenant } = useTenantStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<AuthResponse>('/api/v1/auth/register', data).then((res) => res.data),
    onSuccess: (data, variables) => {
      setAuth(data.user, data.accessToken)
      // Provisioned on 30-day trial per NFR; institution name from registration until settings load.
      const tenantSettings: TenantSettings = {
        institutionName: variables.institutionName,
        trialEndsAt: '',
        subscriptionTier: 'TRIAL',
      }
      setTenant(data.user.institutionId, tenantSettings)
    },
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const { setTenant } = useTenantStore()

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<AuthResponse>('/api/v1/auth/login', data).then((res) => res.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      const tenantSettings: TenantSettings = {
        institutionName: '',
        trialEndsAt: '',
        subscriptionTier: 'TRIAL',
      }
      setTenant(data.user.institutionId, tenantSettings)
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const { clearTenant } = useTenantStore()

  return useMutation({
    mutationFn: () => api.post('/api/v1/auth/logout').then(() => undefined),
    onSuccess: () => {
      clearAuth()
      clearTenant()
    },
  })
}

export function useLabels() {
  return useQuery({
    queryKey: authQueryKeys.labels(),
    queryFn: () =>
      api.get<Record<string, string>>('/api/v1/settings/labels').then((res) => res.data),
    staleTime: Infinity, // Labels change only when an admin updates terminology.
  })
}
