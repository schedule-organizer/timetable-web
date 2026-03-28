import { z } from 'zod'

export const sendInvitationsRequestSchema = z.object({
  emails: z
    .array(z.string().email('Invalid email address'))
    .min(1, 'At least one email is required'),
})

export const magicLinkCompleteRequestSchema = z.object({
  token: z.string().min(1),
  fullName: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  photoUrl: z.string().url().optional().or(z.literal('')),
})

export type SendInvitationsFormData = z.infer<typeof sendInvitationsRequestSchema>
export type MagicLinkCompleteFormData = z.infer<typeof magicLinkCompleteRequestSchema>
