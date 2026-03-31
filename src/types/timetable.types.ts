import { type z } from 'zod'
import {
  createLessonBodySchema,
  lessonDtoSchema,
  lessonMoveBodySchema,
  lessonPatchBodySchema,
  schedulingAlternativeSlotSchema,
  schedulingConflictDetailsSchema,
  timetableLessonsResponseSchema,
} from '@/types/timetable.schemas'

export type LessonDto = z.infer<typeof lessonDtoSchema>
export type TimetableLessonsResponse = z.infer<typeof timetableLessonsResponseSchema>
export type LessonPatchBody = z.infer<typeof lessonPatchBodySchema>
export type CreateLessonBody = z.infer<typeof createLessonBodySchema>
export type LessonMoveBody = z.infer<typeof lessonMoveBodySchema>
export type SchedulingConflictDetails = z.infer<typeof schedulingConflictDetailsSchema>
export type SchedulingAlternativeSlot = z.infer<typeof schedulingAlternativeSlotSchema>

export type TimetableView = 'class' | 'teacher' | 'room'

export interface GridColumn {
  key: string
  dayIndex: number
  dayLabel: string
  periodId: string
  periodName: string
}

export interface GridRow {
  key: string
  label: string
  groupLabel?: string
}
