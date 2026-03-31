import axios from 'axios'
import { schedulingConflictResponseSchema } from '@/types/timetable.schemas'
import type { SchedulingConflictDetails } from '@/types/timetable.types'

export function parseSchedulingConflictDetails(error: unknown): SchedulingConflictDetails | null {
  if (!axios.isAxiosError(error)) return null
  const data = error.response?.data
  const parsed = schedulingConflictResponseSchema.safeParse(data)
  if (!parsed.success) return null
  return parsed.data.details
}
