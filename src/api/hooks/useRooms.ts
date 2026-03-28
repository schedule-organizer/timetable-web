import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateRoomRequest, RoomDto, RoomsDto } from '@/types/room.types'

export const ROOMS_QUERY_KEY = ['rooms'] as const

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: () => api.get<RoomsDto>('/api/v1/rooms').then((res) => res.data),
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoomRequest) =>
      api.post<RoomDto>('/api/v1/rooms', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoomRequest }) =>
      api.patch<RoomDto>(`/api/v1/rooms/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) =>
      api.delete(`/api/v1/rooms/${roomId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY })
    },
  })
}
