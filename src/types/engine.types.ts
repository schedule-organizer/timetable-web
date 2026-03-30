import { type z } from 'zod'
import {
  constraintSatisfactionReportSchema,
  engineJobDtoSchema,
  engineRunRequestSchema,
  engineRunResponseSchema,
  hardConstraintStatusDtoSchema,
  softPreferenceSatisfactionDtoSchema,
} from '@/types/engine.schemas'

export type EngineRunRequest = z.infer<typeof engineRunRequestSchema>
export type EngineJobDto = z.infer<typeof engineJobDtoSchema>
export type EngineRunResponse = z.infer<typeof engineRunResponseSchema>
export type SoftPreferenceSatisfactionDto = z.infer<typeof softPreferenceSatisfactionDtoSchema>
export type HardConstraintStatusDto = z.infer<typeof hardConstraintStatusDtoSchema>
export type ConstraintSatisfactionReport = z.infer<typeof constraintSatisfactionReportSchema>
