import type { RoomDto } from '@/types/room.types'

export const mockRooms: RoomDto[] = [
  {
    id: 'room-1',
    name: 'Room 101',
    capacity: 30,
    roomType: 'CLASSROOM',
    status: 'ACTIVE',
    createdAt: '2026-03-21T09:00:00Z',
    updatedAt: '2026-03-21T09:00:00Z',
  },
  {
    id: 'room-2',
    name: 'Science Lab A',
    capacity: 24,
    roomType: 'LAB',
    status: 'ACTIVE',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
  },
  {
    id: 'room-3',
    name: 'Main Hall',
    capacity: 200,
    roomType: 'SPORTS_HALL',
    status: 'ACTIVE',
    createdAt: '2026-03-23T11:00:00Z',
    updatedAt: '2026-03-23T11:00:00Z',
  },
]
