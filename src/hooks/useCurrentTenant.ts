import { useTenantStore } from '@/store/tenantStore'

export function useCurrentTenant() {
  const tenantId = useTenantStore((s) => s.tenantId)
  const settings = useTenantStore((s) => s.settings)
  return { tenantId, settings }
}
