import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { subjectFormSchema } from '@/types/subject.schemas'
import type { SubjectFormValues } from '@/types/subject.types'

const difficultyOptions = [
  { value: 'LOW', label: 'Low difficulty' },
  { value: 'MEDIUM', label: 'Medium difficulty' },
  { value: 'HIGH', label: 'High difficulty' },
] as const
const emptyValues: SubjectFormValues = { name: '', difficulty: 'LOW' }

interface SubjectFormProps {
  initialValues?: SubjectFormValues
  onCancel?: () => void
  onSubmit: (values: SubjectFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function SubjectForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: SubjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })

  useEffect(() => {
    reset(initialValues ?? emptyValues)
  }, [initialValues, reset])

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="subject-name">Subject name</Label>
        <Input
          id="subject-name"
          placeholder="e.g. Physics"
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
        <Label htmlFor="difficulty">Difficulty level</Label>
        <select
          id="difficulty"
          className="mt-1 block w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary]"
          {...register('difficulty')}
        >
          {difficultyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.difficulty && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.difficulty.message}
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
