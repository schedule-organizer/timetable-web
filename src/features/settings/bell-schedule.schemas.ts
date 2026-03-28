import { z } from 'zod'
import { parseTimeToMinutes } from '@/lib/bell-schedule-utils'

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use 24-hour time (HH:mm)')

export const bellPeriodSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required'),
  startTime: hhmm,
  endTime: hhmm,
})

export const bellScheduleFormSchema = z
  .object({
    periods: z.array(bellPeriodSchema).min(1, 'At least one period is required'),
  })
  .superRefine((data, ctx) => {
    data.periods.forEach((p, i) => {
      const start = parseTimeToMinutes(p.startTime)
      const end = parseTimeToMinutes(p.endTime)
      if (start !== null && end !== null && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be after start time',
          path: ['periods', i, 'endTime'],
        })
      }
    })
  })

export type BellScheduleFormValues = z.infer<typeof bellScheduleFormSchema>
