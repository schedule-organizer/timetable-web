import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import RoomManagementPage from '@/features/rooms/pages/RoomManagementPage'
import { useCreateRoom, useDeleteRoom, useRooms, useUpdateRoom } from '@/api/hooks/useRooms'

vi.mock('@/api/hooks/useRooms', () => ({
  useRooms: vi.fn(),
  useCreateRoom: vi.fn(),
  useUpdateRoom: vi.fn(),
  useDeleteRoom: vi.fn(),
}))

const roomsFixture = [
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
] as const

const useRoomsMock = vi.mocked(useRooms)
const useCreateRoomMock = vi.mocked(useCreateRoom)
const useUpdateRoomMock = vi.mocked(useUpdateRoom)
const useDeleteRoomMock = vi.mocked(useDeleteRoom)

describe('RoomManagementPage', () => {
  let createMutate: ReturnType<typeof vi.fn>
  let updateMutate: ReturnType<typeof vi.fn>
  let deleteMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    createMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    updateMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })
    deleteMutate = vi.fn((_payload, options) => {
      options?.onSuccess?.()
    })

    useRoomsMock.mockReturnValue({
      data: { content: roomsFixture },
      isLoading: false,
      error: null,
    })
    useCreateRoomMock.mockReturnValue({
      mutate: createMutate,
      isPending: false,
      error: null,
    })
    useUpdateRoomMock.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
      error: null,
    })
    useDeleteRoomMock.mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders the room roster with name, capacity, and type columns', async () => {
    render(<RoomManagementPage />)

    const roster = screen.getByLabelText('Room roster')
    await waitFor(() => {
      expect(within(roster).getByText('Room 101')).toBeInTheDocument()
    })
    expect(within(roster).getByText('Science Lab A')).toBeInTheDocument()
    expect(within(roster).getByText('Main Hall')).toBeInTheDocument()
    expect(within(roster).getByText('30')).toBeInTheDocument()
    expect(within(roster).getByText('Lab')).toBeInTheDocument()
    expect(within(roster).getByText('Sports hall')).toBeInTheDocument()
  })

  it('filters rooms by room type', async () => {
    render(<RoomManagementPage />)

    const roster = screen.getByLabelText('Room roster')
    await waitFor(() => {
      expect(within(roster).getByText('Room 101')).toBeInTheDocument()
    })

    const filter = screen.getByLabelText(/Filter by room type/i)
    await userEvent.selectOptions(filter, 'LAB')

    expect(within(roster).queryByText('Room 101')).not.toBeInTheDocument()
    expect(within(roster).getByText('Science Lab A')).toBeInTheDocument()
    expect(within(roster).queryByText('Main Hall')).not.toBeInTheDocument()
  })

  it('shows a filter-specific message when no rooms match the type filter', async () => {
    useRoomsMock.mockReturnValue({
      data: {
        content: [
          {
            id: 'room-1',
            name: 'Room 101',
            capacity: 30,
            roomType: 'CLASSROOM',
            status: 'ACTIVE',
            createdAt: '2026-03-21T09:00:00Z',
            updatedAt: '2026-03-21T09:00:00Z',
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    render(<RoomManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument()
    })

    const filter = screen.getByLabelText(/Filter by room type/i)
    await userEvent.selectOptions(filter, 'SPORTS_HALL')

    expect(screen.getByText('No rooms match this room type filter.')).toBeInTheDocument()
  })

  it('adds a room via the form (AC1)', async () => {
    render(<RoomManagementPage />)

    await userEvent.click(screen.getByRole('button', { name: /Add room/i }))

    await userEvent.type(screen.getByLabelText('Room name'), 'Art Studio')
    await userEvent.clear(screen.getByLabelText('Capacity'))
    await userEvent.type(screen.getByLabelText('Capacity'), '20')
    await userEvent.selectOptions(screen.getByLabelText('Room type'), 'LAB')
    await userEvent.click(screen.getByRole('button', { name: /Create room/i }))

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        { name: 'Art Studio', capacity: 20, roomType: 'LAB' },
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Room added\. It is now available for scheduling assignment\./i),
    ).toBeInTheDocument()
  })

  it('edits a room capacity and type via the form (AC2)', async () => {
    render(<RoomManagementPage />)

    const roster = screen.getByLabelText('Room roster')
    await waitFor(() => {
      expect(within(roster).getByText('Room 101')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Room 101').closest('tr')
    if (!row) throw new Error('Expected room row to be rendered')

    await userEvent.click(within(row).getByRole('button', { name: /Edit/i }))

    const capacityInput = screen.getByLabelText('Capacity')
    await userEvent.clear(capacityInput)
    await userEvent.type(capacityInput, '35')
    await userEvent.selectOptions(screen.getByLabelText('Room type'), 'LAB')
    await userEvent.click(screen.getByRole('button', { name: /Save changes/i }))

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        { id: 'room-1', data: { name: 'Room 101', capacity: 35, roomType: 'LAB' } },
        expect.anything(),
      )
    })

    expect(
      screen.getByText(/Room updated\. Capacity and type changes take effect on the next generator run\./i),
    ).toBeInTheDocument()
  })

  it('deletes a room after confirmation (AC3)', async () => {
    render(<RoomManagementPage />)

    const roster = screen.getByLabelText('Room roster')
    await waitFor(() => {
      expect(within(roster).getByText('Room 101')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Room 101').closest('tr')
    if (!row) throw new Error('Expected room row to be rendered')

    await userEvent.click(within(row).getByRole('button', { name: /Delete/i }))

    expect(
      screen.getByText(/Are you sure you want to delete Room 101/i),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Delete room/i }))

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith('room-1', expect.anything())
    })

    expect(
      screen.getByText(/Room deleted\. Any scheduled slots assigned to it have been flagged/i),
    ).toBeInTheDocument()
  })

  it('cancels delete when the cancel button is clicked', async () => {
    render(<RoomManagementPage />)

    const roster = screen.getByLabelText('Room roster')
    await waitFor(() => {
      expect(within(roster).getByText('Room 101')).toBeInTheDocument()
    })

    const row = within(roster).getByText('Room 101').closest('tr')
    if (!row) throw new Error('Expected room row to be rendered')

    await userEvent.click(within(row).getByRole('button', { name: /Delete/i }))
    expect(screen.getByText(/Are you sure you want to delete Room 101/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /^Cancel$/i }))

    expect(screen.queryByText(/Are you sure you want to delete Room 101/i)).not.toBeInTheDocument()
    expect(deleteMutate).not.toHaveBeenCalled()
  })
})
