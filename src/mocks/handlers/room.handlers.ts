import { http, HttpResponse } from 'msw'
import { mockRooms } from '@/mocks/fixtures/rooms.fixtures'
import { createRoomRequestSchema } from '@/types/room.schemas'
import type { CreateRoomRequest, RoomDto } from '@/types/room.types'

let rooms: RoomDto[] = []
let idCounter = 0

export function resetRoomMocks() {
  rooms = mockRooms.map((room) => ({ ...room }))
  idCounter = rooms.length
}

resetRoomMocks()

const ROOM_LIMIT = 200

function paginationInfo() {
  return {
    page: 0,
    size: rooms.length,
    totalElements: rooms.length,
    totalPages: 1,
  }
}

const parseJson = async (request: Request) => {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return HttpResponse.json(
      { status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.' },
      { status: 400 },
    )
  }
  return raw
}

export const roomHandlers = [
  http.get('/api/v1/rooms', () =>
    HttpResponse.json({
      content: rooms,
      ...paginationInfo(),
    }),
  ),

  http.post('/api/v1/rooms', async ({ request }) => {
    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createRoomRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid room details.' },
        { status: 400 },
      )
    }

    if (rooms.length >= ROOM_LIMIT) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'SUBSCRIPTION_LIMIT',
          message: 'Room catalog limit reached.',
        },
        { status: 400 },
      )
    }

    const payload = parsed.data as CreateRoomRequest
    const now = new Date().toISOString()
    const newRoom: RoomDto = {
      id: `room-${++idCounter}`,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      ...payload,
    }

    rooms = [...rooms, newRoom]

    return HttpResponse.json(newRoom)
  }),

  http.patch('/api/v1/rooms/:id', async ({ params, request }) => {
    const room = rooms.find((r) => r.id === params.id)
    if (!room) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Room not found.' },
        { status: 404 },
      )
    }

    const raw = await parseJson(request)
    if (raw instanceof HttpResponse) return raw

    const parsed = createRoomRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return HttpResponse.json(
        { status: 400, code: 'INVALID_BODY', message: 'Invalid room details.' },
        { status: 400 },
      )
    }

    const updatedRoom: RoomDto = {
      ...room,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    }

    rooms = rooms.map((r) => (r.id === room.id ? updatedRoom : r))

    return HttpResponse.json(updatedRoom)
  }),

  http.delete('/api/v1/rooms/:id', ({ params }) => {
    const room = rooms.find((r) => r.id === params.id)
    if (!room) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Room not found.' },
        { status: 404 },
      )
    }

    rooms = rooms.filter((r) => r.id !== room.id)

    return HttpResponse.json({ deletedId: room.id })
  }),
]
