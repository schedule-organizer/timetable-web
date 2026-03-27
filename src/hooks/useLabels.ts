import { useTenantStore } from '@/store/tenantStore'

// SchediFlow default English terms — institutions may rename each via Terminology settings.
const defaults: Record<string, string> = {
  period: 'Period',
  class: 'Class',
  term: 'Term',
  cycle: 'Cycle',
  bellSchedule: 'Bell Schedule',
  room: 'Room',
  subject: 'Subject',
  teacher: 'Teacher',
}

// Usage: const label = useLabels(); label('period') → e.g. "Lesson"
// Returns the SchediFlow default when a key is absent or the institution has cleared it.
export function useLabels() {
  const labels = useTenantStore((s) => s.labels)
  return (key: string): string => {
    const custom = labels[key]
    return custom && custom.trim() !== '' ? custom : (defaults[key] ?? key)
  }
}
