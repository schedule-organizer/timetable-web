import { z } from 'zod'

export const teacherDtoSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  subjectQualifications: z.array(z.string()),
  status: z.literal('ACTIVE'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const teachersDtoSchema = z.object({
  content: z.array(teacherDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const teacherFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().optional(),
  subjectQualifications: z.string().optional(),
})

export const createTeacherRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  subjectQualifications: z.array(z.string()),
})

export const bulkImportTeachersRequestSchema = z.object({
  teachers: z.array(createTeacherRequestSchema),
})
