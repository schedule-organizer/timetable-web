import type { SoftPreferenceDto } from '@/types/soft-preference.types'

// Seed soft preferences for mock mode. Weights span the 1–10 range and the
// satisfaction statuses cover fully / partially / not so the constraints list
// and satisfaction summary render every state.
export const mockSoftPreferences: SoftPreferenceDto[] = [
  {
    id: 'soft-preference-1',
    name: 'Teacher A prefers Fridays free',
    description: 'Allow Teacher A to leave Fridays unscheduled when possible.',
    weight: 8,
    satisfactionStatus: 'fully',
    enabled: true,
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'soft-preference-2',
    name: 'Avoid back-to-back periods for Year 12',
    description: undefined,
    weight: 3,
    satisfactionStatus: 'partially',
    enabled: true,
    createdAt: '2026-03-21T09:00:00.000Z',
    updatedAt: '2026-03-21T09:00:00.000Z',
  },
  {
    id: 'soft-preference-3',
    name: 'Schedule high-difficulty subjects in the morning',
    description: 'Prefer morning periods for HIGH difficulty subjects when slots allow.',
    weight: 7,
    satisfactionStatus: 'fully',
    enabled: true,
    createdAt: '2026-03-21T09:10:00.000Z',
    updatedAt: '2026-03-21T09:10:00.000Z',
  },
  {
    id: 'soft-preference-4',
    name: 'Minimise teacher room changes',
    description: 'Keep a teacher in the same room across consecutive periods where possible.',
    weight: 5,
    satisfactionStatus: 'partially',
    enabled: true,
    createdAt: '2026-03-21T09:20:00.000Z',
    updatedAt: '2026-03-21T09:20:00.000Z',
  },
  {
    id: 'soft-preference-5',
    name: 'Protect the lunch break',
    description: 'Avoid scheduling lessons over the lunch period.',
    weight: 10,
    satisfactionStatus: 'not',
    enabled: false,
    createdAt: '2026-03-21T09:30:00.000Z',
    updatedAt: '2026-03-21T09:30:00.000Z',
  },
]
