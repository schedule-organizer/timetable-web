import type { HardConstraintDto } from '@/types/hard-constraint.types'

export const mockHardConstraints: HardConstraintDto[] = [
  {
    id: 'hard-constraint-1',
    ruleType: 'TEACHER_NO_DOUBLE_BOOKING',
    description: 'Applies to all teachers in the institution roster.',
    enabled: true,
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
  },
]
