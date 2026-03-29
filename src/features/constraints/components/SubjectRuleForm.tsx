import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { subjectRuleFormSchema } from '@/types/subject-rule.schemas'
import type { SubjectRuleFormValues } from '@/types/subject-rule.types'

const emptyValues: SubjectRuleFormValues = {
  name: '',
  description: '',
  constraintType: 'hard',
  weight: 5,
  enabled: true,
}

interface SubjectRuleFormProps {
  mode: 'create' | 'edit'
  initialValues?: SubjectRuleFormValues
  onCancel?: () => void
  onSubmit: (values: SubjectRuleFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function SubjectRuleForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: SubjectRuleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<SubjectRuleFormValues>({
    resolver: zodResolver(subjectRuleFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })

  useEffect(() => {
    reset(initialValues ?? emptyValues)
  }, [initialValues, reset])

  const constraintType = watch('constraintType')
  const weightValue = watch('weight')
  const isSoft = constraintType === 'soft'

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="subject-rule-name">Rule name</Label>
        <input
          id="subject-rule-name"
          type="text"
          placeholder='e.g. "Maximum 1 High-difficulty subject per class per cycle day"'
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
        <fieldset>
          <legend className="text-sm font-medium text-[--color-text-primary]">
            Constraint type
          </legend>
          <p className="mt-0.5 text-xs text-[--color-text-secondary]">
            Hard constraints are always enforced; soft constraints are satisfied as best as possible.
          </p>
          <div className="mt-2 flex gap-4">
            <Controller
              name="constraintType"
              control={control}
              render={({ field }) => (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="hard"
                      checked={field.value === 'hard'}
                      onChange={() => field.onChange('hard')}
                      className="h-4 w-4 border-[--color-border]"
                    />
                    <span className="text-sm text-[--color-text-primary]">Hard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="soft"
                      checked={field.value === 'soft'}
                      onChange={() => field.onChange('soft')}
                      className="h-4 w-4 border-[--color-border]"
                    />
                    <span className="text-sm text-[--color-text-primary]">Soft</span>
                  </label>
                </>
              )}
            />
          </div>
          {errors.constraintType && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.constraintType.message}
            </p>
          )}
        </fieldset>
      </div>

      {isSoft && (
        <div>
          <Label htmlFor="subject-rule-weight">
            Weight:{' '}
            <span className="font-semibold text-[--color-text-primary]">{weightValue}</span> / 10
          </Label>
          <p className="mt-0.5 text-xs text-[--color-text-secondary]">
            Higher weights are prioritised when the generator cannot satisfy all soft rules.
          </p>
          <Controller
            name="weight"
            control={control}
            render={({ field: { value, onChange, ref, name } }) => (
              <input
                ref={ref}
                id="subject-rule-weight"
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
      )}

      <div>
        <Label htmlFor="subject-rule-notes">Notes (optional)</Label>
        <textarea
          id="subject-rule-notes"
          rows={3}
          placeholder="Internal notes for your team."
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
              id="subject-rule-enabled"
              name={name}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-[--color-border]"
            />
          )}
        />
        <Label htmlFor="subject-rule-enabled" className="cursor-pointer font-normal">
          {mode === 'create'
            ? 'Active from the next generator run'
            : 'Active on the next generator run'}
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
