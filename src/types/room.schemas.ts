import { z } from 'zod'

export const roomTypeSchema = z.enum(['CLASSROOM', 'LAB', 'SPORTS_HALL'])

export const roomDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  roomType: roomTypeSchema,
  status: z.literal('ACTIVE'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const roomsDtoSchema = z.object({
  content: z.array(roomDtoSchema),
  page: z.number().optional(),
  size: z.number().optional(),
  totalElements: z.number().optional(),
  totalPages: z.number().optional(),
})

export const roomFormSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required.'),
  capacity: z
    .number({ invalid_type_error: 'Capacity must be a number.' })
    .int('Capacity must be a whole number.')
    .positive('Capacity must be at least 1.'),
  roomType: roomTypeSchema,
})

export const createRoomRequestSchema = roomFormSchema
