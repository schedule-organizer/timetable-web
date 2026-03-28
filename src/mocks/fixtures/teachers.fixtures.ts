import type { TeacherDto } from '@/types/teacher.types'

export const mockTeachers: TeacherDto[] = [
  {
    id: 'teacher-roster-1',
    firstName: 'Alice',
    lastName: 'Chen',
    email: 'alice@school.edu',
    phone: '+44 20 7946 0000',
    subjectQualifications: ['Mathematics', 'Physics'],
    status: 'ACTIVE',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'teacher-roster-2',
    firstName: 'Brian',
    lastName: 'Owens',
    email: 'brian@school.edu',
    phone: '+44 20 7946 0001',
    subjectQualifications: ['History'],
    status: 'ACTIVE',
    createdAt: '2026-03-21T11:00:00Z',
    updatedAt: '2026-03-21T11:00:00Z',
  },
]
