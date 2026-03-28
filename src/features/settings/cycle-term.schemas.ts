import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date')

export const cycleSettingsFormSchema = z
  .object({
    cycleLengthDays: z.coerce.number().int().min(1).max(31),
    dayLabels: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.dayLabels.length !== data.cycleLengthDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Provide exactly ${data.cycleLengthDays} day labels (one per cycle day).`,
        path: ['dayLabels'],
      })
    }
  })

export type CycleSettingsFormValues = z.infer<typeof cycleSettingsFormSchema>

const academicTermRowSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1, 'Name is required'),
    startDate: isoDate,
    endDate: isoDate,
  })
  .superRefine((row, ctx) => {
    if (row.endDate < row.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after the start date.',
        path: ['endDate'],
      })
    }
  })

export const academicTermsFormSchema = z.object({
  terms: z.array(academicTermRowSchema),
})

export type AcademicTermsFormValues = z.infer<typeof academicTermsFormSchema>
