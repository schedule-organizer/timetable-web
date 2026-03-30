import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { softPreferenceFormSchema } from '@/types/soft-preference.schemas'
import type { SoftPreferenceFormValues } from '@/types/soft-preference.types'

const emptyValues: SoftPreferenceFormValues = {
  name: '',
  description: '',
  weight: 5,
  enabled: true,
}

interface SoftPreferenceFormProps {
  mode: 'create' | 'edit'
  initialValues?: SoftPreferenceFormValues
  onCancel?: () => void
  onSubmit: (values: SoftPreferenceFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function SoftPreferenceForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: SoftPreferenceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<SoftPreferenceFormValues>({
    resolver: zodResolver(softPreferenceFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })

  useEffect(() => {
    reset(initialValues ?? emptyValues)
  }, [initialValues, reset])

  const weightValue = watch('weight')

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="soft-preference-name">Preference name</Label>
        <input
          id="soft-preference-name"
          type="text"
          placeholder='e.g. "Teacher A prefers Fridays free"'
          className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary] placeholder:text-[--color-text-secondary]"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="soft-preference-weight">
          Weight: <span className="font-semibold text-[--color-text-primary]">{weightValue}</span>{' '}
          / 10
        </Label>
        <p className="mt-0.5 text-xs text-[--color-text-secondary]">
          Higher weights are prioritised when the generator cannot satisfy all preferences.
        </p>
        <Controller
          name="weight"
          control={control}
          render={({ field: { value, onChange, ref, name } }) => (
            <input
              ref={ref}
              id="soft-preference-weight"
              name={name}
              type="range"
              min={1}
              max={10}
              step={1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="mt-2 w-full accent-[--color-primary]"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={value}
            />
          )}
        />
        <div className="mt-1 flex justify-between text-xs text-[--color-text-secondary]">
          <span>1 — Low priority</span>
          <span>10 — High priority</span>
        </div>
        {errors.weight && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.weight.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="soft-preference-notes">Notes (optional)</Label>
        <textarea
          id="soft-preference-notes"
          rows={3}
          placeholder="Internal notes for your team — not shown to teachers."
          className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary] placeholder:text-[--color-text-secondary]"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="enabled"
          control={control}
          render={({ field: { value, onChange, ref, name } }) => (
            <input
              ref={ref}
              id="soft-preference-enabled"
              name={name}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-[--color-border]"
            />
          )}
        />
        <Label htmlFor="soft-preference-enabled" className="cursor-pointer font-normal">
          {mode === 'create' ? 'Active from the next generator run' : 'Active on the next generator run'}
        </Label>
      </div>
      {errors.enabled && (
        <p className="text-xs text-red-600" role="alert">
          {errors.enabled.message}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {submitLabel}
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
