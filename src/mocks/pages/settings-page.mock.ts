// Page-level mock data for the settings feature.
// When the backend is ready, remove these and point hooks at the real API.

import type { TerminologyLabels } from '@/types/settings.types'

// Default terminology labels used as the mock starting state.
// Empty string means "use SchediFlow default" (handled by useLabels hook).
export const mockTerminologyLabels: TerminologyLabels = {
  period: '',
  class: '',
  term: '',
  cycle: '',
  bellSchedule: '',
  room: '',
  subject: '',
}
