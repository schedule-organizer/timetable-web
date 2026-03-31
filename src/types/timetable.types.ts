import { type z } from 'zod'
import { lessonDtoSchema, timetableLessonsResponseSchema } from '@/types/timetable.schemas'

export type LessonDto = z.infer<typeof lessonDtoSchema>
export type TimetableLessonsResponse = z.infer<typeof timetableLessonsResponseSchema>

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
