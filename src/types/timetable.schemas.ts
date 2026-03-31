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
