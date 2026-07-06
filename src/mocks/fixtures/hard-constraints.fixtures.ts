import type { HardConstraintDto } from '@/types/hard-constraint.types'

// Seed hard constraints for mock mode. Two of the three available rule types are
// seeded — the third (ROOM_CAPACITY_NOT_EXCEEDED) is intentionally left out so the
// "Add hard constraint" happy path remains testable (the handler rejects duplicate
// rule types with 409 DUPLICATE_RULE).
export const mockHardConstraints: HardConstraintDto[] = [
  {
    id: 'hard-constraint-1',
    ruleType: 'TEACHER_NO_DOUBLE_BOOKING',
    description: 'A teacher can never be scheduled in two places at once.',
    enabled: true,
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'hard-constraint-2',
    ruleType: 'CLASS_NO_DOUBLE_BOOKING',
    description: 'A class can only attend one lesson per period.',
    enabled: true,
    createdAt: '2026-03-20T08:05:00.000Z',
    updatedAt: '2026-03-20T08:05:00.000Z',
  },
]
