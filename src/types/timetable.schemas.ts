import { z } from 'zod'

export const lessonDtoSchema = z.object({
  id: z.string(),
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string(),
  classId: z.string(),
  className: z.string(),
  yearGroup: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  subjectColorHex: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  roomId: z.string(),
  roomName: z.string(),
  isPinned: z.boolean(),
  hasConflict: z.boolean(),
})

export const timetableLessonsResponseSchema = z.object({
  timetableId: z.string(),
  lessons: z.array(lessonDtoSchema),
})

/** PATCH /api/v1/lessons/{id} — placement and/or resource fields (no tenant_id). */
export const lessonPatchBodySchema = lessonDtoSchema
  .omit({ id: true })
  .partial()

/** POST /api/v1/timetables/{id}/lessons — create a lesson in a slot. */
export const createLessonBodySchema = z.object({
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string(),
  classId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
  roomId: z.string(),
})

/** POST /api/v1/lessons/{id}/move — drag/drop move (swap if target occupied). */
export const lessonMoveBodySchema = z.object({
  view: z.enum(['class', 'teacher', 'room']),
  targetRowKey: z.string(),
  targetDayIndex: z.number().int().min(0),
  targetPeriodId: z.string(),
})
