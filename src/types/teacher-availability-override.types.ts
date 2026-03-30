import { type z } from 'zod'
import {
  availabilityOverrideSlotSchema,
  teacherAvailabilityOverrideDtoSchema,
  updateTeacherAvailabilityOverrideRequestSchema,
  teacherAvailabilitySummaryItemSchema,
  teacherAvailabilitySummarySchema,
} from '@/types/teacher-availability-override.schemas'

export type AvailabilityOverrideSlot = z.infer<typeof availabilityOverrideSlotSchema>
export type TeacherAvailabilityOverrideDto = z.infer<typeof teacherAvailabilityOverrideDtoSchema>
export type UpdateTeacherAvailabilityOverrideRequest = z.infer<
  typeof updateTeacherAvailabilityOverrideRequestSchema
>
export type TeacherAvailabilitySummaryItem = z.infer<typeof teacherAvailabilitySummaryItemSchema>
export type TeacherAvailabilitySummary = z.infer<typeof teacherAvailabilitySummarySchema>
