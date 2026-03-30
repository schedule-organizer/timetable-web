import { z } from 'zod'
import { draftScheduleSchema } from '@/types/timetable-draft.schemas'

export const engineRunRequestSchema = z.object({
  termId: z.string().min(1),
})

export const engineJobStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
])

export const engineJobDtoSchema = z.object({
  id: z.string(),
  status: engineJobStatusSchema,
  statusMessage: z.string(),
  result: draftScheduleSchema.optional(),
})

export const engineRunResponseSchema = z.object({
  jobId: z.string(),
})
