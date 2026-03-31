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

/** Reason codes when the proposed placement clashes with an existing lesson. */
export const schedulingConflictReasonSchema = z.enum([
  'TEACHER_DOUBLE_BOOKED',
  'ROOM_IN_USE',
  'CLASS_SLOT_OCCUPIED',
])

export const schedulingAlternativeSlotSchema = z.object({
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string(),
  summary: z.string(),
})

export const schedulingConflictDetailsSchema = z.object({
  reason: schedulingConflictReasonSchema,
  conflictingLessonId: z.string().optional(),
  alternatives: z.array(schedulingAlternativeSlotSchema).min(1).max(5),
})

/** 409 body when PATCH/POST would schedule a hard conflict (mock + future API). */
export const schedulingConflictResponseSchema = z.object({
  status: z.number().optional(),
  code: z.literal('SCHEDULING_CONFLICT'),
  message: z.string(),
  details: schedulingConflictDetailsSchema,
})

/** PATCH body may include acceptConflict to persist despite a detected conflict. */
export const lessonPatchApiBodySchema = lessonPatchBodySchema.merge(
  z.object({ acceptConflict: z.boolean().optional() }),
)

/** POST create body may include acceptConflict for the same purpose. */
export const createLessonApiBodySchema = createLessonBodySchema.merge(
  z.object({ acceptConflict: z.boolean().optional() }),
)
