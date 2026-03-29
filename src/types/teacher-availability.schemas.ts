import { z } from 'zod'

export const availabilitySlotRefSchema = z.object({
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string().min(1),
})

export const teacherAvailabilityDtoSchema = z
  .object({
    unavailable: z.array(availabilitySlotRefSchema),
    preferred: z.array(availabilitySlotRefSchema),
  })
  .superRefine((data, ctx) => {
    const key = (s: { cycleDayIndex: number; periodId: string }) =>
      `${s.cycleDayIndex}:${s.periodId}`
    const pref = new Set(data.preferred.map(key))
    for (const u of data.unavailable) {
      if (pref.has(key(u))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A slot cannot be both unavailable and preferred.',
          path: ['unavailable'],
        })
        break
      }
    }
  })

export const updateTeacherAvailabilityRequestSchema = teacherAvailabilityDtoSchema
