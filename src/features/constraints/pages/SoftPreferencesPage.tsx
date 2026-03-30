import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SoftPreferenceForm } from '@/features/constraints/components/SoftPreferenceForm'
import {
  useCreateSoftPreference,
  useDeleteSoftPreference,
  useSoftPreferences,
  useUpdateSoftPreference,
} from '@/api/hooks/useSoftPreferences'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { SoftPreferenceDto, SoftPreferenceFormValues } from '@/types/soft-preference.types'

const statusLabelMap: Record<
  'fully' | 'partially' | 'not',
  { title: string; description: string }
> = {
  fully: { title: 'Fully satisfied', description: 'The generator could honour this preference.' },
  partially: { title: 'Partially satisfied', description: 'Only some requests could be honoured.' },
  not: { title: 'Not satisfied', description: 'This preference was skipped in the run.' },
}

export default function SoftPreferencesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<SoftPreferenceDto | null>(null)
  const [toDelete, setToDelete] = useState<SoftPreferenceDto | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useSoftPreferences()
  const rows = data?.content ?? []
  const displayRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const weightDiff = b.weight - a.weight
        if (weightDiff !== 0) return weightDiff
        return a.name.localeCompare(b.name)
      }),
    [rows],
  )
  const satisfactionSummary = useMemo(
    () =>
      rows.reduce(
        (summary, preference) => {
          if (preference.satisfactionStatus) {
            summary[preference.satisfactionStatus] += 1
          }
          return summary
        },
        { fully: 0, partially: 0, not: 0 },
      ),
    [rows],
  )
  const satisfactionDetails = useMemo(
    () =>
      rows
        .filter((preference) => preference.satisfactionStatus)
        .map((preference) => ({
          id: preference.id,
          name: preference.name,
          status: preference.satisfactionStatus!,
        })),
    [rows],
  )
  const hasSatisfactionData = satisfactionDetails.length > 0
  const showEmptyState = !isLoading && rows.length === 0 && !error

  const {
    mutate: createPreference,
    isPending: isCreating,
    error: createError,
  } = useCreateSoftPreference()
  const {
    mutate: updatePreference,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateSoftPreference()
  const {
    mutate: deletePreference,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteSoftPreference()

  const mutationError = createError ?? updateError ?? deleteError
  const isFormSubmitting = isCreating || isUpdating

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditing(null)
  }

  const handleAddClick = () => {
    setStatusMessage(null)
    setEditing(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (row: SoftPreferenceDto) => {
    setStatusMessage(null)
    setEditing(row)
    setIsFormOpen(true)
  }

  const handleFormSubmit = (values: SoftPreferenceFormValues) => {
    if (editing) {
      const trimmedDescription = values.description?.trim() ?? ''
      updatePreference(
        {
          id: editing.id,
          data: {
            name: values.name.trim(),
            description: trimmedDescription === '' ? null : trimmedDescription,
            weight: values.weight,
            enabled: values.enabled,
          },
        },
        {
          onSuccess: () => {
            setStatusMessage(
              `Soft preference updated. The generator will use weight ${values.weight} on the next run; higher weights are prioritised.`,
            )
            handleFormClose()
          },
        },
      )
    } else {
      createPreference(
        {
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          weight: values.weight,
          enabled: values.enabled,
        },
        {
          onSuccess: () => {
            setStatusMessage(
              `Soft preference saved with weight ${values.weight}. The generator will attempt to honour it proportionally on the next run.`,
            )
            handleFormClose()
          },
        },
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!toDelete) return
    deletePreference(toDelete.id, {
      onSuccess: () => {
        setStatusMessage(
          'Soft preference removed. The next generator run will no longer consider this preference.',
        )
        setToDelete(null)
      },
    })
  }

  const queryErrorMessage = error ? getApiErrorMessage(error) : null
  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  const formInitialValues = useMemo<SoftPreferenceFormValues | undefined>(() => {
    if (!editing) return undefined
    return {
      name: editing.name,
      description: editing.description ?? '',
      weight: editing.weight,
      enabled: editing.enabled,
    }
  }, [editing])

  const deleteDialogCancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!toDelete) return
    deleteDialogCancelRef.current?.focus()
  }, [toDelete])

  useEffect(() => {
    if (!toDelete) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToDelete(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toDelete])

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Soft preferences
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Preferences the generator tries to honour. When it cannot satisfy all of them, higher
            weights are prioritised. The satisfaction report shows which were fully, partially, or
            not satisfied.
          </p>
        </div>
        <Button type="button" onClick={handleAddClick}>
          Add soft preference
        </Button>
      </header>

      <section aria-label="Soft preferences list" className="space-y-5">
        {isFormOpen && (
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
            <h2
              className="mb-4 text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {editing ? 'Edit soft preference' : 'Add soft preference'}
            </h2>
            <SoftPreferenceForm
              mode={editing ? 'edit' : 'create'}
              initialValues={formInitialValues}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              submitLabel={editing ? 'Save changes' : 'Save preference'}
              isLoading={isFormSubmitting}
            />
            {operationErrorMessage && (
              <p className="mt-4 text-xs text-red-700" role="alert">
                {operationErrorMessage}
              </p>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900"
          >
            {statusMessage}
          </div>
        )}

        {operationErrorMessage && !isFormOpen && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
            role="alert"
          >
            {operationErrorMessage}
          </div>
        )}

        {queryErrorMessage && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {queryErrorMessage}
          </div>
        )}

        <div
          className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4"
          aria-live="polite"
          aria-label="Generator satisfaction report"
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Generator satisfaction report
          </h3>
          {hasSatisfactionData ? (
            <>
              <div className="mt-2 flex flex-wrap gap-3">
                {(['fully', 'partially', 'not'] as const).map((key) => (
                  <div
                    key={key}
                    className="min-w-[120px] rounded-lg border border-dashed border-[--color-border] px-3 py-2"
                  >
                    <p className="text-xs uppercase tracking-wide text-[--color-text-secondary]">
                      {statusLabelMap[key].title}
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {satisfactionSummary[key]}
                    </p>
                  </div>
                ))}
              </div>
              <ul className="mt-3 space-y-1 text-sm text-[--color-text-secondary]">
                {satisfactionDetails.map((detail) => (
                  <li key={detail.id}>
                    <span className="font-medium text-[--color-text-primary]">{detail.name}</span>{' '}
                    — {statusLabelMap[detail.status].description}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-[--color-text-secondary]">
              Generator satisfaction data will appear here once a run completes. Run the scheduler and
              check back for fully/partially/not satisfied statuses.
            </p>
          )}
        </div>

        {isLoading ? (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading soft preferences…
          </div>
        ) : showEmptyState ? (
          <div
            className="rounded-lg border border-dashed border-[--color-border] p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm text-[--color-text-secondary]">
              No soft preferences yet. Use{' '}
              <span className="font-medium">Add soft preference</span> above to define preferences
              the generator will try to honour, weighted by priority.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface] text-[--color-text-secondary]">
                  <th className="px-4 py-3 text-left font-medium">Preference</th>
                  <th className="px-4 py-3 text-left font-medium">Weight</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.id} className="border-b border-[--color-border] last:border-b-0">
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {row.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.weight} / 10
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.enabled ? 'Active' : 'Disabled'}
                    </td>
                    <td
                      className="max-w-xs truncate px-4 py-3"
                      style={{ color: 'var(--color-text-secondary)' }}
                      title={row.description ?? undefined}
                    >
                      {row.description?.trim() ? row.description : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(row)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          aria-label={`Delete ${row.name}`}
                          onClick={() => setToDelete(row)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {toDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className="w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 shadow-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="soft-preference-delete-title"
            >
              <h2
                id="soft-preference-delete-title"
                className="text-base font-semibold text-red-950"
                role="heading"
              >
                Delete soft preference?
              </h2>
              <p className="mt-2">
                Remove "{toDelete.name}"? The next generator run will no longer consider this
                preference.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  ref={deleteDialogCancelRef}
                  type="button"
                  variant="secondary"
                  onClick={() => setToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete preference'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
