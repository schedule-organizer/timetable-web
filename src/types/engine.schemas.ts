import { z } from 'zod'
import { draftScheduleSchema } from '@/types/timetable-draft.schemas'

export const constraintRelaxationSchema = z.object({
  constraintId: z.string(),
  constraintName: z.string(),
  weight: z.number().int().min(1).max(10),
})

export const engineRunRequestSchema = z.object({
  termId: z.string().min(1),
  relaxations: z.array(constraintRelaxationSchema).optional(),
})

export const relaxedConstraintSummarySchema = z.object({
  constraintId: z.string(),
  constraintName: z.string(),
  weight: z.number().int().min(1).max(10),
  handledAs: z.string(),
})

export const conflictEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const affectedSlotSchema = z.object({
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string(),
})

export const conflictExplanationDtoSchema = z.object({
  id: z.string(),
  constraintId: z.string(),
  constraintName: z.string(),
  explanation: z.string(),
  affectedTeachers: z.array(conflictEntitySchema),
  affectedClasses: z.array(conflictEntitySchema),
  affectedSlots: z.array(affectedSlotSchema),
})

export const conflictReportDtoSchema = z.object({
  conflicts: z.array(conflictExplanationDtoSchema),
})

export const engineJobStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
])

export const softPreferenceSatisfactionStatusSchema = z.enum([
  'fully_satisfied',
  'partially_satisfied',
  'not_satisfied',
])

export const softPreferenceSatisfactionDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().min(0).max(100),
  status: softPreferenceSatisfactionStatusSchema,
})

export const hardConstraintStatusDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  satisfied: z.boolean(),
  conflictDescription: z.string().optional(),
})

export const constraintSatisfactionReportSchema = z.object({
  overallPercentage: z.number().min(0).max(100),
  softFullySatisfied: z.number().int().min(0),
  softPartiallySatisfied: z.number().int().min(0),
  softNotSatisfied: z.number().int().min(0),
  softPreferences: z.array(softPreferenceSatisfactionDtoSchema),
  hardConstraints: z.array(hardConstraintStatusDtoSchema),
  relaxedConstraints: z.array(relaxedConstraintSummarySchema).optional(),
})

export const engineJobDtoSchema = z.object({
  id: z.string(),
  status: engineJobStatusSchema,
  statusMessage: z.string(),
  result: draftScheduleSchema.optional(),
  constraintReport: constraintSatisfactionReportSchema.optional(),
  conflictReport: conflictReportDtoSchema.optional(),
})

export const engineRunResponseSchema = z.object({
  jobId: z.string(),
})
