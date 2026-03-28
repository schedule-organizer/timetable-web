export type InvitationStatus = 'INVITED' | 'ACTIVE' | 'EXPIRED'

export interface InvitedTeacher {
  id: string
  email: string
  fullName: string | null
  status: InvitationStatus
  invitedAt: string
  expiresAt: string
}

export interface InvitedTeachersDto {
  content: InvitedTeacher[]
}

export interface SendInvitationsRequest {
  emails: string[]
}

export interface SendInvitationsResponse {
  sent: InvitedTeacher[]
}

export interface ResendInvitationResponse {
  teacher: InvitedTeacher
}

export interface MagicLinkValidateResponse {
  teacherId: string
  email: string
  institutionName: string
}

export interface MagicLinkCompleteRequest {
  token: string
  fullName: string
  photoUrl?: string
}

export interface MagicLinkCompleteResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    role: string
    institutionId: string
    createdAt: string
  }
}
