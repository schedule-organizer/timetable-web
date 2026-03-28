import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  InvitedTeachersDto,
  SendInvitationsRequest,
  SendInvitationsResponse,
  ResendInvitationResponse,
  MagicLinkValidateResponse,
  MagicLinkCompleteRequest,
  MagicLinkCompleteResponse,
} from '@/types/invitation.types'

export const INVITATIONS_QUERY_KEY = ['invitations'] as const

export function useInvitations() {
  return useQuery({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: () =>
      api.get<InvitedTeachersDto>('/api/v1/invitations').then((res) => res.data),
  })
}

export function useSendInvitations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendInvitationsRequest) =>
      api.post<SendInvitationsResponse>('/api/v1/invitations', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY })
    },
  })
}

export function useResendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (teacherId: string) =>
      api
        .post<ResendInvitationResponse>(`/api/v1/invitations/${teacherId}/resend`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY })
    },
  })
}

export function useMagicLinkValidate(token: string | null) {
  return useQuery({
    queryKey: ['magic-link-validate', token],
    queryFn: () => {
      if (token == null || token === '') {
        return Promise.reject(new Error('Magic link token is missing.'))
      }
      const query = new URLSearchParams({ token }).toString()
      return api
        .get<MagicLinkValidateResponse>(`/api/v1/auth/magic-link/validate?${query}`)
        .then((res) => res.data)
    },
    enabled: !!token,
    retry: false,
  })
}

export function useMagicLinkComplete() {
  return useMutation({
    mutationFn: (data: MagicLinkCompleteRequest) =>
      api
        .post<MagicLinkCompleteResponse>('/api/v1/auth/magic-link/complete', data)
        .then((res) => res.data),
  })
}
