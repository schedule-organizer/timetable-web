import { type z } from 'zod'
import { draftLessonSlotSchema, draftScheduleSchema } from '@/types/timetable-draft.schemas'

export type DraftLessonSlot = z.infer<typeof draftLessonSlotSchema>
export type DraftScheduleDto = z.infer<typeof draftScheduleSchema>
