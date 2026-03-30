import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hardConstraintFormSchema } from '@/types/hard-constraint.schemas'
import type { HardConstraintFormValues, HardConstraintRuleType } from '@/types/hard-constraint.types'

export const hardConstraintRuleOptions: { value: HardConstraintRuleType; label: string }[] = [
  {
    value: 'TEACHER_NO_DOUBLE_BOOKING',
    label: 'Teacher cannot be double-booked',
  },
  {
    value: 'ROOM_CAPACITY_NOT_EXCEEDED',
    label: 'Room capacity must not be exceeded',
  },
  {
    value: 'CLASS_NO_DOUBLE_BOOKING',
    label: 'Class cannot be double-booked',
  },
]

const emptyValues: HardConstraintFormValues = {
  ruleType: 'TEACHER_NO_DOUBLE_BOOKING',
  description: '',
  enabled: true,
}

function ruleTypeLabel(ruleType: HardConstraintRuleType) {
  return hardConstraintRuleOptions.find((o) => o.value === ruleType)?.label ?? ruleType
}

interface HardConstraintFormProps {
  mode: 'create' | 'edit'
  initialValues?: HardConstraintFormValues
  onCancel?: () => void
  onSubmit: (values: HardConstraintFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function HardConstraintForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: HardConstraintFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<HardConstraintFormValues>({
    resolver: zodResolver(hardConstraintFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })

  useEffect(() => {
    reset(initialValues ?? emptyValues)
  }, [initialValues, reset])

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {mode === 'create' ? (
        <div>
          <Label htmlFor="hard-constraint-rule-type">Rule</Label>
          <select
            id="hard-constraint-rule-type"
            className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
            {...register('ruleType')}
          >
            {hardConstraintRuleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.ruleType && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.ruleType.message}
            </p>
          )}
        </div>
      ) : (
        initialValues && (
          <div>
            <p className="text-sm font-medium text-[--color-text-secondary]">Rule</p>
            <p className="mt-1 text-sm text-[--color-text-primary]">
              {ruleTypeLabel(initialValues.ruleType)}
            </p>
          </div>
        )
      )}

      <div>
        <Label htmlFor="hard-constraint-notes">Notes (optional)</Label>
        <textarea
          id="hard-constraint-notes"
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
              id="hard-constraint-enabled"
              name={name}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-[--color-border]"
            />
          )}
        />
        <Label htmlFor="hard-constraint-enabled" className="font-normal cursor-pointer">
          Enforce on every generator run
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
