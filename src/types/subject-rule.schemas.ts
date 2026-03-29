import { z } from 'zod'

export const constraintTypeSchema = z.enum(['hard', 'soft'])

export const subjectRuleDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().max(2000).optional(),
  constraintType: constraintTypeSchema,
  weight: z.number().int().min(1).max(10).optional(),
  enabled: z.boolean(),
  satisfactionRate: z.number().min(0).max(100).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const subjectRulesListSchema = z.object({
  content: z.array(subjectRuleDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const createSubjectRuleRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must be at most 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Notes must be at most 2000 characters.')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  constraintType: constraintTypeSchema,
  weight: z.number().int().min(1).max(10).optional(),
  enabled: z.boolean().optional().default(true),
})

export const updateSubjectRuleRequestSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z
    .union([z.string().max(2000, 'Notes must be at most 2000 characters.'), z.null()])
    .optional(),
  constraintType: constraintTypeSchema.optional(),
  weight: z.number().int().min(1).max(10).optional(),
  enabled: z.boolean().optional(),
})

export const subjectRuleFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(200, 'Name must be at most 200 characters.'),
    description: z.string().trim().max(2000, 'Notes must be at most 2000 characters.').optional(),
    constraintType: constraintTypeSchema,
    weight: z.number().int().min(1).max(10),
    enabled: z.boolean(),
  })
  .refine(
    (data) => data.constraintType === 'hard' || (data.weight >= 1 && data.weight <= 10),
    { message: 'Weight is required for soft constraints.', path: ['weight'] },
  )
