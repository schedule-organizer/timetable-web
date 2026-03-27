import { useTenantStore } from '@/store/tenantStore'

// Default English labels — overridden by institution-configured terminology from
// GET /api/v1/settings/labels stored in tenantStore.labels.
const defaults: Record<string, string> = {
  class: 'Class',
  teacher: 'Teacher',
  subject: 'Subject',
  period: 'Period',
  term: 'Term',
  room: 'Room',
}

// Usage: const label = useLabels(); label('class') → e.g. "Year Group"
export function useLabels() {
  const labels = useTenantStore((s) => s.labels)
  return (key: string): string => labels[key] ?? defaults[key] ?? key
}
