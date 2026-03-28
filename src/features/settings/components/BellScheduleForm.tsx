import { useEffect } from 'react'
import { useForm, useFieldArray, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { bellScheduleFormSchema, type BellScheduleFormValues } from '@/features/settings/bell-schedule.schemas'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { findFirstOverlappingPair } from '@/lib/bell-schedule-utils'
import { useBellSchedule, useUpdateBellSchedule } from '@/api/hooks/useBellSchedule'
import { useLabels } from '@/hooks/useLabels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SortableRowProps = {
  periodId: string
  index: number
  register: UseFormRegister<BellScheduleFormValues>
  periodLabel: string
  disabled?: boolean
  onRemove: () => void
  nameError?: string
  startError?: string
  endError?: string
}

function SortablePeriodRow({
  periodId,
  index,
  register,
  periodLabel,
  disabled,
  onRemove,
  nameError,
  startError,
  endError,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: periodId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const baseId = `period-row-${periodId}`

  const rowStyle = {
    ...style,
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
  }

  return (
    <li
      ref={setNodeRef}
      style={rowStyle}
      className={`flex flex-wrap items-end gap-3 rounded-md border p-3 ${
        isDragging ? 'opacity-70' : ''
      }`}
    >
      <input type="hidden" {...register(`periods.${index}.id`)} />
      <div className="flex items-center pt-6">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-[var(--color-text-secondary)] hover:bg-black/5 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Drag to reorder"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} aria-hidden />
        </button>
      </div>
      <div className="grid min-w-[140px] flex-1 gap-1">
        <Label htmlFor={`${baseId}-name`} className="text-xs font-medium">
          {periodLabel} name
        </Label>
        <Input
          id={`${baseId}-name`}
          aria-label={`${periodLabel} name`}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? `${baseId}-name-err` : undefined}
          {...register(`periods.${index}.name`)}
        />
        {nameError ? (
          <p id={`${baseId}-name-err`} className="text-xs text-red-600" role="alert">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="grid w-[7.5rem] gap-1">
        <Label htmlFor={`${baseId}-start`} className="text-xs font-medium">
          Start
        </Label>
        <Input
          id={`${baseId}-start`}
          type="time"
          aria-label="Start time"
          aria-invalid={Boolean(startError)}
          aria-describedby={startError ? `${baseId}-start-err` : undefined}
          {...register(`periods.${index}.startTime`)}
        />
        {startError ? (
          <p id={`${baseId}-start-err`} className="text-xs text-red-600" role="alert">
            {startError}
          </p>
        ) : null}
      </div>
      <div className="grid w-[7.5rem] gap-1">
        <Label htmlFor={`${baseId}-end`} className="text-xs font-medium">
          End
        </Label>
        <Input
          id={`${baseId}-end`}
          type="time"
          aria-label="End time"
          aria-invalid={Boolean(endError)}
          aria-describedby={endError ? `${baseId}-end-err` : undefined}
          {...register(`periods.${index}.endTime`)}
        />
        {endError ? (
          <p id={`${baseId}-end-err`} className="text-xs text-red-600" role="alert">
            {endError}
          </p>
        ) : null}
      </div>
      <div className="flex items-end pb-1">
        <Button type="button" variant="outline" onClick={onRemove} aria-label={`Remove ${periodLabel}`}>
          Remove
        </Button>
      </div>
    </li>
  )
}

export function BellScheduleForm() {
  const label = useLabels()
  const periodLabel = label('period')
  const { data, isLoading } = useBellSchedule()
  const {
    mutate: saveSchedule,
    reset: resetMutation,
    isPending,
    isSuccess,
    error: saveError,
  } = useUpdateBellSchedule()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<BellScheduleFormValues>({
    resolver: zodResolver(bellScheduleFormSchema),
    defaultValues: { periods: [] },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'periods',
  })

  const periods = watch('periods')

  useEffect(() => {
    if (data?.periods) {
      reset({ periods: data.periods.map((p) => ({ ...p })) })
    }
  }, [data, reset])

  useEffect(() => {
    if (!isSuccess) return
    const id = window.setTimeout(() => resetMutation(), 4000)
    return () => window.clearTimeout(id)
  }, [isSuccess, resetMutation])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const list = getValues('periods')
    const oldIndex = list.findIndex((p) => p.id === active.id)
    const newIndex = list.findIndex((p) => p.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    move(oldIndex, newIndex)
  }

  function onSubmit(values: BellScheduleFormValues) {
    clearErrors('root')
    const overlap = findFirstOverlappingPair(values.periods)
    if (overlap) {
      setError('root', {
        type: 'overlap',
        message: `Time ranges overlap between "${overlap.periodA.name}" and "${overlap.periodB.name}". Adjust the times so periods do not overlap.`,
      })
      return
    }
    saveSchedule({ periods: values.periods })
  }

  function addPeriod() {
    append({
      id: crypto.randomUUID(),
      name: '',
      startTime: '12:00',
      endTime: '13:00',
    })
  }

  if (isLoading) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Loading {label('bellSchedule').toLowerCase()}…
      </p>
    )
  }

  const rootMessage = errors.root?.message
  const periodsMessage = (errors.periods as { message?: string } | undefined)?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label={`${label('bellSchedule')} configuration form`}
      noValidate
      onChange={() => { if (errors.root) clearErrors('root') }}
    >
      <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Define named {periodLabel.toLowerCase()}s and their times. Order sets the time axis for the
        timetable grid, availability grid, and reports. Adjacent times (e.g. 09:00 end and 09:00 start)
        are allowed; intersecting ranges are not.
      </p>

      {rootMessage && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{rootMessage}</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={periods.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3" aria-label={`Ordered ${periodLabel} list`}>
            {fields.map((field, index) => (
              <SortablePeriodRow
                key={field.id}
                periodId={periods[index]?.id ?? ''}
                index={index}
                register={register}
                periodLabel={periodLabel}
                disabled={isPending}
                onRemove={() => remove(index)}
                nameError={errors.periods?.[index]?.name?.message}
                startError={errors.periods?.[index]?.startTime?.message}
                endError={errors.periods?.[index]?.endTime?.message}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {periodsMessage && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {periodsMessage}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addPeriod}>
          Add {periodLabel}
        </Button>
      </div>

      {saveError && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">Could not save {label('bellSchedule').toLowerCase()}</p>
          <p className="text-sm text-red-700">{getApiErrorMessage(saveError)}</p>
        </div>
      )}

      {isSuccess && (
        <div role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">{label('bellSchedule')} saved successfully.</p>
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : `Save ${label('bellSchedule')}`}
        </Button>
      </div>
    </form>
  )
}
