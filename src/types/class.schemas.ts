import { z } from 'zod'

export const classDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  yearGroup: z.string().min(1).optional().nullable(),
  status: z.literal('ACTIVE'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const classesDtoSchema = z.object({
  content: z.array(classDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const classFormSchema = z.object({
  name: z.string().min(1, 'Class name is required.'),
  yearGroup: z.string().optional(),
})

export const createClassRequestSchema = z.object({
  name: z.string().min(1),
  yearGroup: z.string().optional().nullable(),
})
