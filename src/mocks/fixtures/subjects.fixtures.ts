import type { SubjectDto } from '@/types/subject.types'

export const mockSubjects: SubjectDto[] = [
  {
    id: 'subject-1',
    name: 'Physics',
    difficulty: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2026-03-21T09:00:00Z',
    updatedAt: '2026-03-21T09:00:00Z',
  },
  {
    id: 'subject-2',
    name: 'Art',
    difficulty: 'LOW',
    status: 'ACTIVE',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
  },
]
