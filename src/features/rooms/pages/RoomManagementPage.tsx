import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { RoomForm, roomTypeOptions } from '@/features/rooms/components/RoomForm'
import { useCreateRoom, useDeleteRoom, useRooms, useUpdateRoom } from '@/api/hooks/useRooms'
import type { RoomDto, RoomFormValues, RoomType } from '@/types/room.types'

const ALL_TYPES = 'ALL'
type RoomTypeFilter = RoomType | typeof ALL_TYPES

const roomTypeLabels: Record<RoomType, string> = {
  CLASSROOM: 'Classroom',
  LAB: 'Lab',
  SPORTS_HALL: 'Sports hall',
}

export default function RoomManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null)
  const [roomToDelete, setRoomToDelete] = useState<RoomDto | null>(null)
  const [typeFilter, setTypeFilter] = useState<RoomTypeFilter>(ALL_TYPES)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useRooms()
  const rooms = data?.content ?? []

  const {
    mutate: createRoom,
    isPending: isCreating,
    error: createError,
  } = useCreateRoom()
  const {
    mutate: updateRoom,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateRoom()
  const {
    mutate: deleteRoom,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteRoom()

  const mutationError = createError ?? updateError ?? deleteError
  const isFormSubmitting = isCreating || isUpdating

  const filteredRooms = useMemo(() => {
    if (typeFilter === ALL_TYPES) return rooms
    return rooms.filter((room) => room.roomType === typeFilter)
  }, [rooms, typeFilter])

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingRoom(null)
  }

  const handleAddClick = () => {
    setStatusMessage(null)
    setEditingRoom(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (room: RoomDto) => {
    setStatusMessage(null)
    setEditingRoom(room)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (values: RoomFormValues) => {
    if (editingRoom) {
      updateRoom(
        { id: editingRoom.id, data: values },
        {
          onSuccess: () => {
            setStatusMessage(
              'Room updated. Capacity and type changes take effect on the next generator run.',
            )
            handleFormClose()
          },
        },
      )
    } else {
      createRoom(values, {
        onSuccess: () => {
          setStatusMessage('Room added. It is now available for scheduling assignment.')
          handleFormClose()
        },
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (!roomToDelete) return
    const removed = roomToDelete
    deleteRoom(removed.id, {
      onSuccess: () => {
        setStatusMessage(
          'Room deleted. Any scheduled slots assigned to it have been flagged for reassignment.',
        )
        setRoomToDelete(null)
      },
    })
  }

  const queryErrorMessage = error ? getApiErrorMessage(error) : null
  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  const formInitialValues = useMemo<RoomFormValues | undefined>(() => {
    if (!editingRoom) return undefined
    return {
      name: editingRoom.name,
      capacity: editingRoom.capacity,
      roomType: editingRoom.roomType,
    }
  }, [editingRoom])

  const deleteDialogCancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!roomToDelete) return
    deleteDialogCancelRef.current?.focus()
  }, [roomToDelete])

  useEffect(() => {
    if (!roomToDelete) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRoomToDelete(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [roomToDelete])

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Rooms
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Define rooms so the scheduler can assign lessons and avoid double-booking.
          </p>
        </div>
        <Button type="button" onClick={handleAddClick}>
          Add room
        </Button>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="room-type-filter" className="text-sm font-semibold">
            Filter by room type
          </Label>
          <select
            id="room-type-filter"
            className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RoomTypeFilter)}
          >
            <option value={ALL_TYPES}>All room types</option>
            {roomTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section aria-label="Room roster" className="space-y-5">
        {isFormOpen && (
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {editingRoom ? 'Edit room' : 'Add room'}
            </h2>
            <RoomForm
              initialValues={formInitialValues}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              submitLabel={editingRoom ? 'Save changes' : 'Create room'}
              isLoading={isFormSubmitting}
            />
            {operationErrorMessage && (
              <p className="mt-4 text-xs text-red-700" role="alert">
                {operationErrorMessage}
              </p>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900"
          >
            {statusMessage}
          </div>
        )}

        {operationErrorMessage && !isFormOpen && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
            {operationErrorMessage}
          </div>
        )}

        {queryErrorMessage && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {queryErrorMessage}
          </div>
        )}

        {isLoading ? (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading rooms…
          </div>
        ) : filteredRooms.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-[--color-border] p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm text-[--color-text-secondary]">
              {rooms.length === 0
                ? 'No rooms configured yet.'
                : 'No rooms match this room type filter.'}
            </p>
            {rooms.length === 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={handleAddClick}>
                  Add room
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface] text-[--color-text-secondary]">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Capacity</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="border-b border-[--color-border] last:border-b-0">
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {room.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {room.capacity}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {roomTypeLabels[room.roomType]}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(room)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setRoomToDelete(room)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {roomToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-delete-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setRoomToDelete(null)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-sm rounded-lg border border-[--color-border] bg-[--color-surface] p-6 shadow-xl">
              <h2 id="room-delete-dialog-title" className="text-base font-semibold text-red-950">
                Delete room?
              </h2>
              <p className="mt-2 text-sm text-red-900">
                Are you sure you want to delete {roomToDelete.name}? Any scheduled slots assigned to
                this room will be flagged for reassignment.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  ref={deleteDialogCancelRef}
                  type="button"
                  variant="secondary"
                  onClick={() => setRoomToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete room'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
