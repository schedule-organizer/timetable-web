import { type z } from 'zod'
import {
  createSubjectRequestSchema,
  difficultyLevelSchema,
  subjectDtoSchema,
  subjectFormSchema,
  subjectsDtoSchema,
} from '@/types/subject.schemas'

export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>
export type SubjectDto = z.infer<typeof subjectDtoSchema>
export type SubjectsDto = z.infer<typeof subjectsDtoSchema>
export type SubjectFormValues = z.infer<typeof subjectFormSchema>
export type CreateSubjectRequest = z.infer<typeof createSubjectRequestSchema>
