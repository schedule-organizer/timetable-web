import { z } from 'zod'

export const institutionTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  previewDetails: z.object({
    cycleLengthDays: z.number().int().positive(),
    periodsPerDay: z.number().int().positive(),
    cycleDescription: z.string(),
  }),
})

export const institutionTemplatesDtoSchema = z.object({
  templates: z.array(institutionTemplateSchema),
})

export const applyTemplateRequestSchema = z.object({
  templateId: z.string().min(1),
})

export const appliedTemplateSettingsSchema = z.object({
  templateId: z.string().min(1),
  templateName: z.string().min(1),
  bellSchedule: z.object({
    periodsApplied: z.number().int().nonnegative(),
    firstPeriodStart: z.string(),
    lastPeriodEnd: z.string(),
  }),
  cycle: z.object({
    cycleLengthDays: z.number().int().positive(),
    cycleDescription: z.string(),
  }),
  terminology: z.object({
    overridesApplied: z.array(z.string()),
  }),
})

export type InstitutionTemplate = z.infer<typeof institutionTemplateSchema>
export type InstitutionTemplatesDto = z.infer<typeof institutionTemplatesDtoSchema>
export type ApplyTemplateRequest = z.infer<typeof applyTemplateRequestSchema>
export type AppliedTemplateSettings = z.infer<typeof appliedTemplateSettingsSchema>
