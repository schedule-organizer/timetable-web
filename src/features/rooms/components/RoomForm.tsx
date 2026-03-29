import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { roomFormSchema } from '@/types/room.schemas'
import type { RoomFormValues } from '@/types/room.types'

export const roomTypeOptions = [
  { value: 'CLASSROOM', label: 'Classroom' },
  { value: 'LAB', label: 'Lab' },
  { value: 'SPORTS_HALL', label: 'Sports hall' },
] as const

const emptyValues: RoomFormValues = { name: '', capacity: 1, roomType: 'CLASSROOM' }

interface RoomFormProps {
  initialValues?: RoomFormValues
  onCancel?: () => void
  onSubmit: (values: RoomFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function RoomForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: RoomFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })

  useEffect(() => {
    reset(initialValues ?? emptyValues)
  }, [initialValues, reset])

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="room-name">Room name</Label>
        <Input
          id="room-name"
          placeholder="e.g. Room 101"
          className="mt-1"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="room-capacity">Capacity</Label>
        <Input
          id="room-capacity"
          type="number"
          min={1}
          placeholder="e.g. 30"
          className="mt-1"
          {...register('capacity', { valueAsNumber: true })}
        />
        {errors.capacity && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.capacity.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="room-type">Room type</Label>
        <select
          id="room-type"
          className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
          {...register('roomType')}
        >
          {roomTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.roomType && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.roomType.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
