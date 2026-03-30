import { type z } from 'zod'
import {
  engineJobDtoSchema,
  engineRunRequestSchema,
  engineRunResponseSchema,
} from '@/types/engine.schemas'

export type EngineRunRequest = z.infer<typeof engineRunRequestSchema>
export type EngineJobDto = z.infer<typeof engineJobDtoSchema>
export type EngineRunResponse = z.infer<typeof engineRunResponseSchema>
