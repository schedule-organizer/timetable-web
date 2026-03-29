import { type z } from 'zod'
import {
  createRoomRequestSchema,
  roomDtoSchema,
  roomFormSchema,
  roomsDtoSchema,
  roomTypeSchema,
} from '@/types/room.schemas'

export type RoomType = z.infer<typeof roomTypeSchema>
export type RoomDto = z.infer<typeof roomDtoSchema>
export type RoomsDto = z.infer<typeof roomsDtoSchema>
export type RoomFormValues = z.infer<typeof roomFormSchema>
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>
