import { create } from 'zustand'
import type { TenantSettings } from '@/types/auth.types'

interface TenantStore {
  tenantId: string | null
  settings: TenantSettings | null
  // Institution-configurable terminology; keys match /api/v1/settings/labels response.
  labels: Record<string, string>
  setTenant: (tenantId: string, settings: TenantSettings) => void
  setLabels: (labels: Record<string, string>) => void
  clearTenant: () => void
}

export const useTenantStore = create<TenantStore>((set) => ({
  tenantId: null,
  settings: null,
  labels: {},
  setTenant: (tenantId, settings) => set({ tenantId, settings }),
  setLabels: (labels) => set({ labels }),
  clearTenant: () => set({ tenantId: null, settings: null, labels: {} }),
}))
