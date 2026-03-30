import { z } from 'zod'

export const availabilityOverrideSlotSchema = z.object({
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string().min(1),
  state: z.enum(['available', 'unavailable', 'preferred']),
})

export const teacherAvailabilityOverrideDtoSchema = z.object({
  overriddenSlots: z.array(availabilityOverrideSlotSchema),
})

export const updateTeacherAvailabilityOverrideRequestSchema = teacherAvailabilityOverrideDtoSchema

export const teacherAvailabilitySummaryItemSchema = z.object({
  teacherId: z.string().min(1),
  submitted: z.boolean(),
  unavailableCount: z.number().int().min(0),
  preferredCount: z.number().int().min(0),
  overrideCount: z.number().int().min(0),
})

export const teacherAvailabilitySummarySchema = z.array(teacherAvailabilitySummaryItemSchema)
