import { type z } from 'zod'
import {
  createSoftPreferenceRequestSchema,
  softPreferenceDtoSchema,
  softPreferenceFormSchema,
  softPreferencesListSchema,
  updateSoftPreferenceRequestSchema,
} from '@/types/soft-preference.schemas'

export type SoftPreferenceDto = z.infer<typeof softPreferenceDtoSchema>
export type SoftPreferencesListDto = z.infer<typeof softPreferencesListSchema>
export type CreateSoftPreferenceRequest = z.infer<typeof createSoftPreferenceRequestSchema>
export type UpdateSoftPreferenceRequest = z.infer<typeof updateSoftPreferenceRequestSchema>
export type SoftPreferenceFormValues = z.infer<typeof softPreferenceFormSchema>
