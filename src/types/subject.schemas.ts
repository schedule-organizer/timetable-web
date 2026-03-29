import { z } from 'zod'

export const difficultyLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])

export const subjectDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  difficulty: difficultyLevelSchema,
  status: z.literal('ACTIVE'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const subjectsDtoSchema = z.object({
  content: z.array(subjectDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const subjectFormSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required.'),
  difficulty: difficultyLevelSchema,
})

export const createSubjectRequestSchema = subjectFormSchema
