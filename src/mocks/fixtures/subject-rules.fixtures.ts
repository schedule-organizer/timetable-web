import type { SubjectRuleDto } from '@/types/subject-rule.types'

export const mockSubjectRules: SubjectRuleDto[] = [
  {
    id: 'subject-rule-1',
    name: 'Maximum 1 High-difficulty subject per class per cycle day',
    description: 'Prevents students from having more than one high-difficulty subject on the same day.',
    constraintType: 'hard',
    enabled: true,
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'subject-rule-2',
    name: 'Avoid consecutive Maths and Sciences periods',
    description: 'Prefer not to schedule high-cognitive subjects back-to-back.',
    constraintType: 'soft',
    weight: 7,
    enabled: true,
    satisfactionRate: 85,
    createdAt: '2026-03-21T09:00:00.000Z',
    updatedAt: '2026-03-21T09:00:00.000Z',
  },
  {
    id: 'subject-rule-3',
    name: 'Spread PE across the cycle evenly',
    description: 'PE lessons should be distributed rather than clustered.',
    constraintType: 'soft',
    weight: 4,
    enabled: true,
    satisfactionRate: 60,
    createdAt: '2026-03-22T10:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
  },
]
