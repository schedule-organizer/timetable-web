import { z } from 'zod'

const satisfactionStatusSchema = z.enum(['fully', 'partially', 'not'])

export const softPreferenceDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().max(2000).optional(),
  weight: z.number().int().min(1).max(10),
  enabled: z.boolean(),
  satisfactionStatus: satisfactionStatusSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const softPreferencesListSchema = z.object({
  content: z.array(softPreferenceDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const createSoftPreferenceRequestSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200, 'Name must be at most 200 characters.'),
  description: z
    .string()
    .max(2000, 'Notes must be at most 2000 characters.')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  weight: z.number().int().min(1).max(10),
  enabled: z.boolean().optional().default(true),
})

export const updateSoftPreferenceRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z
    .union([z.string().max(2000, 'Notes must be at most 2000 characters.'), z.null()])
    .optional(),
  weight: z.number().int().min(1).max(10).optional(),
  enabled: z.boolean().optional(),
})

export const softPreferenceFormSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200, 'Name must be at most 200 characters.'),
  description: z.string().max(2000, 'Notes must be at most 2000 characters.').optional(),
  weight: z.number().int().min(1).max(10),
  enabled: z.boolean(),
})
