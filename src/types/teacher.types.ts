import { type z } from 'zod'
import {
  teacherDtoSchema,
  teachersDtoSchema,
  createTeacherRequestSchema,
  teacherFormSchema,
} from '@/types/teacher.schemas'

export type TeacherDto = z.infer<typeof teacherDtoSchema>
export type TeachersDto = z.infer<typeof teachersDtoSchema>
export type CreateTeacherRequest = z.infer<typeof createTeacherRequestSchema>
export type TeacherFormValues = z.infer<typeof teacherFormSchema>
