import axios from 'axios'
import { partialRegenUnsatisfiedDetailsSchema } from '@/types/timetable.schemas'
import type { ConflictReportDto } from '@/types/engine.types'

/** Parses 422 from POST regenerate-unpinned when details contain a scoped conflict report. */
export function parsePartialRegenUnsatisfiedDetails(e: unknown): ConflictReportDto | null {
  if (!axios.isAxiosError(e) || e.response?.status !== 422) return null
  const data = e.response.data
  if (!data || typeof data !== 'object' || !('details' in data)) return null
  const parsed = partialRegenUnsatisfiedDetailsSchema.safeParse(
    (data as { details: unknown }).details,
  )
  return parsed.success ? parsed.data.conflictReport : null
}
