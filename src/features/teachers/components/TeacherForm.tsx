import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { teacherFormSchema } from '@/types/teacher.schemas'
import type { TeacherFormValues } from '@/types/teacher.types'

interface TeacherFormProps {
  initialValues?: TeacherFormValues
  onCancel?: () => void
  onSubmit: (values: TeacherFormValues) => void
  submitLabel: string
  isLoading?: boolean
}

export function TeacherForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: TeacherFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: initialValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="firstName">First name</Label>
        <Input
          id="firstName"
          placeholder="e.g. Jane"
          className="mt-1"
          autoComplete="given-name"
          {...register('firstName')}
        />
        {errors.firstName && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="lastName">Last name</Label>
        <Input
          id="lastName"
          placeholder="e.g. Doe"
          className="mt-1"
          autoComplete="family-name"
          {...register('lastName')}
        />
        {errors.lastName && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.lastName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="teacher@school.edu"
          className="mt-1"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">
          Phone{' '}
          <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>
            (optional)
          </span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+44 20 7946 0000"
          className="mt-1"
          autoComplete="tel"
          {...register('phone')}
        />
      </div>

      <div>
        <Label htmlFor="subjectQualifications">
          Subject qualifications{' '}
          <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>
            (comma separated)
          </span>
        </Label>
        <Input
          id="subjectQualifications"
          placeholder="Mathematics, Physics"
          className="mt-1"
          {...register('subjectQualifications')}
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
