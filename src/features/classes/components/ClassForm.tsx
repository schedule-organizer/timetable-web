import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { classFormSchema } from '@/types/class.schemas'
import type { ClassFormValues } from '@/types/class.types'

const emptyValues: ClassFormValues = { name: '', yearGroup: '' }

interface ClassFormProps {
  initialValues?: ClassFormValues
  onCancel?: () => void
  onSubmit: (values: ClassFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function ClassForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: ClassFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })

  useEffect(() => {
    reset(initialValues ?? emptyValues)
  }, [initialValues, reset])

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="name">Class name</Label>
        <Input
          id="name"
          placeholder="e.g. Year 7 Science"
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
        <Label htmlFor="yearGroup">
          Year group{' '}
          <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>
            (optional)
          </span>
        </Label>
        <Input
          id="yearGroup"
          placeholder="Year 7"
          className="mt-1"
          {...register('yearGroup')}
        />
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
