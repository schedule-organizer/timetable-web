import { z } from 'zod'

export const hardConstraintRuleTypeSchema = z.enum([
  'TEACHER_NO_DOUBLE_BOOKING',
  'ROOM_CAPACITY_NOT_EXCEEDED',
  'CLASS_NO_DOUBLE_BOOKING',
])

export const hardConstraintDtoSchema = z.object({
  id: z.string(),
  ruleType: hardConstraintRuleTypeSchema,
  description: z.string().max(2000).optional(),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const hardConstraintsListSchema = z.object({
  content: z.array(hardConstraintDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const createHardConstraintRequestSchema = z.object({
  ruleType: hardConstraintRuleTypeSchema,
  description: z
    .string()
    .max(2000, 'Notes must be at most 2000 characters.')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  enabled: z.boolean().optional().default(true),
})

export const updateHardConstraintRequestSchema = z.object({
  description: z
    .union([
      z.string().max(2000, 'Notes must be at most 2000 characters.'),
      z.null(),
    ])
    .optional(),
  enabled: z.boolean().optional(),
})

export const hardConstraintFormSchema = z.object({
  ruleType: hardConstraintRuleTypeSchema,
  description: z.string().max(2000).optional(),
  enabled: z.boolean(),
})
