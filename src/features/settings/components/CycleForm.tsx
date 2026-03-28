import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cycleSettingsFormSchema, type CycleSettingsFormValues } from '@/features/settings/cycle-term.schemas'
import { useCycleSettings, useUpdateCycleSettings } from '@/api/hooks/useCycleSettings'
import { useLabels } from '@/hooks/useLabels'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { padDayLabels } from '@/lib/cycle-term-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CycleForm() {
  const label = useLabels()
  const { data, isLoading } = useCycleSettings()
  const {
    mutate: saveCycle,
    reset: resetMutation,
    isPending,
    isSuccess,
    error: saveError,
  } = useUpdateCycleSettings()

  useEffect(() => {
    if (!isSuccess) return
    const id = window.setTimeout(() => resetMutation(), 4000)
    return () => window.clearTimeout(id)
  }, [isSuccess, resetMutation])

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<CycleSettingsFormValues>({
    resolver: zodResolver(cycleSettingsFormSchema),
    defaultValues: {
      cycleLengthDays: 5,
      dayLabels: ['', '', '', '', ''],
    },
  })

  const cycleLengthDays = useWatch({ control, name: 'cycleLengthDays' })
  const dayLabelFields = useWatch({ control, name: 'dayLabels' }) ?? []

  useEffect(() => {
    if (!data) return
    if (isDirty) return
    reset({
      cycleLengthDays: data.cycleLengthDays,
      dayLabels: padDayLabels(data.dayLabels, data.cycleLengthDays),
    })
  }, [data, reset, isDirty])

  useEffect(() => {
    const n = Math.floor(Number(cycleLengthDays))
    if (!Number.isFinite(n) || n < 1 || n > 31) return
    const labels = getValues('dayLabels')
    if (labels.length === n) return
    setValue('dayLabels', padDayLabels(labels, n))
  }, [cycleLengthDays, getValues, setValue])

  function onSubmit(values: CycleSettingsFormValues) {
    const payload = {
      cycleLengthDays: values.cycleLengthDays,
      dayLabels: values.dayLabels.map((s) => s.trim()),
    }
    saveCycle(payload, {
      onSuccess: (saved) => {
        reset({
          cycleLengthDays: saved.cycleLengthDays,
          dayLabels: padDayLabels(saved.dayLabels, saved.cycleLengthDays),
        })
      },
    })
  }

  if (isLoading) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Loading {label('cycle').toLowerCase()} settings…
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Cycle settings form" noValidate>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Set how many positions repeat in your {label('cycle').toLowerCase()} (for example 5 school days or a
        10-day rotation). Optionally name each position.
      </p>

      <div className="mb-6 grid max-w-xs gap-2">
        <Label htmlFor="cycle-length-days" className="text-sm font-medium">
          Number of days in {label('cycle').toLowerCase()}
        </Label>
        <Input
          id="cycle-length-days"
          type="number"
          min={1}
          max={31}
          aria-invalid={Boolean(errors.cycleLengthDays)}
          aria-describedby={errors.cycleLengthDays ? 'cycle-length-days-err' : undefined}
          {...register('cycleLengthDays', { valueAsNumber: true })}
        />
        {errors.cycleLengthDays ? (
          <p id="cycle-length-days-err" className="text-xs text-red-600" role="alert">
            {errors.cycleLengthDays.message}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Optional names for each {label('cycle').toLowerCase()} day
        </legend>
        {dayLabelFields.map((_, index) => (
          <div key={`day-label-${index}`} className="grid max-w-md gap-1">
            <Label htmlFor={`cycle-day-${index}`} className="text-xs font-medium">
              Day {index + 1}
            </Label>
            <Input
              id={`cycle-day-${index}`}
              placeholder="Optional (e.g. Day A, Monday)"
              aria-label={`Cycle day ${index + 1} name`}
              aria-invalid={Boolean(errors.dayLabels?.[index])}
              aria-describedby={errors.dayLabels?.[index] ? `cycle-day-${index}-err` : undefined}
              {...register(`dayLabels.${index}` as const)}
            />
            {errors.dayLabels?.[index] ? (
              <p id={`cycle-day-${index}-err`} className="text-xs text-red-600" role="alert">
                {errors.dayLabels[index]?.message}
              </p>
            ) : null}
          </div>
        ))}
      </fieldset>

      {errors.dayLabels && typeof errors.dayLabels.message === 'string' ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {errors.dayLabels.message}
        </p>
      ) : null}

      {saveError ? (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">Failed to save {label('cycle').toLowerCase()}</p>
          <p className="text-sm text-red-700">{getApiErrorMessage(saveError)}</p>
        </div>
      ) : null}

      {isSuccess ? (
        <div role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            {label('cycle')} saved successfully.
          </p>
        </div>
      ) : null}

      <div className="mt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : `Save ${label('cycle')}`}
        </Button>
      </div>
    </form>
  )
}
