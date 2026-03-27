import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { terminologySchema, type TerminologyFormData } from '@/features/settings/settings.schemas'
import { useTerminologyLabels, useUpdateTerminologyLabels } from '@/api/hooks/useSettings'
import type { TerminologyLabels } from '@/types/settings.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// SchediFlow default names shown as placeholder when the field is empty.
const DEFAULTS: Record<keyof TerminologyFormData, string> = {
  period: 'Period',
  class: 'Class',
  term: 'Term',
  cycle: 'Cycle',
  bellSchedule: 'Bell Schedule',
  room: 'Room',
  subject: 'Subject',
}

interface FieldRowProps {
  id: string
  label: string
  placeholder: string
  registration: ReturnType<ReturnType<typeof useForm<TerminologyFormData>>['register']>
}

function FieldRow({ id, label, placeholder, registration }: FieldRowProps) {
  return (
    <div className="grid grid-cols-2 items-center gap-4">
      <Label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        aria-label={label}
        {...registration}
      />
    </div>
  )
}

export function TerminologyForm() {
  const { data: labels, isLoading } = useTerminologyLabels()
  const {
    mutate: updateLabels,
    reset: resetMutation,
    isPending,
    isSuccess,
    error,
  } = useUpdateTerminologyLabels()

  // TanStack Query keeps isSuccess true until reset(); clear the banner after a short delay.
  useEffect(() => {
    if (!isSuccess) return
    const id = window.setTimeout(() => resetMutation(), 4000)
    return () => window.clearTimeout(id)
  }, [isSuccess, resetMutation])

  const { register, handleSubmit, reset } = useForm<TerminologyFormData>({
    resolver: zodResolver(terminologySchema),
    defaultValues: {
      period: '',
      class: '',
      term: '',
      cycle: '',
      bellSchedule: '',
      room: '',
      subject: '',
    },
  })

  // Populate form with current institution labels once loaded.
  useEffect(() => {
    if (labels) {
      reset({
        period: labels.period ?? '',
        class: labels.class ?? '',
        term: labels.term ?? '',
        cycle: labels.cycle ?? '',
        bellSchedule: labels.bellSchedule ?? '',
        room: labels.room ?? '',
        subject: labels.subject ?? '',
      })
    }
  }, [labels, reset])

  function onSubmit(data: TerminologyFormData) {
    updateLabels(data as TerminologyLabels)
  }

  if (isLoading) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Loading terminology settings…
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Terminology settings form" noValidate>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Rename SchediFlow&apos;s domain terms to match your school&apos;s language. Leave a field
        blank to restore the default SchediFlow term.
      </p>

      <div className="space-y-4">
        <FieldRow id="term-period" label="Period" placeholder={DEFAULTS.period} registration={register('period')} />
        <FieldRow id="term-class" label="Class" placeholder={DEFAULTS.class} registration={register('class')} />
        <FieldRow id="term-term" label="Term" placeholder={DEFAULTS.term} registration={register('term')} />
        <FieldRow id="term-cycle" label="Cycle" placeholder={DEFAULTS.cycle} registration={register('cycle')} />
        <FieldRow id="term-bellSchedule" label="Bell Schedule" placeholder={DEFAULTS.bellSchedule} registration={register('bellSchedule')} />
        <FieldRow id="term-room" label="Room" placeholder={DEFAULTS.room} registration={register('room')} />
        <FieldRow id="term-subject" label="Subject" placeholder={DEFAULTS.subject} registration={register('subject')} />
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">Failed to save terminology</p>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
        </div>
      )}

      {isSuccess && (
        <div role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">Terminology saved successfully.</p>
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Terminology'}
        </Button>
      </div>
    </form>
  )
}
