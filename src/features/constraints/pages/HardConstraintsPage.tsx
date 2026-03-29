import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  HardConstraintForm,
  hardConstraintRuleOptions,
} from '@/features/constraints/components/HardConstraintForm'
import {
  useCreateHardConstraint,
  useDeleteHardConstraint,
  useHardConstraints,
  useUpdateHardConstraint,
} from '@/api/hooks/useHardConstraints'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { HardConstraintDto, HardConstraintFormValues } from '@/types/hard-constraint.types'

function ruleLabel(ruleType: HardConstraintDto['ruleType']) {
  return hardConstraintRuleOptions.find((o) => o.value === ruleType)?.label ?? ruleType
}

export default function HardConstraintsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<HardConstraintDto | null>(null)
  const [toDelete, setToDelete] = useState<HardConstraintDto | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useHardConstraints()
  const rows = data?.content ?? []

  const {
    mutate: createConstraint,
    isPending: isCreating,
    error: createError,
  } = useCreateHardConstraint()
  const {
    mutate: updateConstraint,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateHardConstraint()
  const {
    mutate: deleteConstraint,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteHardConstraint()

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

  const handleEditClick = (row: HardConstraintDto) => {
    setStatusMessage(null)
    setEditing(row)
    setIsFormOpen(true)
  }

  const normalizeDescription = (v: string | undefined) => {
    const t = v?.trim()
    return t === '' ? undefined : t
  }

  const handleFormSubmit = (values: HardConstraintFormValues) => {
    if (editing) {
      const trimmed = values.description?.trim() ?? ''
      updateConstraint(
        {
          id: editing.id,
          data: {
            description: trimmed === '' ? null : trimmed,
            enabled: values.enabled,
          },
        },
        {
          onSuccess: () => {
            setStatusMessage(
              'Hard constraint updated. Changes apply on the next generator run; published timetables stay unchanged.',
            )
            handleFormClose()
          },
        },
      )
    } else {
      createConstraint(
        {
          ruleType: values.ruleType,
          description: normalizeDescription(values.description),
          enabled: values.enabled,
        },
        {
          onSuccess: () => {
            setStatusMessage(
              'Hard constraint saved. The scheduler will treat it as mandatory on every subsequent run.',
            )
            handleFormClose()
          },
        },
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!toDelete) return
    deleteConstraint(toDelete.id, {
      onSuccess: () => {
        setStatusMessage(
          'Hard constraint removed. The next generator run will no longer enforce this rule.',
        )
        setToDelete(null)
      },
    })
  }

  const queryErrorMessage = error ? getApiErrorMessage(error) : null
  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  const formInitialValues = useMemo<HardConstraintFormValues | undefined>(() => {
    if (!editing) return undefined
    return {
      ruleType: editing.ruleType,
      description: editing.description ?? '',
      enabled: editing.enabled,
    }
  }, [editing])

  const deleteDialogCancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!toDelete) return
    deleteDialogCancelRef.current?.focus()
  }, [toDelete])

  const definedTypes = new Set(rows.map((r) => r.ruleType))
  const canAddMore = definedTypes.size < hardConstraintRuleOptions.length

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Hard constraints
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Rules the engine must never break. If they cannot all be satisfied, you get a conflict
            report instead of a partial timetable.
          </p>
        </div>
        <Button type="button" onClick={handleAddClick} disabled={!canAddMore}>
          Add hard constraint
        </Button>
      </header>

      {!canAddMore && rows.length > 0 && (
        <p className="mb-4 text-sm text-[--color-text-secondary]">
          All built-in hard rules are already on your list. Remove one to add a different rule type.
        </p>
      )}

      <section aria-label="Hard constraints list" className="space-y-5">
        {isFormOpen && (
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {editing ? 'Edit hard constraint' : 'Add hard constraint'}
            </h2>
            <HardConstraintForm
              mode={editing ? 'edit' : 'create'}
              initialValues={formInitialValues}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              submitLabel={editing ? 'Save changes' : 'Save constraint'}
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
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
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

        {isLoading ? (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading hard constraints…
          </div>
        ) : rows.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-[--color-border] p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm text-[--color-text-secondary]">
              No hard constraints yet. Use <span className="font-medium">Add hard constraint</span>{' '}
              above so the generator knows which rules are mandatory.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface] text-[--color-text-secondary]">
                  <th className="px-4 py-3 text-left font-medium">Rule</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[--color-border] last:border-b-0">
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {ruleLabel(row.ruleType)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.enabled ? 'Enforced' : 'Disabled'}
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
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hard-constraint-delete-title"
          >
            <h2 id="hard-constraint-delete-title" className="text-base font-semibold text-red-950">
              Delete hard constraint?
            </h2>
            <p className="mt-2">
              Remove “{ruleLabel(toDelete.ruleType)}”? The next generator run will not apply this rule.
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
                {isDeleting ? 'Deleting…' : 'Delete constraint'}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
