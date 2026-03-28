import { type z } from 'zod'
import { classDtoSchema, classesDtoSchema, classFormSchema, createClassRequestSchema } from '@/types/class.schemas'

export type ClassDto = z.infer<typeof classDtoSchema>
export type ClassesDto = z.infer<typeof classesDtoSchema>
export type ClassFormValues = z.infer<typeof classFormSchema>
export type CreateClassRequest = z.infer<typeof createClassRequestSchema>
