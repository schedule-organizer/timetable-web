import type { SoftPreferenceDto } from '@/types/soft-preference.types'

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
]
