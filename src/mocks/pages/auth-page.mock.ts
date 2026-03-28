// Page-level mock data for auth flows.
// When the backend is ready, remove these and point useAuth hooks at the real API.

export const mockLabels: Record<string, string> = {
  class: 'Class',
  teacher: 'Teacher',
  subject: 'Subject',
  period: 'Period',
  term: 'Term',
  room: 'Room',
}

export const mockPublicSettings = {
  locale: 'en',
  timezone: 'UTC',
}
