import { z } from 'zod'

export const draftLessonSlotSchema = z.object({
  id: z.string(),
  cycleDayIndex: z.number().int().min(0),
  periodId: z.string(),
  classId: z.string(),
  className: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  roomId: z.string(),
  roomName: z.string(),
})

export const draftScheduleSchema = z.object({
  termId: z.string(),
  generatedAt: z.string(),
  lessons: z.array(draftLessonSlotSchema),
})
