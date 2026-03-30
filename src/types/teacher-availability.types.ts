import { type z } from 'zod'
import {
  availabilitySlotRefSchema,
  teacherAvailabilityDtoSchema,
  updateTeacherAvailabilityRequestSchema,
} from '@/types/teacher-availability.schemas'

export type AvailabilitySlotRef = z.infer<typeof availabilitySlotRefSchema>
export type TeacherAvailabilityDto = z.infer<typeof teacherAvailabilityDtoSchema>
export type UpdateTeacherAvailabilityRequest = z.infer<typeof updateTeacherAvailabilityRequestSchema>

export type AvailabilitySlotState = 'available' | 'unavailable' | 'preferred'
