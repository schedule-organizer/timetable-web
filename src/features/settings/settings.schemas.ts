import { z } from 'zod'

// Each label is optional free text; empty string restores the SchediFlow default.
const optionalLabel = z.string().trim()

export const terminologySchema = z.object({
  period: optionalLabel,
  class: optionalLabel,
  term: optionalLabel,
  cycle: optionalLabel,
  bellSchedule: optionalLabel,
  room: optionalLabel,
  subject: optionalLabel,
})

export type TerminologyFormData = z.infer<typeof terminologySchema>
