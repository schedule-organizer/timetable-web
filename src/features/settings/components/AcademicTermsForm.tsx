import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { academicTermsFormSchema, type AcademicTermsFormValues } from '@/features/settings/cycle-term.schemas'
import { useAcademicTerms, useUpdateAcademicTerms } from '@/api/hooks/useAcademicTerms'
import { useLabels } from '@/hooks/useLabels'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getTermStatus, sortTermsChronologically } from '@/lib/cycle-term-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function statusLabel(status: NonNullable<ReturnType<typeof getTermStatus>>): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'upcoming':
      return 'Upcoming'
    case 'past':
      return 'Past'
    default:
      return status
  }
}

export function AcademicTermsForm() {
  const label = useLabels()
  const { data, isLoading } = useAcademicTerms()
  const {
    mutate: saveTerms,
    reset: resetMutation,
    isPending,
    isSuccess,
    error: saveError,
  } = useUpdateAcademicTerms()

  useEffect(() => {
    if (!isSuccess) return
    const id = window.setTimeout(() => resetMutation(), 4000)
    return () => window.clearTimeout(id)
  }, [isSuccess, resetMutation])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AcademicTermsFormValues>({
    resolver: zodResolver(academicTermsFormSchema),
    defaultValues: { terms: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'terms',
    keyName: 'fieldKey',
  })
  const termsWatch = useWatch({ control, name: 'terms' }) ?? []

  useEffect(() => {
    if (!data) return
    if (isDirty) return
    reset({ terms: sortTermsChronologically(data.terms) })
  }, [data, reset, isDirty])

  function onSubmit(values: AcademicTermsFormValues) {
    const payload = { terms: sortTermsChronologically(values.terms) }
    saveTerms(payload, {
      onSuccess: (saved) => {
        reset({ terms: sortTermsChronologically(saved.terms) })
      },
    })
  }

  function addTerm() {
    const today = dayjs().format('YYYY-MM-DD')
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `term-${Date.now()}-${Math.random().toString(16).slice(2)}`
    append({
      id,
      name: '',
      startDate: today,
      endDate: today,
    })
  }

  if (isLoading) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Loading {label('term').toLowerCase()}s…
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label={`Academic ${label('term')} form`} noValidate>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Create named date ranges for your school year. Terms are listed in chronological order with a status
        (upcoming, active, or past) based on today&apos;s date.
      </p>

      <div className="overflow-x-auto rounded-md border" style={{ borderColor: 'var(--color-border)' }}>
        <table
          className="w-full min-w-[640px] border-collapse text-sm"
          role="table"
          aria-label={`Academic ${label('term')}`}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface)' }}>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                {label('term')} name
              </th>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                Start date
              </th>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                End date
              </th>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                Status
              </th>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  No {label('term').toLowerCase()}s yet. Add one to get started.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => {
                const row = termsWatch[index]
                const rowErrors = errors.terms?.[index]
                const canShowStatus =
                  row &&
                  /^\d{4}-\d{2}-\d{2}$/.test(row.startDate) &&
                  /^\d{4}-\d{2}-\d{2}$/.test(row.endDate) &&
                  row.endDate >= row.startDate
                const status = canShowStatus
                  ? getTermStatus({ startDate: row.startDate, endDate: row.endDate })
                  : null
                const rowKey = String(field.fieldKey)

                return (
                  <tr key={rowKey} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 align-top">
                      <Label htmlFor={`term-name-${rowKey}`} className="sr-only">
                        {label('term')} name
                      </Label>
                      <Input
                        id={`term-name-${rowKey}`}
                        aria-label={`${label('term')} name`}
                        aria-invalid={Boolean(rowErrors?.name)}
                        aria-describedby={rowErrors?.name ? `term-name-${rowKey}-err` : undefined}
                        {...register(`terms.${index}.name`)}
                      />
                      <input type="hidden" {...register(`terms.${index}.id`)} />
                      {rowErrors?.name ? (
                        <p id={`term-name-${rowKey}-err`} className="mt-1 text-xs text-red-600" role="alert">
                          {rowErrors.name.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Label htmlFor={`term-start-${rowKey}`} className="sr-only">
                        Start date
                      </Label>
                      <Input
                        id={`term-start-${rowKey}`}
                        type="date"
                        aria-label="Start date"
                        aria-invalid={Boolean(rowErrors?.startDate)}
                        aria-describedby={rowErrors?.startDate ? `term-start-${rowKey}-err` : undefined}
                        {...register(`terms.${index}.startDate`)}
                      />
                      {rowErrors?.startDate ? (
                        <p id={`term-start-${rowKey}-err`} className="mt-1 text-xs text-red-600" role="alert">
                          {rowErrors.startDate.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Label htmlFor={`term-end-${rowKey}`} className="sr-only">
                        End date
                      </Label>
                      <Input
                        id={`term-end-${rowKey}`}
                        type="date"
                        aria-label="End date"
                        aria-invalid={Boolean(rowErrors?.endDate)}
                        aria-describedby={rowErrors?.endDate ? `term-end-${rowKey}-err` : undefined}
                        {...register(`terms.${index}.endDate`)}
                      />
                      {rowErrors?.endDate ? (
                        <p id={`term-end-${rowKey}-err`} className="mt-1 text-xs text-red-600" role="alert">
                          {rowErrors.endDate.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {status ? (
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)',
                          }}
                          aria-label={`Status: ${statusLabel(status)}`}
                        >
                          {statusLabel(status)}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {errors.terms?.message ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {errors.terms.message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={addTerm}>
          Add {label('term')}
        </Button>
        <Button type="submit" disabled={isPending || fields.length === 0}>
          {isPending ? 'Saving…' : `Save ${label('term')}s`}
        </Button>
      </div>

      {saveError ? (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">Failed to save {label('term').toLowerCase()}s</p>
          <p className="text-sm text-red-700">{getApiErrorMessage(saveError)}</p>
        </div>
      ) : null}

      {isSuccess ? (
        <div role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">{label('term')}s saved successfully.</p>
        </div>
      ) : null}
    </form>
  )
}
