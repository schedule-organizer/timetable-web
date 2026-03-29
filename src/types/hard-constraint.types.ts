import { type z } from 'zod'
import {
  createHardConstraintRequestSchema,
  hardConstraintDtoSchema,
  hardConstraintFormSchema,
  hardConstraintsListSchema,
  hardConstraintRuleTypeSchema,
  updateHardConstraintRequestSchema,
} from '@/types/hard-constraint.schemas'

export type HardConstraintRuleType = z.infer<typeof hardConstraintRuleTypeSchema>
export type HardConstraintDto = z.infer<typeof hardConstraintDtoSchema>
export type HardConstraintsListDto = z.infer<typeof hardConstraintsListSchema>
export type CreateHardConstraintRequest = z.infer<typeof createHardConstraintRequestSchema>
export type UpdateHardConstraintRequest = z.infer<typeof updateHardConstraintRequestSchema>
export type HardConstraintFormValues = z.infer<typeof hardConstraintFormSchema>
