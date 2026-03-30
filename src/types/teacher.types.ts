import { type z } from 'zod'
import {
  teacherDtoSchema,
  teachersDtoSchema,
  createTeacherRequestSchema,
  teacherFormSchema,
  bulkImportTeachersRequestSchema,
} from '@/types/teacher.schemas'

export type TeacherDto = z.infer<typeof teacherDtoSchema>
export type TeachersDto = z.infer<typeof teachersDtoSchema>
export type CreateTeacherRequest = z.infer<typeof createTeacherRequestSchema>
export type TeacherFormValues = z.infer<typeof teacherFormSchema>
export type BulkImportTeachersRequest = z.infer<typeof bulkImportTeachersRequestSchema>

export interface TeacherImportSkipped {
  email: string
  reason: string
}

export interface ImportTeachersResponse {
  imported: TeacherDto[]
  skipped: TeacherImportSkipped[]
  remainingQuota: number
}
