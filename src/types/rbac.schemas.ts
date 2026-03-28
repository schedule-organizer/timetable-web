import { z } from 'zod'
import { INSTITUTION_ROLES } from './rbac.types'

export const assignRolesRequestSchema = z.object({
  roles: z
    .array(z.enum(INSTITUTION_ROLES as [string, ...string[]]))
    .min(1, 'At least one role must be assigned.'),
})
